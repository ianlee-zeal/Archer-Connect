import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { DocumentIntakeService } from '@app/services/api/document-intake.service';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DocumentIntakeItem } from '@app/models';
import { of } from 'rxjs';
import { actions } from '.';

@Injectable()
export class DocumentIntakeEffects {
  constructor(
    private documentIntakeService: DocumentIntakeService,
    private actions$: Actions,
  ) { }


  getDocumentIntakeList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentIntakeListRequest),
    mergeMap(action => this.documentIntakeService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetDocumentIntakeListSuccess({
            documentIntakes: response.items.map(DocumentIntakeItem.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetDocumentIntakeListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));


  getDocumentIntakeListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentIntakeListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.documentIntakes, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });
}
