import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { BatchAction } from '@app/models/batch-action/batch-action';
import { ExportName, FileImportReviewTabs } from '@app/models/enums';
import { ValidationResults, ValidationResultsLineItem } from '@app/models/file-imports';
import { ValidationResultErrorGridRow } from '@app/models/file-imports/validation-result-error-grid-row';
import { Page } from '@app/models/page';
import { PaymentQueue } from '@app/models/payment-queue';
import { InvoiceArcherFeesValidationResultItem } from '@app/models/payment-queue/invoice-archer-fees-validation-result-item';
import { LienPaymentStageValidationResult } from '@app/models/payment-queue/validation-results';
import { BankAccountService, MessageService, ToastService } from '@app/services';
import { BatchActionsService } from '@app/services/api/batch-actions.service';
import { PaymentQueueService } from '@app/services/api/payment-queue.service';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import { catchError, expand, filter, mergeMap, reduce, switchMap, tap } from 'rxjs/operators';
import * as actions from './actions';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { SearchOptionsHelper } from '@app/helpers';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';
import { IdValue } from '@app/models';
import { OrgsService } from '@app/services/api/org/orgs.service';
import { Org } from '@app/models/org';

@Injectable()
export class PaymentQueueEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly paymentQueueService: PaymentQueueService,
    private readonly messageService: MessageService,
    private batchActionsService: BatchActionsService,
    private readonly bankAccountService: BankAccountService,
    private toaster: ToastService,
    private orgsService: OrgsService,
  ) { }

  readonly getPaymentQueueList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentQueueList),
    mergeMap(action => this.paymentQueueService.searchPaymentQueue(action.agGridParams.request)
      .pipe(
        switchMap((response: Page<PaymentQueue>) => [
          actions.GetPaymentQueueListComplete({
            paymentQueue: response.items.map(PaymentQueue.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError((error: any) => of(actions.GetPaymentQueueListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  readonly getDisbursementsListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentQueueListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.paymentQueue, rowCount: action.totalRecords });
    }),
  ), { dispatch: false });

  exportStandardRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ExportStandardRequest),
    mergeMap(action => this.paymentQueueService.exportGlobalPaymentQueue(
      ExportName[ExportName.PaymentQueue],
      action.searchOptions,
      action.columns,
      action.channelName,
    ).pipe(
      switchMap(data => [actions.ExportStandardRequestSuccess({ channel: data })]),
      catchError(errorMessage => of(actions.Error({ error: errorMessage }))),
    )),
  ));

  downloadStandardDocument$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadStandardDocument),
    mergeMap(action => this.paymentQueueService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError(errorMessage => of(actions.Error({ error: errorMessage }))),
    )),
  ));

  batchUpdateLienPaymentStageValidation$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueUpdateLienPaymentStageValidation),
    mergeMap(action => this.paymentQueueService.updateLienPaymentStageBatchAction(action.batchAction)
      .pipe(
        switchMap(res => [actions.EnqueueUpdateLienPaymentStageValidationSuccess({ batchAction: BatchAction.toModel(res) })]),
        catchError((error: any) => of(actions.BatchUpdateLienPaymentStageError({ errorMessage: error.errorMessage }))),
      )),
  ));

  enqueueUpdateLienPaymentStage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueUpdateLienPaymentStage),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [actions.EnqueueUpdateLienPaymentStageSuccess()]),
        catchError((error: any) => of(actions.BatchUpdateLienPaymentStageError({ errorMessage: error.errorMessage }))),
      )),
  ));

  batchUpdateLienPaymentStageError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.BatchUpdateLienPaymentStageError),
    switchMap(action => this.messageService.showAlertDialog(
      'Update Lien Payment Stage Error',
      action.errorMessage,
    ).pipe(
      filter((confirmed: boolean) => !!confirmed),
      tap(() => true),
    )),
  ), { dispatch: false });

  getGetBatchActionLienPaymentStageValidationResult$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBatchActionLienPaymentStageValidationResult),
    mergeMap(action => {
      const agGridParams = action.agGridParams;

      return this.batchActionsService.getBatchActionDocumentResult(
        action.batchActionId,
        action.documentTypeId,
        agGridParams ? agGridParams.request : null,
      )
        .pipe(
          switchMap(response => {
            const result = { ...response };
            return [
              actions.GetBatchActionLienPaymentStageValidationResultSuccess({
                validationResults: LienPaymentStageValidationResult.toModel(result),
                agGridParams,
              }),
            ];
          }),
          catchError((error: any) => of(actions.BatchUpdateLienPaymentStageError({ errorMessage: error.errorMessage }))),
        );
    }),
  ));

  getBatchActionResultRequestSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBatchActionLienPaymentStageValidationResultSuccess),
    tap(action => {
      const gridRows = action.validationResults.rows;
      const rowsCount = action.validationResults.totalCount;
      action.agGridParams.success({ rowData: gridRows, rowCount: rowsCount });
    }),
  ), { dispatch: false });

  getCopySpecialPaymentInstructions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetCopySpecialPaymentInstructions),
    mergeMap(action => this.paymentQueueService.getCopySpecialPaymentInstructions(action.ledgerEntryId, action.caseId)
      .pipe(
        switchMap(response => [
          actions.GetCopySpecialPaymentInstructionsSuccess({ paymentInstructions: response }),
        ]),
        catchError(error => of(actions.GetCopySpecialPaymentInstructionsError({ errorMessage: error }))),
      )),
  ));

  batchUpdateCopySpecialPaymentInstructionValidation$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueCopySpecialPaymentInstructionsValidation),
    mergeMap(action => this.batchActionsService.create(action.batchAction).pipe(
      switchMap((batchActionResult: BatchAction) => {
        const batchAction = BatchAction.toModel(batchActionResult);
        return this.batchActionsService.process(batchAction.id).pipe(
          switchMap(() => [
            actions.EnqueueCopySpecialPaymentInstructionsValidationSuccess({ batchAction }),
          ]),
          catchError((error: any) => of(actions.CopySpecialPaymentInstructionsValidationError({ errorMessage: error.errorMessage }))),
        );
      }),
      catchError((error: any) => of(actions.CopySpecialPaymentInstructionsValidationError({ errorMessage: error.errorMessage }))),
    )),
  ));

  copySpecialPaymentInstructionsApprove$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueCopySpecialPaymentInstructionsApprove),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [actions.EnqueueCopySpecialPaymentInstructionsApproveSuccess()]),
        catchError((error: any) => of(actions.EnqueueCopySpecialPaymentInstructionsApproveError({ errorMessage: error.errorMessage }))),
      )),
  ));

  getCopySpecialPaymentInstructionsValidationResult$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CopySpecialPaymentInstructionsValidationResult),
    mergeMap(action => {
      const agGridParams = action.agGridParams;
      return this.batchActionsService.getBatchActionDocumentResult(
        action.batchActionId,
        action.documentTypeId,
        agGridParams ? agGridParams.request : null,
        action.status,
      )
        .pipe(
          switchMap(response => {
            const result = { ...response };
            return [
              actions.CopySpecialPaymentInstructionsValidationSuccess({
                validationResults: ValidationResults.toModel(result),
                agGridParams,
                tab: action.tab,
              }),
            ];
          }),
          catchError((error: any) => of(actions.CopySpecialPaymentInstructionsValidationError({ errorMessage: error.errorMessage }))),
        );
    }),
  ));

  copySpecialPaymentInstructionsValidationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CopySpecialPaymentInstructionsValidationSuccess),
    tap(action => {
      let gridRows;
      const rowsCount = ValidationResults.getCount(action.validationResults, action.tab);
      if (action.tab === FileImportReviewTabs.Errors || action.tab === FileImportReviewTabs.Warnings) {
        gridRows = ValidationResultErrorGridRow.toFlattenedArrayOfModels(action.validationResults.rows);
      } else {
        gridRows = action.validationResults.rows;
      }
      action.agGridParams.success({ rowData: gridRows, rowCount: rowsCount });
    }),
  ), { dispatch: false });

  batchARApproval$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ValidateARApproval),
    mergeMap(action => this.batchActionsService.create(action.batchAction).pipe(
      switchMap((batchActionResult: BatchAction) => {
        const batchAction = BatchAction.toModel(batchActionResult);
        return this.batchActionsService.process(batchAction.id).pipe(
          switchMap(() => of(actions.ValidateARApprovalSuccess({ batchAction }))),
          catchError((error: any) => of(actions.ARApprovalError({ errorMessage: error.errorMessage }))),
        );
      }),
      catchError((error: any) => of(actions.ARApprovalError({ errorMessage: error.errorMessage }))),
    )),
  ));

  batchARApprovalSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ARApprovalSuccess),
    tap(() => this.toaster.showSuccess('AR approval successful')),
  ), { dispatch: false });

  batchInvoiceArcherFees$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ValidateInvoiceArcherFees),
    mergeMap(action => this.batchActionsService.create(action.batchAction).pipe(
      switchMap((batchActionResult: BatchAction) => {
        const batchAction = BatchAction.toModel(batchActionResult);
        return this.batchActionsService.process(batchAction.id).pipe(
          switchMap(() => of(actions.InvoiceArcherFeesActionCreationSuccess({ batchAction }))),
          catchError((error: any) => of(actions.InvoiceArcherFeesError({ errorMessage: error.errorMessage }))),
        );
      }),
      catchError((error: any) => of(actions.InvoiceArcherFeesError({ errorMessage: error.errorMessage }))),
    )),
  ));

  batchInvoiceArcherFeesSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.InvoiceArcherFeesSuccess),
    tap(() => this.toaster.showSuccess('Invoice archer fees successful')),
  ), { dispatch: false });

  getInvoiceArcherFeesDeficienciesSummary$ = createEffect(() => this.actions$.pipe(
    ofType(actions.InvoiceArcherFeesDeficienciesSummary),
    mergeMap(action => this.batchActionsService.getBatchActionWarningsRequest(
      action.batchActionId,
      action.documentTypeId,
    ).pipe(
      switchMap(response => [
        actions.InvoiceArcherFeesDeficienciesSummarySuccess({
          batchActionDeficienciesReview: response,
        }),
      ]),
      catchError(error => of(actions.Error({ error })))
    )),
  ));

  loadInvoiceArcherFees$ = createEffect(() => this.actions$.pipe(
    ofType(actions.LoadInvoiceArcherFees),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [actions.LoadInvoiceArcherFeesSuccess()]),
        catchError((error: any) => of(actions.InvoiceArcherFeesError({ errorMessage: error.errorMessage }))),
      )),
  ));

  getInvoiceArcherFeesResultRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetInvoiceArcherFeesResultRequest),
    mergeMap(action => {
      const agGridParams = action.agGridParams;

      return this.fetchAllInvoiceArcherFeesResultsRecursively(
        action.entityId,
        action.documentTypeId,
        agGridParams ? agGridParams.request : null,
        action.status,
      )
        .pipe(
          switchMap(response => {
            const result = { ...response };
            return [
              actions.GetInvoiceArcherFeesResultRequestSuccess({
                validationResults: ValidationResults.toModel(result),
                tab: action.tab,
                agGridParams,
              }),
            ];
          }),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  private fetchAllInvoiceArcherFeesResultsRecursively(
    entityId: number,
    documentTypeId: BatchActionDocumentType,
    searchOptions: IServerSideGetRowsRequestExtended,
    importResultStatus?: BatchActionResultStatus
  ): Observable<any[]> {
    let page = 1;
    let perPage = searchOptions.endRow - searchOptions.startRow;

    return this.batchActionsService
      .getBatchActionDocumentResult(entityId, documentTypeId, { ...searchOptions }, importResultStatus)
      .pipe(
        expand(response => {
          const hasMoreRecords = response.totalCount > page * perPage;
            if (hasMoreRecords) {
              page++;
              searchOptions.startRow = (page - 1) * perPage;
              searchOptions.endRow = page * perPage;
              return this.batchActionsService.getBatchActionDocumentResult(
                entityId,
                documentTypeId,
                searchOptions,
                importResultStatus,
              )
            } else {
              return EMPTY;
            }
        }),
        reduce((accumulatedResponse, currentResponse) => {
          return {
            ...currentResponse,
            rows: [...accumulatedResponse.rows, ...currentResponse.rows]
          };
        }, { rows: [] })
      );
  }

  getInvoiceArcherFeesResultRequestSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetInvoiceArcherFeesResultRequestSuccess),
    tap(action => {
      const gridRows: ValidationResultsLineItem[] = action.validationResults.rows;
      const gridRowsTransformed = InvoiceArcherFeesValidationResultItem.transformToInvoiceArcherFees(gridRows);

      const rowsCount = gridRowsTransformed.length;
      action.agGridParams.success({ rowData: gridRowsTransformed, rowCount: rowsCount });
    }),
  ), { dispatch: false });

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ARApprovalError),
    tap(action => {
      this.toaster.showError(action.errorMessage);
    }),
  ), { dispatch: false });

  errorFees$ = createEffect(() => this.actions$.pipe(
    ofType(actions.InvoiceArcherFeesError),
    tap(action => {
      this.toaster.showError(action.errorMessage);
    }),
  ), { dispatch: false });

  batchValidateAuthorizeArcherFees$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ValidateAuthorizeArcherFees),
    mergeMap(action => this.batchActionsService.create(action.batchAction).pipe(
      switchMap((batchActionResult: BatchAction) => {
        const batchAction = BatchAction.toModel(batchActionResult);
        return this.batchActionsService.process(batchAction.id).pipe(
          switchMap(() => [
            actions.ValidateAuthorizeArcherFeesSuccess({ batchAction }),
          ]),
          catchError((error: any) => of(actions.ValidateAuthorizeArcherFeesError({ errorMessage: error.errorMessage }))),
        );
      }),
      catchError((error: any) => of(actions.ValidateAuthorizeArcherFeesError({ errorMessage: error.errorMessage }))),
    )),
  ));

  batchApproveAuthorizeArcherFees$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ApproveAuthorizeArcherFees),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [actions.ApproveAuthorizeArcherFeesSuccess()]),
        catchError((error: any) => of(actions.ApproveAuthorizeArcherFeesError({ errorMessage: error.errorMessage }))),
      )),
  ));

  batchValidateAuthorizeLienEntries$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ValidateAuthorizeLienEntries),
    mergeMap(action => this.batchActionsService.create(action.batchAction).pipe(
      switchMap((batchActionResult: BatchAction) => {
        const batchAction = BatchAction.toModel(batchActionResult);
        return this.batchActionsService.process(batchAction.id).pipe(
          switchMap(() => [
            actions.ValidateAuthorizeLienEntriesSuccess({ batchAction }),
          ]),
          catchError((error: any) => of(actions.ValidateAuthorizeLienEntriesError({ errorMessage: error.errorMessage }))),
        );
      }),
      catchError((error: any) => of(actions.ValidateAuthorizeLienEntriesError({ errorMessage: error.errorMessage }))),
    )),
  ));

  batchApproveAuthorizeLienEntries$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ApproveAuthorizeLienEntries),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [actions.ApproveAuthorizeLienEntriesSuccess()]),
        catchError((error: any) => of(actions.ApproveAuthorizeLienEntriesError({ errorMessage: error.errorMessage }))),
      )),
  ));

  batchValidateInvoiceArcherFeesError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ValidateAuthorizeArcherFeesError),
    tap(action => this.toaster.showError(action.errorMessage)),
  ), { dispatch: false });


  getOrgBankAccountsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgBankAccountsList),
    mergeMap(action => this.bankAccountService.index({
      searchOptions: {
        ...SearchOptionsHelper.getFilterRequest([SearchOptionsHelper.getBooleanFilter('active', 'boolean', 'equals', true)]),
        startRow: 0,
        endRow: -1,
        sortModel: [{ sort: 'asc', colId: 'name' }],
        orgId: action.orgId,
      },
    })
      .pipe(
        switchMap(response => {
          const bankAccountsList = response.items.map(item => (new IdValue(item.id, `${item.name}, ****${item.accountNumber}`)));
          return [actions.GetOrgBankAccountsListComplete({ bankAccountsList, orgId: action.orgId })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  batchValidateRefundTransferRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.ValidateRefundTransferRequest),
      mergeMap(
        action => {
          return this.batchActionsService.create(action.batchAction).pipe(
            switchMap((batchActionResult: BatchAction) => {
              const batchAction = BatchAction.toModel(batchActionResult);
              return this.batchActionsService.uploadInputFile(batchAction.id, action.claimantAndDetailsFile).pipe(
                switchMap(() => {
                  if (action.additionalDocumentsFiles && action.additionalDocumentsFiles.length > 0) {
                    const uploadFiles$ = this.batchActionsService.uploadAdditionalFiles(batchAction.id, action.additionalDocumentsFiles);
                    return forkJoin([uploadFiles$]).pipe(
                      switchMap(() =>
                        this.batchActionsService.process(batchAction.id).pipe(
                          switchMap(() => [actions.ProcessBatchActionSuccess({ batchAction })]),
                          catchError((error: any) => of(actions.ProcessBatchActionError({ errorMessage: error.errorMessage })))
                        )
                      )
                    );
                  } else {
                    return this.batchActionsService.process(batchAction.id).pipe(
                      switchMap(() => [actions.ProcessBatchActionSuccess({ batchAction })]),
                      catchError((error: any) => of(actions.ProcessBatchActionError({ errorMessage: error.errorMessage })))
                    );
                  }
                }),
                catchError(error => of(actions.UploadClaimantAndItemDetailsError({ error })))
              );
            }),
            catchError((error: any) => of(actions.ProcessBatchActionError({ errorMessage: error.errorMessage })))
          );
        }
      )
    )
  );

  batchValidateManualRefundTransferRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ValidateManualEntryRefundTransferRequest),
    mergeMap(
      action => this.batchActionsService.create(action.batchAction).pipe(
        switchMap((batchActionResult: BatchAction) => {
          const batchAction = BatchAction.toModel(batchActionResult);
          return this.batchActionsService.uploadInputData(batchAction.id, action.items).pipe(
            switchMap(() => {
              if (action.additionalDocumentsFiles && action.additionalDocumentsFiles.length > 0) {
                const uploadFiles$ = this.batchActionsService.uploadAdditionalFiles(batchAction.id, action.additionalDocumentsFiles);
                return forkJoin([uploadFiles$]).pipe(
                  switchMap(() => this.batchActionsService.process(batchAction.id).pipe(
                    switchMap(() => [actions.ProcessBatchActionSuccess({ batchAction })]),
                    catchError((error: any) => of(actions.ProcessBatchActionError({ errorMessage: error.errorMessage }))),
                  )),
                );
              }
              return this.batchActionsService.process(batchAction.id).pipe(
                switchMap(() => [actions.ProcessBatchActionSuccess({ batchAction })]),
                catchError((error: any) => of(actions.ProcessBatchActionError({ errorMessage: error.errorMessage }))),
              );
            }),
            catchError(error => of(actions.UploadClaimantAndItemDetailsError({ error }))),
          );
        }),
        catchError((error: any) => of(actions.ProcessBatchActionError({ errorMessage: error.errorMessage }))),
      ),
    ),
  ));

  getRefundTransferRequestValidationResult$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefundTransferValidationResult),
    mergeMap(action => {
      const agGridParams = action.agGridParams;
      return this.batchActionsService.getBatchActionDocumentResult(
        action.batchActionId,
        action.documentTypeId,
        agGridParams ? agGridParams.request : null,
        action.status,
      )
        .pipe(
          switchMap(response => {
            const result = { ...response };
            const validationResults = ValidationResults.toModel(result);
            return [
              actions.RefundTransferValidationSuccess({
                validationResults: validationResults,
                agGridParams,
                tab: action.tab,
              })
            ];
          }),
          catchError((error: any) => of(actions.RefundTransferValidationError({ error: error.errorMessage }))),
        );
    }),
  ));

  getRefundTransferRequestValidationResultSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefundTransferValidationSuccess),
    tap(action => {
      let gridRows;
      const rowsCount = ValidationResults.getCount(action.validationResults, action.tab);
      if (action.tab === FileImportReviewTabs.Errors || action.tab === FileImportReviewTabs.Warnings) {
        gridRows = ValidationResultErrorGridRow.toFlattenedArrayOfModels(action.validationResults.rows);
      } else {
        gridRows = action.validationResults.rows;
      }
      action.agGridParams.success({ rowData: gridRows, rowCount: rowsCount });
    }),
  ), { dispatch: false });

  loadBatchAction$ = createEffect(() => this.actions$.pipe(
    ofType(actions.LoadBatchAction),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [actions.LoadBatchActionSuccess()]),
        catchError((error: any) => of(actions.LoadBatchActionError({ errorMessage: error.errorMessage }))),
      )),
  ));

  getRefundTransferRequestInfo$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetRefundTransferRequestInfo),
    mergeMap(action => {
      return this.batchActionsService.getBatchActionDocumentResult(
        action.batchActionId,
        BatchActionDocumentType.PreviewValidation,
        {
          startRow: 0,
          endRow: 1000000, // doesnt make sense to use pagination here. We load the entire document on the backend. Here I need all the rows
          rowGroupCols: [],
          valueCols: [],
          pivotCols: [],
          pivotMode: false,
          groupKeys: [],
          filterModel: [],
          sortModel: []
        },
        BatchActionResultStatus.Enqueued,
      )
        .pipe(
          switchMap(response => {
            const result = { ...response };
            const amount = result.rows.map(p => Number(p.fields.Amount)).reduce((sum, current) => sum + current, 0);
            const validationResults = ValidationResults.toModel(result);
            return [
              actions.GetRefundTransferRequestInfoSuccess({ amount: amount, validationResults }),
            ];
          }),
          catchError((error: any) => of(actions.RefundTransferValidationError({ error: error.errorMessage }))),
        );
    }),
  ));

  getOrg$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrg),
    mergeMap(action => forkJoin([this.orgsService.get(action.id)]).pipe(
      switchMap(data => {
        const organization = Org.toModel(data[0]);
        organization.isSubOrg = action.isSubOrg;
        return [
          actions.GetOrgComplete({ data: organization }),
        ];
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));
}
