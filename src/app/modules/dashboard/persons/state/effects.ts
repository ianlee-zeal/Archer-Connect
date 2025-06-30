/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  mergeMap,
  switchMap,
  catchError,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { PersonsService, ToastService } from '@app/services';
import { ExportName } from '@app/models/enums';
import { Person } from '@app/models';
import { PersonState, selectors, actions } from '.';

@Injectable()
export class PersonsEffects {
  constructor(
    private personsService: PersonsService,
    private store$: Store<PersonState>,
    private actions$: Actions,
    private router: Router,
    private toaster: ToastService,
  ) { }

  getAGPersonsList$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetPersonsList),
    mergeMap(action => this.personsService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetPersonsListComplete({
            persons: response.items.map(Person.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetPersonsListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  refreshPersonsList$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.RefreshPersonsList),
    withLatestFrom(this.store$.select(selectors.agGridParams)),
    switchMap(([, agGridParams]) => [
      actions.GetPersonsList({ agGridParams }),
    ]),
  ));

  getAGPersonsListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPersonsListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.persons, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getAGPersonsListError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPersonsListError),
    tap(action => {
      console.error(action.errorMessage); // eslint-disable-line no-console
      action.agGridParams.fail();
    }),
  ), { dispatch: false });

  downloadPersons$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DownloadPersons),
    mergeMap(action => this.personsService.export(
      ExportName[ExportName.Persons],
      action.searchOptions,
      action.columns,
      action.channelName,
    ).pipe(
      switchMap(data => [actions.DownloadPersonsComplete({ channel: data })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  downloadDocuments$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DownloadPersonsDocument),
    mergeMap(action => this.personsService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  // Create
  createPerson$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.CreatePerson),
    mergeMap(action => this.personsService.post(action.person).pipe(
      switchMap(person => [
        actions.CreatePersonComplete({ personId: person.id, modal: action.modal }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  createPersonSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreatePersonComplete),
    tap(({ personId, modal }) => {
      modal.hide();
      this.router.navigate([`dashboard/persons/${personId}`]);
      this.toaster.showSuccess('New person was created');
    }),
  ), { dispatch: false });

  // Delete

  deletePerson$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeletePerson),
    mergeMap(action => this.personsService.delete(action.id).pipe(
      switchMap(() => [
        actions.DeletePersonComplete(),
        actions.RefreshPersonsList(),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  deletePersonComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeletePersonComplete),
    tap(() => this.toaster.showSuccess('Selected person was deleted')),
  ), { dispatch: false });

  goBack$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoBack),
    withLatestFrom(this.store$.select(selectors.personPreviousUrl)),
    tap(([, personPreviousUrl]) => {
      personPreviousUrl
        ? this.router.navigate([personPreviousUrl])
        : this.router.navigate(['dashboard', 'persons'], { state: { restoreSearch: true } });
    }),
  ), { dispatch: false });
}
