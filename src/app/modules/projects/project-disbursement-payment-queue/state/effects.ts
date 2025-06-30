import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, mergeMap, switchMap, tap, filter } from 'rxjs/operators';
import { SelectHelper } from '@app/helpers/select.helper';
import { ColumnExport } from '@app/models';
import { EntityTypeEnum, ExportName, ProductCategory } from '@app/models/enums';
import { PaymentQueue } from '@app/models/payment-queue';
import { PaymentQueueCounts } from '@app/models/payment-queue-counts';
import { EntityStatusesService, StagesService, ToastService, MessageService } from '@app/services';
import { LedgersService } from '@app/services/api/ledgers.service';
import { PaymentQueueService } from '@app/services/api/payment-queue.service';
import { TypedAction } from '@ngrx/store/src/models';
import { of } from 'rxjs';
import * as paymentQueueActions from './actions';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { BatchActionsService } from '@app/services/api/batch-actions.service';
import { BatchAction } from '@app/models/batch-action/batch-action';
@Injectable()
export class PaymentQueueEffects {
  constructor(
    private actions$: Actions,
    private paymentQueueService: PaymentQueueService,
    private ledgersService: LedgersService,
    private stageService: StagesService,
    private entityStatusesService: EntityStatusesService,
    private readonly toaster: ToastService,
    private batchActionsService: BatchActionsService,
    private messageService: MessageService
  ) { }

  getPaymentQueueGrid$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetPaymentQueueGrid),
    switchMap(action => this.paymentQueueService.getPaymentQueue(action.agGridParams.request, action.projectId)
      .pipe(
        switchMap(response => {
          const searches = response.items.map(PaymentQueue.toModel);
          return [
            paymentQueueActions.GetPaymentQueueGridComplete({
              paymentQueueGrid: searches,
              agGridParams: action.agGridParams,
              totalRecords: response.totalRecordsCount,
            }),
          ];
        }),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getPaymentQueueGridComplete$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetPaymentQueueGridComplete),
    tap(action => {
      action.agGridParams?.success({ rowData: action.paymentQueueGrid, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getSelectedPaymentQueueGrid$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetSelectedPaymentQueueGrid),
    mergeMap(action => (action.projectId == null
      ? this.paymentQueueService.searchPaymentQueue(action.searchOpts)
      : this.paymentQueueService.getPaymentQueue(action.searchOpts, action.projectId))
      .pipe(
        switchMap(response => {
          const searches = response.items.map(PaymentQueue.toModel);
          return [
            paymentQueueActions.GetSelectedPaymentQueueGridComplete({
              paymentQueueGrid: searches,
              agGridParams: action.agGridParams,
              totalRecords: response.totalRecordsCount,
            }),
          ];
        }),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getSelectedPaymentQueueGridComplete$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetSelectedPaymentQueueGridComplete),
    tap(action => {
      action.agGridParams?.success({ rowData: action.paymentQueueGrid, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getActiveLienPaymentStages$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetActiveLienPaymentStages),
    mergeMap(() => this.stageService.getByEntityTypeId(EntityTypeEnum.LienPayment, true)
      .pipe(
        switchMap(stages => ([paymentQueueActions.GetActiveLienPaymentStagesSuccess({ stages: SelectHelper.toOptions(stages) })])),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getLienPaymentStages$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetLienPaymentStages),
    mergeMap(() => this.stageService.getByEntityTypeId(EntityTypeEnum.LienPayment)
      .pipe(
        switchMap(stages => ([paymentQueueActions.GetLienPaymentStagesSuccess({ stages: SelectHelper.toOptions(stages) })])),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getLienStatuses$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetLienStatuses),
    mergeMap(() => this.entityStatusesService.getList(EntityTypeEnum.LienProducts)
      .pipe(
        switchMap((statuses: any[]) => ([paymentQueueActions.GetLienStatusesSuccess({ statuses: SelectHelper.toOptions(statuses) })])),
        catchError((error: any) => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getBankruptcyStatuses$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetBankruptcyStatuses),
    mergeMap(() => this.stageService.getDropdownByProductCategories([ProductCategory.Bankruptcy], EntityTypeEnum.Clients)
      .pipe(
        switchMap((options: any[]) => ([paymentQueueActions.GetBankruptcyStatusesSuccess({ options: SelectHelper.toOptions(options) })])),
        catchError((error: any) => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getBankruptcyStages$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetBankruptcyStages),
    mergeMap(() => this.stageService.getDropdownByProductCategories([ProductCategory.Bankruptcy], EntityTypeEnum.Bankruptcies)
      .pipe(
        switchMap((options: any[]) => ([paymentQueueActions.GetBankruptcyStagesSuccess({ options: SelectHelper.toOptions(options) })])),
        catchError((error: any) => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getPaymentQueueCounts$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetPaymentQueueCounts),
    mergeMap(action => this.paymentQueueService.getPaymentQueueCounts(action.projectId, action.agGridParams.request)
      .pipe(
        switchMap(response => [
          paymentQueueActions.GetPaymentQueueCountsComplete({ paymentQueueCounts: PaymentQueueCounts.toModel(response) }),
        ]),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  exportRemittanceDetailsGeneration$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.ExportRemittanceDetailsGeneration),
    mergeMap(action => this.paymentQueueService.generateRemittanceDetails(action.generationRequest)
      .pipe(
        switchMap(generationRequest => [paymentQueueActions.ExportRemittanceDetailsGenerationComplete({ generationRequest })]),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getChartOfAccountGroupNumbers$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetChartOfAccountGroupNumbers),
    mergeMap(action => this.paymentQueueService.getChartOfAccountGroupNumbers(action.projectId)
      .pipe(
        switchMap(response => [
          paymentQueueActions.GetChartOfAccountGroupNumbersComplete({ coaGroupNumbers: response }),
        ]),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getChartOfAccountNumbers$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetChartOfAccountNumbers),
    mergeMap(action => this.paymentQueueService.getGetChartOfAccountNumbers(action.projectId)
      .pipe(
        switchMap(response => [
          paymentQueueActions.GetChartOfAccountNumbersComplete({ coaNumbers: response }),
        ]),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getLedgerEntryStatuses$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetLedgerEntryStatuses),
    mergeMap(() => this.ledgersService.getLedgerEntryStatuses()
      .pipe(
        switchMap(response => [
          paymentQueueActions.GetLedgerEntryStatusesComplete({ ledgerEntryStatuses: response }),
        ]),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  downloadStandardRequest$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.DownloadStandardRequest),
    mergeMap(action => this.paymentQueueService.downloadStandardRequest(
      action.id,
      ExportName[ExportName.PaymentQueue],
      action.searchOptions,
      action.columns,
      action.channelName,
    ).pipe(
      switchMap(data => [paymentQueueActions.DownloadStandardRequestSuccess({ channel: data })]),
      catchError(errorMessage => of(paymentQueueActions.Error({ errorMessage }))),
    )),
  ));

  downloadStandardDocument$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.DownloadStandardDocument),
    mergeMap(action => this.paymentQueueService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError(errorMessage => of(paymentQueueActions.Error({ errorMessage }))),
    )),
  ));

  downloadCheckTableRequest$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.DownloadCheckTableRequest),
    mergeMap((action: { id: number;
      searchOptions: IServerSideGetRowsRequestExtended;
      columns: ColumnExport[];
      channelName: string; } & TypedAction<string>) => this.paymentQueueService.downloadCheckTableRequest(
      action.id,
      ExportName[ExportName.PaymentQueue],
      action.searchOptions,
      action.columns,
      action.channelName,
    ).pipe(
      switchMap((data: string) => [paymentQueueActions.DownloadCheckTableRequestSuccess({ channel: data })]),
      catchError((errorMessage: string) => of(paymentQueueActions.Error({ errorMessage }))),
    )),
  ));

  downloadCheckTableDocument$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.DownloadCheckTableDocument),
    mergeMap((action: { id: number; } & TypedAction<string>) => this.paymentQueueService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError((errorMessage: string) => of(paymentQueueActions.Error({ errorMessage }))),
    )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.Error),
    tap(({ errorMessage }) => {
      this.toaster.showError(errorMessage);
    }),
  ), { dispatch: false });


  batchValidateAuthorizeLedgerEntries$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.ValidateAuthorizeLedgerEntriesRequest),
    mergeMap(action => this.batchActionsService.create(action.batchAction).pipe(
      switchMap((batchActionResult: BatchAction) => {
        const batchAction = BatchAction.toModel(batchActionResult);
        return this.batchActionsService.process(batchAction.id).pipe(
          switchMap(() => [
            paymentQueueActions.ValidateAuthorizeLedgerEntriesRequestSuccess({ batchAction })
          ]),
          catchError((error: any) => of(paymentQueueActions.ValidateAuthorizeLedgerEntriesRequestError({ errorMessage: error.errorMessage }))),
        );
      }),
      catchError((error: any) => of(paymentQueueActions.ValidateAuthorizeLedgerEntriesRequestError({ errorMessage: error.errorMessage }))),
    )),
  ));

  batchValidateAuthorizeLedgerEntriesError$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.ValidateAuthorizeLedgerEntriesRequestError),
    switchMap(action => this.messageService.showAlertDialog(
      'Authorize Ledger Entries Error',
      action.errorMessage,
    ).pipe(
      filter((confirmed: boolean) => !!confirmed),
      tap(() => true),
    )),
  ), { dispatch: false });

  getSelectedPaymentQueueAuthorizedLegersGrid$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersGrid),
    mergeMap(action => (action.projectId == null
      ? this.paymentQueueService.searchPaymentQueue(action.searchOpts)
      : this.paymentQueueService.getPaymentQueue(action.searchOpts, action.projectId))
      .pipe(
        switchMap(response => {
          const searches = response.items.map(PaymentQueue.toModel);
          return [
            paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersGridComplete({
              paymentQueueGrid: searches,
              agGridParams: action.agGridParams,
              totalRecords: response.totalRecordsCount,
            }),
          ];
        }),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getSelectedPaymentQueueAuthorizedLedgersGridComplete$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersGridComplete),
    tap(action => {
      action.agGridParams?.success({ rowData: action.paymentQueueGrid, rowCount: action.totalRecords });
    }),
  ), { dispatch: false });

  getSelectedPaymentQueueUnauthorizedLegersGrid$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetSelectedPaymentQueueUnauthorizedLedgersGrid),
    mergeMap(action => (action.projectId == null
      ? this.paymentQueueService.searchPaymentQueue(action.searchOpts)
      : this.paymentQueueService.getPaymentQueue(action.searchOpts, action.projectId))
      .pipe(
        switchMap(response => {
          const searches = response.items.map(PaymentQueue.toModel);
          return [
            paymentQueueActions.GetSelectedPaymentQueueUnauthorizedLedgersGridComplete({
              paymentQueueGrid: searches,
              agGridParams: action.agGridParams,
              totalRecords: response.totalRecordsCount,
            }),
          ];
        }),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getSelectedPaymentQueueUnauthorizedLedgersGridComplete$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetSelectedPaymentQueueUnauthorizedLedgersGridComplete),
    tap(action => {
      action.agGridParams?.success({ rowData: action.paymentQueueGrid, rowCount: action.totalRecords });
    }),
  ), { dispatch: false });

  loadAuthorizeLedgerEntriesRequest$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.LoadAuthorizeLedgerEntriesRequest),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [paymentQueueActions.LoadAuthorizeLedgerEntriesRequestSuccess()]),
        catchError((error: any) => of(paymentQueueActions.LoadAuthorizeLedgerEntriesRequestError({ errorMessage: error.errorMessage }))),
      )),
  ));

  getSelectedPaymentQueueUnauthorizedLegersResultGrid$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersResultGrid),
    mergeMap(action => (action.projectId == null
      ? this.paymentQueueService.searchPaymentQueue(action.searchOpts)
      : this.paymentQueueService.getPaymentQueue(action.searchOpts, action.projectId))
      .pipe(
        switchMap(response => {
          const searches = response.items.map(PaymentQueue.toModel);
          return [
            paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersResultGridComplete({
              paymentQueueGrid: searches,
              agGridParams: action.agGridParams,
              totalRecords: response.totalRecordsCount,
            }),
          ];
        }),
        catchError(error => of(paymentQueueActions.Error({ errorMessage: error }))),
      )),
  ));

  getSelectedPaymentQueueAuthorizedLedgersResultGridComplete$ = createEffect(() => this.actions$.pipe(
    ofType(paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersResultGridComplete),
    tap(action => {
      action.agGridParams?.success({ rowData: action.paymentQueueGrid, rowCount: action.totalRecords });
    }),
  ), { dispatch: false });

}
