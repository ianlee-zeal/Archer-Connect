import * as documentBatchActions from './actions';
import * as documentBatchSelectors from './selectors';
import * as rootActions from '@app/state/root.actions';
import { DocumentBatchService } from '@app/services/api/document-batch.service';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { catchError, mergeMap, map, switchMap, concatMap, tap, exhaustMap, take } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { DocumentBatch } from '@app/models/document-batch-upload/document-batch';
import { Store } from '@ngrx/store';
import { DocumentBatchState } from './reducer';
import { Router } from '@angular/router';

@Injectable()
export class DocumentBatchEffects {
  constructor(
    private readonly store: Store<DocumentBatchState>,
    private readonly actions$: Actions,
    private readonly documentBatchService: DocumentBatchService,
    private router: Router
  ) { }

  getDocumentBatchUploadSettings$ = createEffect(() => this.actions$.pipe(
    ofType(documentBatchActions.getDocumentBatchUploadSettings),
    mergeMap(() => this.documentBatchService.GetDocumentBatchUploadSettings().pipe(
      map(settings => documentBatchActions.getDocumentBatchUploadSettingsSuccess({ settings })),
      catchError(errorMessage => of(documentBatchActions.error({ errorMessage }))),
    )),
  ));

  searchBatches$ = createEffect(() => this.actions$.pipe(
    ofType(documentBatchActions.searchBatches),
    mergeMap(action => this.documentBatchService.searchBatches(action.agGridParams.request).pipe(
      switchMap(response => {
        const documentBatches: DocumentBatch[] = response.items.map(item => DocumentBatch.toModel(item));
        return [
          documentBatchActions.searchBatchesSuccess(
            {
              documentBatches,
              agGridParams: action.agGridParams,
              totalRecords: response.totalRecordsCount,
            }),
        ]
      }),
      catchError(errorMessage => of(documentBatchActions.searchBatchesFailure({ errorMessage, agGridParams: action.agGridParams }))),
    )),
  ));

  searchBatchesComplete$ = createEffect(() => this.actions$.pipe(
    ofType(documentBatchActions.searchBatchesSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.documentBatches, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });


  uploadFiles$ = createEffect(() => this.actions$.pipe(
    ofType(documentBatchActions.uploadFile),
    concatMap(action =>
      this.store.select(documentBatchSelectors.isCancelled).pipe(
        take(1),
        concatMap(isCancelled => {
          if (isCancelled) {
            // effectively skip this upload by returning an empty observable
            return EMPTY;
          }
          return this.documentBatchService.uploadFile(action.file, action.batchId, action.isFinal).pipe(
            map(response => documentBatchActions.uploadFileSuccess({ response })),
            catchError(error => of(documentBatchActions.uploadFileFailure({ error }))),
          );
        }),
      )
    ),
  ));

  createBatch$ = createEffect(() => this.actions$.pipe(
    ofType(documentBatchActions.createBatch),
    exhaustMap(({ createBatchRequest }) =>
      this.documentBatchService.createBatch(createBatchRequest).pipe(
        map(response => documentBatchActions.createBatchSuccess({ response })),
        catchError(error => of(documentBatchActions.createBatchFailure({ error })))
      )
    )
  ));

  cancelBatch$ = createEffect(() => this.actions$.pipe(
    ofType(documentBatchActions.cancelUploadRequest),
    mergeMap(action =>
      this.documentBatchService.cancelUploadTask(action.batchId).pipe(
        map(() => documentBatchActions.cancelUploadTaskSuccess()),
        catchError(error => of(documentBatchActions.cancelUploadTaskFailure({ error }))),
      )
    ),
  ));

  getCaseOptions$ = createEffect(() => this.actions$.pipe(
    ofType(documentBatchActions.GetProjectOptionsRequest),
    mergeMap(action =>
      this.documentBatchService.searchProjects(action.search)
        .pipe(
          switchMap(response => {
            const projectOptions = response.items.map(item => ({ id: item.id, name: `${item.id} - ${item.name}` }));
            return [documentBatchActions.GetProjectOptionsSuccess({ projectOptions })];
          }),
          catchError(error => of(documentBatchActions.GetProjectOptionsError({ error }))),
        )
    ),
  ));

  gotoBatchDetails$ = createEffect(() => this.actions$.pipe(
    ofType(documentBatchActions.GoToBatchDetails),
    tap(action => {
      this.router.navigate(
        [`document-batches/details/${action.batchId}`],
        {
          state: {
            navSettings: action.navSettings,
          },
        },
      );
    }),
  ), { dispatch: false });

  getBatchDetails$ = createEffect(() => this.actions$.pipe(
    ofType(documentBatchActions.GetBatchDetails),
    mergeMap(action =>
      this.documentBatchService.getSingleBatch(action.batchId)
        .pipe(
          switchMap(response => {
            return [
              documentBatchActions.GetBatchDetailsSuccess({ response }),
              rootActions.LoadingFinished({ actionName: documentBatchActions.GetBatchDetails.type }),
            ];
          }),
          catchError(error => of(documentBatchActions.GetBatchDetailsFailure({ error }))),
        )
    ),
  ));

  getBatchStart$ = createEffect(() => this.actions$.pipe(
    ofType(documentBatchActions.GetBatchDetailsLoadingStarted),
    map(action => rootActions.LoadingStarted({ actionNames: action.additionalActionNames || [] })),
  ));


  getStatusTypes$ = createEffect(() => this.actions$.pipe(
    ofType(documentBatchActions.getStatusTypes),
    mergeMap(() => this.documentBatchService.getStatusTypes().pipe(
      map(statusTypes => documentBatchActions.getStatusTypesSuccess({ statusTypes })),
      catchError(errorMessage => of(documentBatchActions.error({ errorMessage }))),
    )),
  ));


}