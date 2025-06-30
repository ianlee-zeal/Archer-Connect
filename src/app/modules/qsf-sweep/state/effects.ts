import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '@app/models';
import { Page } from '@app/models/page';
import { QSFSweepBatch } from '@app/models/qsf-sweep/qsf-sweep-batch';
import { QSFSweepBatchResult } from '@app/models/qsf-sweep/qsf-sweep-batch-result';
import { QSFSweepCommitChangesRequest } from '@app/models/qsf-sweep/qsf-sweep-commit-changes-request';
import { QSFSweepCommitChangesResponse } from '@app/models/qsf-sweep/qsf-sweep-commit-changes-response';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import * as services from '@app/services';
import { AppState } from '@app/state';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { of } from 'rxjs';
import { RunQsfSweepModalComponent } from '../run-qsf-sweep-modal/run-qsf-sweep-modal.component';
import * as actions from './actions';

@Injectable()
export class QsfSweepEffects {
  constructor(
    private actions$: Actions,
    public modalService: services.ModalService,
    private qsfSweepService: services.QsfSweepService,
    private toastService: services.ToastService,
    private store$: Store<AppState>,
    private readonly documentsService: services.DocumentsService,
    private readonly toaster: services.ToastService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  openModal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.OpenRunQsfSweepModal),
    switchMap((action: { caseId: number, claimantsCount: number, onSave?: Function } & TypedAction<string>) => {
      this.modalService.show(RunQsfSweepModalComponent, {
        class: 'run-qsf-sweep-modal',
        initialState: {
          caseId: action.caseId,
          claimantsCount: action.claimantsCount,
          onSave: action.onSave,
        },
      });
      return [];
    }),
  ));

  runQsfSweep$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RunQsfSweep),
    mergeMap((action: { caseId: number; } & TypedAction<string>) => this.qsfSweepService.runQsfSweep(
      action.caseId,
    ).pipe(
      switchMap((qsfSweepBatch: QSFSweepBatch) => [actions.RunQsfSweepComplete({
        channelName: qsfSweepBatch?.channelName,
        statusId: qsfSweepBatch?.statusId,
      })]),
      catchError((error: any) => of(actions.Error({ errorMessage: error.message }))),
    )),
  ));

  checkQsfSweep$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CheckCaseSweepStatus),
    mergeMap((action: { caseId: number; } & TypedAction<string>) => this.qsfSweepService.checkCaseSweepStatus(
      action.caseId,
    ).pipe(
      switchMap((data: any) => [actions.CheckCaseSweepStatusComplete({ data })]),
      catchError((error: any) => of(actions.Error({ errorMessage: error.message }))),
    )),
  ));

  getQsfSweepBatchListRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetQsfSweepBatchListRequest),
    withLatestFrom(this.store$.select(projectSelectors.item)),
    mergeMap(([action, project]: [{
      gridParams: IServerSideGetRowsParamsExtended;
    }, Project]) => this.qsfSweepService.searchBatch(project.id, action.gridParams.request)
      .pipe(
        switchMap((response: Page<QSFSweepBatch>) => [actions.GetQsfSweepBatchListSuccess({
          agGridParams: action.gridParams,
          batches: response.items,
          totalRecords: response.totalRecordsCount,
        }),
        ]),
        catchError((error: string) => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getQsfSweepBatchListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetQsfSweepBatchListSuccess),
    tap((action: {
      agGridParams: IServerSideGetRowsParamsExtended;
      batches: QSFSweepBatch[];
      totalRecords: number;
    }) => {
      action.agGridParams.success({ rowData: action.batches, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getQsfSweepBatchResultListRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetQsfSweepBatchResultListRequest),
    mergeMap((action: {
      batchId: number;
      gridParams: IServerSideGetRowsParamsExtended;
    }) => this.qsfSweepService.searchBatchResult(action.batchId, action.gridParams.request)
      .pipe(
        switchMap((response: Page<QSFSweepBatchResult>) => [actions.GetQsfSweepBatchResultListSuccess({
          agGridParams: action.gridParams,
          results: response.items,
          totalRecords: response.totalRecordsCount,
        }),
        ]),
        catchError((error: string) => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getQsfSweepBatchResultListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetQsfSweepBatchResultListSuccess),
    tap((action: {
      agGridParams: IServerSideGetRowsParamsExtended;
      results: QSFSweepBatchResult[];
      totalRecords: number;
    }) => {
      action.agGridParams.success({ rowData: action.results, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  downloadDocument$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadDocument),
    mergeMap((action: { id: number }) => this.documentsService.downloadDocument(action.id).pipe(
      switchMap(() => [actions.DownloadDocumentComplete()]),
      catchError(() => of(actions.DownloadDocumentError())),
    )),
  ));

  downloadDocumentError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadDocumentError),
    tap(() => this.toaster.showError('Document was not found.')),
  ), { dispatch: false });

  downloadQSFSweepResultList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadQSFSweepResultList),
    mergeMap(action => this.qsfSweepService.exportQSFSweepResultList(action.batchId, action.exportRequest).pipe(
      switchMap((data: string) => [actions.DownloadQSFSweepResultListComplete({ channel: data })]),
      catchError((error: any) => of(actions.Error({ errorMessage: error.message }))),
    )),
  ));

  gotoResultDetailsPage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GotoResultDetailsPage),
    tap(({ batchId }: { batchId: number }) => this.router.navigate([`${this.router.url}/${batchId}`])),
  ), { dispatch: false });

  getQsfSweepBatchByIdRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetQsfSweepBatchByIdRequest),
    mergeMap((action: { batchId: number; } & TypedAction<string>) => this.qsfSweepService.getByBatchId(
      action.batchId,
    ).pipe(
      switchMap((data: any) => [actions.GetQsfSweepBatchByIdSuccess({ data })]),
      catchError((error: any) => of(actions.Error({ errorMessage: error.message }))),
    )),
  ));

  qsfSweepValidateCommitChangesRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.QsfSweepValidateCommitChangesRequest),
    mergeMap((action: { batchId: number; request: QSFSweepCommitChangesRequest }) => this.qsfSweepService.validateCommitChanges(
      action.batchId,
      action.request,
    ).pipe(
      switchMap((qsfCommitChangesResponse: QSFSweepCommitChangesResponse) => [actions.QsfSweepValidateCommitChangesSuccess({ qsfCommitChangesResponse })]),
      catchError((error: any) => of(actions.Error({ errorMessage: error.message }))),
    )),
  ));

  qsfSweepCommitChangesRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.QsfSweepCommitChangesRequest),
    mergeMap((action: { batchId: number; request: QSFSweepCommitChangesRequest }) => this.qsfSweepService.commitChanges(
      action.batchId,
      action.request,
    ).pipe(
      switchMap((qsfCommitChangesResponse: QSFSweepCommitChangesResponse) => [actions.QsfSweepCommitChangesSuccess({ qsfCommitChangesResponse })]),
      catchError((error: any) => of(actions.Error({ errorMessage: error.message }))),
    )),
  ));

  qsfSweepCommitChangesSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.QsfSweepCommitChangesSuccess),
    tap((action: {
      qsfCommitChangesResponse: QSFSweepCommitChangesResponse } & TypedAction<'[QSF Sweep] Qsf Sweep Commit Changes Success'>) => {
      if (action.qsfCommitChangesResponse.success) {
        this.toaster.showSuccess('Changes commited succesfully');
      } else {
        this.toaster.showError('Commit changes failed');
      }
    }),
  ), { dispatch: false });

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap((action: { errorMessage: string } & TypedAction<string>) => {
      this.toastService.showError(action.errorMessage);
    }),
  ), { dispatch: false });
}
