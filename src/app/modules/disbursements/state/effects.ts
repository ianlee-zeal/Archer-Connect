import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  mergeMap,
  switchMap,
  catchError,
  tap,
} from 'rxjs/operators';

import { DisbursementsService, DocumentGenerationService } from '@app/services';
import { PaymentGridRecordLight, PaymentRequestSummary } from '@app/models';
import { Store } from '@ngrx/store';
import { StopPaymentRequestService } from '@app/services/api/stop-payment-request.service';
import * as actions from './actions';
import { DisbursementState } from './reducer';
import { TransferRequestSummary } from '@app/models/transfer-request/transfer-request-summary'
import { TransfersService } from '@app/services/api/transfers.service'

@Injectable()
export class DisbursementsEffects {
  constructor(
    private readonly disbursementsService: DisbursementsService,
    private readonly transfersService: TransfersService,
    private readonly documentGenerationService: DocumentGenerationService,
    private readonly actions$: Actions,
    private readonly docGenerationsService: DocumentGenerationService,
    private readonly stopPaymentRequestService: StopPaymentRequestService,
    private readonly store$: Store<DisbursementState>,
  ) { }

  readonly getDisbursementsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDisbursementsList),
    mergeMap(action => this.disbursementsService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetDisbursementsListComplete({
            disbursements: response.items.map(PaymentRequestSummary.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetDisbursementsListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  readonly getDisbursementsListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDisbursementsListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.disbursements, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  readonly getPaymentRequestDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentRequestDetails),
    mergeMap(action => this.disbursementsService.getPaymentRequestDetailsById(action.paymentRequestId, action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetPaymentRequestDetailsComplete({
            paymentRequestDetails: response.items,
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  readonly getPaymentRequestDetailsComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentRequestDetailsComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.paymentRequestDetails, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  readonly getPaymentRequestTotal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentRequestTotal),
    mergeMap(action => this.disbursementsService.getPaymentRequestTotalInfoById(action.paymentRequestId)
      .pipe(
        switchMap(paymentRequestTotal => [
          actions.GetPaymentRequestTotalComplete({ paymentRequestTotal })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  readonly getPaymentRequestVoidCountsById$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentRequestVoidCounts),
    mergeMap(action => this.disbursementsService.getPaymentRequestVoidCountsById(action.paymentRequestId)
      .pipe(
        switchMap(dictionary => [actions.GetPaymentRequestVoidCountsComplete({ voidedItems: dictionary.voided, otherItems: dictionary.other })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  readonly loadTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.LoadTemplates),
    mergeMap(action => this.documentGenerationService.getTemplates([action.entityTypeId], action.entityTypeId, action.documentTypes).pipe(
      switchMap(data => [
        actions.LoadTemplatesComplete({ data }),
      ]),
      catchError(errorMessage => of(actions.Error({ errorMessage }))),
    )),
  ));

  generateExtract$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GenerateExtract),
    mergeMap(action => this.disbursementsService.generateExtract(action.paymentRequestId, action.generationRequest, action.isManual)
      .pipe(
        switchMap(generationRequest => [actions.GenerateExtractComplete({ generationRequest })]),
        catchError(errorMessage => of(actions.Error({ errorMessage }))),
      )),
  ));

  startGeneratePaymentDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.StartGeneratePaymentDocumentsJob),
    mergeMap(action => this.disbursementsService.generatePaymentDocuments(action.request)
      .pipe(
        switchMap(() => [actions.StartGeneratePaymentDocumentsJobComplete({ paymentId: action.request.paymentId })]),
        catchError(errorMessage => of(actions.StartGeneratePaymentDocumentsJobError({ errorMessage, paymentId: action.request.paymentId }))),
      )),
  ));

  readonly startGeneratePaymentDocumentsError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.StartGeneratePaymentDocumentsJobError),
    tap(({ errorMessage }) => {
      this.store$.dispatch(actions.Error({ errorMessage }));
    }),
  ), { dispatch: false });

  downloadDocument$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadDocument),
    mergeMap(action => this.docGenerationsService.getLatestExports(action.generatorId)
      .pipe(
        switchMap(() => [actions.DownloadDocumentComplete()]),
        catchError(errorMessage => of(actions.Error({ errorMessage }))),
      )),
  ));

  downloadPaymentExtract$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadPaymentExtract),
    mergeMap(action => this.disbursementsService.getPaymentExtractDocument(action.paymentRequestId, action.generatorId)
      .pipe(
        switchMap(() => [actions.DownloadPaymentExtractComplete()]),
        catchError(errorMessage => of(actions.Error({ errorMessage }))),
      )),
  ));

  getStopPaymentRequestList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetStopPaymentRequestList),
    mergeMap(action => this.stopPaymentRequestService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetStopPaymentRequestListComplete({
            stopPaymentRequestList: response.items.map(PaymentGridRecordLight.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          }),
        ]),
        catchError(errorMessage => of(actions.Error({ errorMessage }))),
      )),
  ));

  getStopPaymentRequestListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetStopPaymentRequestListComplete),
    tap(action => {
      action.agGridParams?.success({ rowData: action.stopPaymentRequestList, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  downloadAttachments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadAttachments),
    mergeMap(action => this.disbursementsService
      .downloadAttachments(action.id)
      .pipe(catchError(errorMessage => of(actions.Error({ errorMessage }))))),
  ), { dispatch: false });

  readonly getTransferRequestsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTransferRequestsList),
    mergeMap(action => this.transfersService.searchTransferRequests(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetTransferRequestsListComplete({
            transferRequests: response.items.map(TransferRequestSummary.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetDisbursementsListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  readonly getTransferRequestsListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTransferRequestsListComplete),
    tap(action => {
      action.agGridParams.success({
        rowData: action.transferRequests,
        rowCount: action.totalRecords
      });
    }),
  ), { dispatch: false });

  readonly getTransferRequestDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTransferRequestDetails),
    mergeMap(action => this.transfersService.getPaymentRequestDetailsById(action.transferRequestId, action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetTransferRequestDetailsComplete({
            transferRequestDetails: response.items,
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  readonly getTransferRequestDetailsComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTransferRequestDetailsComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.transferRequestDetails, rowCount: action.totalRecords });
    }),
  ), { dispatch: false });

  readonly getTransferRequestTotal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTransferRequestTotal),
    mergeMap(action => this.transfersService.getTransferRequestTotalInfoById(action.transferRequestId)
      .pipe(
        switchMap(transferRequestTotal => [
          actions.GetTransferRequestTotalComplete({ transferRequestTotal })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  readonly downloadTransferExtract$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadTransferExtract),
    mergeMap(action => this.documentGenerationService.getLatestExports(action.generatorId)
      .pipe(
        switchMap(() => [actions.DownloadTransferExtractComplete()]),
        catchError(errorMessage => of(actions.Error({ errorMessage }))),
      )),
  ));

  readonly getTransferRequestVoidCountsById$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTransferRequestVoidCounts),
    mergeMap(action => this.transfersService.getPaymentRequestVoidCountsById(action.transferRequestId)
      .pipe(
        switchMap(dictionary => [actions.GetTransferRequestVoidCountsComplete({ voidedItems: dictionary.voided, otherItems: dictionary.other })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  readonly generateTransferExtract$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GenerateTransferExtract),
    mergeMap(action => this.transfersService.generateExtract(action.transferRequestId, action.generationRequest.channelName, action.batchActionTemplateId)
      .pipe(
        switchMap(generationRequest => [actions.GenerateTransferExtractComplete({ generationRequest })]),
        catchError(errorMessage => of(actions.Error({ errorMessage }))),
      )),
  ));

  readonly downloadTransferAttachments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadTransferAttachments),
    mergeMap(action => this.transfersService
      .downloadAttachments(action.id)
      .pipe(catchError(errorMessage => of(actions.Error({ errorMessage }))))),
  ), { dispatch: false });
}
