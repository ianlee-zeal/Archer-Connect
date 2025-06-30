import { Injectable } from '@angular/core';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Store } from '@ngrx/store';
import { EMPTY, of } from 'rxjs';
import { ElectionFormsService, ToastService } from '@app/services';
import { ElectionForm } from '@app/models/election-form';
import * as electionFormsActions from './actions';
import { ElectionFormsState } from './reducer';

@Injectable()
export class ElectionFormsEffects {
  constructor(
    private actions$: Actions,
    private store: Store<ElectionFormsState>,
    private electionFormsService: ElectionFormsService,
    private readonly toaster: ToastService,
  ) { }


  getElectionFormsGrid$ = createEffect(() => this.actions$.pipe(
    ofType(electionFormsActions.GetElectionFormsGrid),
    mergeMap(action => this.electionFormsService.getElectionForms(action.agGridParams.request, action.projectId)
      .pipe(switchMap(response => {
        const searches = response.items.map(ElectionForm.toModel);
        return [
          electionFormsActions.GetElectionFormsGridComplete({
            electionFormsGrid: searches,
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          }),
        ];
      }),
      catchError(error => of(electionFormsActions.Error({ errorMessage: error }))))),
  ));


  GetElectionFormsGridComplete$ = createEffect(() => this.actions$.pipe(
    ofType(electionFormsActions.GetElectionFormsGridComplete),
    tap(action => {
      action.agGridParams?.success({ rowData: action.electionFormsGrid, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });


  export$ = createEffect(() => this.actions$.pipe(
    ofType(electionFormsActions.ExportElectionForms),
    mergeMap(action => this.electionFormsService.export(action.exportRequest)
      .pipe(switchMap(() => EMPTY),
        catchError(error => of(electionFormsActions.Error({ errorMessage: error }))))),
  ));


  error$ = createEffect(() => this.actions$.pipe(
    ofType(electionFormsActions.Error),
    tap(action => {
      this.toaster.showError(action.errorMessage);
    }),
  ), { dispatch: false });
}
