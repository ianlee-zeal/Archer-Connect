import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import * as services from '@app/services';
import { ToastService } from '@app/services';
import { InjuryEvent } from '@app/models/injury-event';
import * as injuryEventsListActions from './actions';
import { IInjuryEventsListState } from './reducer';
import { injuryEventListSelectors } from './selectors';

@Injectable()
export class InjuryEventsListEffects {
  constructor(
    private injuryService: services.InjuryService,
    private store: Store<IInjuryEventsListState>,
    private actions$: Actions,
    private toaster: ToastService,
  ) { }


  getInjuryEventsList$ = createEffect(() => this.actions$.pipe(
    ofType(injuryEventsListActions.GetInjuryEventsList),
    mergeMap(action => this.injuryService.index({ claimantId: action.claimantId, gridParams: action.params.request }).pipe(
      switchMap(response => {
        const injuryEvents: InjuryEvent[] = response.items.map(item => InjuryEvent.toModel(item));
        return [injuryEventsListActions.GetInjuryEventsListComplete({
          injuryEvents,
          agGridParams: action.params,
          totalRecords: response.totalRecordsCount,
        })];
      }),
    )),
  ));


  getInjuryEventsListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(injuryEventsListActions.GetInjuryEventsListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.injuryEvents, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });


  refreshInjuryEventsList$ = createEffect(() => this.actions$.pipe(
    ofType(injuryEventsListActions.RefreshInjuryEventsList),
    withLatestFrom(this.store.select(injuryEventListSelectors.agGridParams)),
    mergeMap(([action, agGridParams]) => {
      const { claimantId } = action;
      return [injuryEventsListActions.GetInjuryEventsList({ claimantId, params: agGridParams })];
    }),
  ));


  saveInjuryEvent$ = createEffect(() => this.actions$.pipe(
    ofType(injuryEventsListActions.SaveInjuryEvent),
    mergeMap(action => (action.injuryEvent.id ? this.injuryService.put(action.injuryEvent) : this.injuryService.post(action.injuryEvent))
      .pipe(
        switchMap(() => {
          const claimantId: number = action.injuryEvent.clientIds.length && action.injuryEvent.clientIds[0];
          this.toaster.showSuccess(action.injuryEvent.id ? 'Injury event was updated' : 'Injury event was created');
          action.successCallback();
          return [injuryEventsListActions.RefreshInjuryEventsList({ claimantId })];
        }),
      )),
  ));


  deleteInjuryEvent$ = createEffect((): any => this.actions$.pipe(
    ofType(injuryEventsListActions.DeleteInjuryEvent),
    mergeMap(action => (this.injuryService.delete(action.injuryEvent.id)).pipe(
      switchMap(() => {
        const claimantId: number = action.injuryEvent.clientIds.length && action.injuryEvent.clientIds[0];
        this.toaster.showSuccess('Injury event was deleted');
        action.successCallback();
        return [
          injuryEventsListActions.DeleteInjuryEventComplete(),
          injuryEventsListActions.RefreshInjuryEventsList({ claimantId }),
        ];
      }),
    )),
  ));
}
