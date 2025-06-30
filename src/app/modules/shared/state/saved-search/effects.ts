import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap, debounceTime, distinctUntilChanged, withLatestFrom } from 'rxjs/operators';
import { ToastService } from '@app/services';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromAuth from '@app/modules/auth/state';
import * as actions from './actions';
import * as services from '../../../../services';
import { SavedSearch } from '../../../../models/saved-search';
import { savedSearchSelectors } from './selectors';
import * as fromShared from '..';

@Injectable()
export class SavedSearchEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly savedSearchService: services.SavedSearchService,
    private readonly toaster: ToastService,
    private readonly store: Store<fromShared.AppState>,
  ) { }

  getSavedSearchList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSavedSearchList),
    // TODO When the route is able to give up all saved searches, remove the EntityType parameter.
    mergeMap(action => this.savedSearchService.index({ entityType: action.entityType })
      .pipe(
        switchMap(savedSearchList => [actions.GetSavedSearchListComplete({ savedSearchList })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getSavedSearchesGrid$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSavedSearchesGrid),
    withLatestFrom(
      this.store.select(fromAuth.authSelectors.getUser),
    ),
    mergeMap(([action, user]) => this.savedSearchService.search({
      ...action.agGridParams?.request,
      userId: user.id,
      orgId: user.selectedOrganization.id,
    })
      .pipe(
        switchMap(response => {
          const searches: any[] = response.items.map(n => ({ currentUserId: user.id, ...n }));
          return [
            actions.GetSavedSearchesGridComplete({
              savedSearchesGrid: searches.map(SavedSearch.toModel),
              agGridParams: action.agGridParams,
              totalRecords: response.totalRecordsCount,
            }),
          ];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  setLastRunDate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SetLastRunDate),
    mergeMap(action => this.savedSearchService.setLastRunDate(action.id).pipe(
      switchMap(() => []),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));

  refreshSavedSearchesGrid$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshSavedSearchesGrid),
    withLatestFrom(this.store.select(savedSearchSelectors.agGridParams)),
    switchMap(([, agGridParams]) => [
      actions.GetSavedSearchesGrid({ agGridParams }),
    ]),
  ));

  GetSavedSearchesGridComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSavedSearchesGridComplete),
    tap(action => {
      action.agGridParams?.success({ rowData: action.savedSearchesGrid, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  GetUsersOptions$ = createEffect(() => this.actions$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    ofType(actions.GetUsersOptionsRequest),
    mergeMap(action => this.savedSearchService.getUsers(
      {
        orgId: action.orgId,
        sortModel: [{ colId: 'displayName', sort: 'asc' }],
      },
      action.search,
    )
      .pipe(
        switchMap(response => {
          const userModels = response.map(user => ({ id: user.id, name: user.name }));
          return [
            actions.GetUsersOptionsComplete({ users: userModels }),
          ];
        }),
      )),
  ));

  getSavedSearchListByEntityType$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSavedSearchListByEntityType),
    mergeMap(action => this.savedSearchService.index({ entityType: action.entityType })
      .pipe(
        switchMap(savedSearchList => [actions.GetSavedSearchListByEntityTypeComplete({ savedSearchList })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getSavedSearch$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSavedSearch),
    mergeMap(action => this.savedSearchService.getSavedSearchById(action.id)
      .pipe(
        switchMap(savedSearch => [actions.GetSavedSearchComplete({ entityType: action.entityType, savedSearch: SavedSearch.toModel(savedSearch) })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  deleteSavedSearch$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteSavedSearch),
    mergeMap(action => this.savedSearchService.deleteSavedSearch(action.id)
      .pipe(
        switchMap(() => [actions.DeleteSavedSearchComplete(),
          actions.GetSavedSearchList({ entityType: action.entityType }),
          actions.SwitchEditState({ isEdited: false })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  deleteSavedSearchComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteSavedSearchComplete),
    tap(() => {
      this.toaster.showSuccess('Search was deleted');
    }),
  ), { dispatch: false });

  deleteSavedSearchByIdRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteSavedSearchByIdRequest),
    mergeMap(action => this.savedSearchService.deleteSavedSearch(action.id)
      .pipe(
        switchMap(() => [actions.DeleteSavedSearchByIdRequestComplete(),
          actions.GetSavedSearchList({ entityType: action.entityType }),
          actions.SwitchEditState({ isEdited: false }),
          actions.RefreshSavedSearchesGrid(),
        ]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  deleteSavedSearchByIdRequestComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteSavedSearchByIdRequestComplete),
    tap(() => {
      this.toaster.showSuccess('Search was deleted');
    }),
  ), { dispatch: false });

  saveSearch$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveSearch),
    mergeMap(action => (action.search.id
      ? this.savedSearchService.put(SavedSearch.toDto(action.search))
      : this.savedSearchService.post(SavedSearch.toDto(action.search)))
      .pipe(
        switchMap((savedSearch: SavedSearch) => {
          this.toaster.showSuccess(action.search.id ? 'Search was updated' : 'Search was created');
          return [
            actions.GetSavedSearchList({ entityType: action.search.entityType }),
            actions.ResetRemovedSearches({ entityType: action.search.entityType }),
            actions.RefreshSavedSearchesGrid(),
            actions.SwitchEditState({ isEdited: false }),
            actions.GetSavedSearchComplete({ entityType: action.search.entityType, savedSearch: SavedSearch.toModel(savedSearch) }),
          ];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));
}
