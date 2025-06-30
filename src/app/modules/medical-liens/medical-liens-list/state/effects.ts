import { Injectable } from '@angular/core';

import { of } from 'rxjs';
import { catchError, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { MedicalLiensOverviewItem } from '@app/models/medical-liens-overview-item';
import * as services from '@app/services';
import * as medicalLiensListActions from './actions';
import { MedicalLiensListState } from './reducer';
import { medicalLiensListSelectors } from './selectors';


@Injectable()
export class MedicalLiensListEffects {
  constructor(
    private clientsService: services.ClientsService,
    private store: Store<MedicalLiensListState>,
    private actions$: Actions,
    private toaster: services.ToastService,
  ) { }


  getMedicalLiensList$ = createEffect(() => this.actions$.pipe(
    ofType(medicalLiensListActions.GetMedicalLiensList),
    withLatestFrom(this.store.select(medicalLiensListSelectors.entireState)),
    mergeMap(([action]) => this.clientsService.getMedicalLiensOverview(action.claimantId, action.agGridParams.request)
      .pipe(
        switchMap(response => {
          const medicalLiens = response.items.map(item => MedicalLiensOverviewItem.toModel(item));
          return [medicalLiensListActions.GetMedicalLiensListComplete({
            medicalLiens,
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          }),
          ];
        }),
        catchError(error => of(medicalLiensListActions.Error({ errorMessage: error }))),
      )),
  ));


  getAGMedicalLiensListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(medicalLiensListActions.GetMedicalLiensListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.medicalLiens, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });


  getAGMedicalLiensListError$ = createEffect(() => this.actions$.pipe(
    ofType(medicalLiensListActions.Error),
    tap(action => {
      this.toaster.showError(action.errorMessage)
    }),
  ), { dispatch: false });
}
