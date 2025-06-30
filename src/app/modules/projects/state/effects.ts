/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable arrow-body-style */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, of, forkJoin } from 'rxjs';
import { mergeMap, map, catchError, tap, switchMap, withLatestFrom, filter } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import * as rootActions from '@app/state/root.actions';
import { Project } from '@app/models/projects/project';
import { ProjectDetails } from '@app/models/projects/project-details';
import { Document } from '@app/models/documents/document';
import {
  DocumentImportsService,
  ToastService,
  ProjectsService,
  ChartOfAccountsService,
  ClientsService,
  DocumentGenerationService,
  ClaimSettlementLedgerSettingsService,
  OrgsService,
  BillingRuleService,
  DisbursementsService,
  DocumentsService,
  MessageService,
  BankAccountService,
} from '@app/services';
import { DisbursementGroup } from '@app/models/disbursement-group';
import { ChartOfAccountProjectConfig } from '@app/models/projects';
import { ControllerEndpoints, EntityTypeEnum, ExportName, FileImportReviewTabs } from '@app/models/enums';
import { SelectHelper } from '@app/helpers/select.helper';

import { BatchActionsService } from '@app/services/api/batch-actions.service';
import { ClaimantsWithLedgersGridRow } from '@app/models/claimants-with-ledgers-grid-row';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings/claim-settlement-ledger-settings';
import { ChartOfAccountSettings } from '@app/models/closing-statement/chart-of-account-settings';
import { IdValue, PaymentItemListResponse, PaymentRequestSummary, ProjectCustomMessage, ProjectOrganization, ProjectOrganizationItem, TransferItemsResponse } from '@app/models';
import isString from 'lodash-es/isString';
import { ProjectContactReference } from '@app/models/project-contact-reference';
import { ProjectContactsService } from '@app/services/project-contacts.service';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { InvoiceItem } from '@app/models/projects/invoice-item';
import { FinancialProcessorService } from '@app/services/api/financial-processor.service';
import { ProjectReceivablesService } from '@app/services/api/project-receivables.service';
import { FinancialProcessorRun } from '@app/models/financial-processor-run';
import * as tabInfoActions from '@app/modules/shared/state/tab-info/actions';
import { LedgerInfoSearchResult } from '@app/models/ledger-info-search-result';
import { ProjectReceivable } from '@app/models/projects/project-receivable/project-receivable';
import { Deficiency } from '@app/models/deficiency';
import { PortalDeficiency } from '@app/models/portal-deficiency';
import { DeficiencyService } from '@app/services/api/deficiency.service';
import { PortalDeficiencyService } from '@app/services/api/portal-deficiency.service';
import { ReceivableGroup } from '@app/models/projects/project-receivable/project-receivable-group';
import { PaymentRequestResultResponse } from '@app/models/payment-request/payment-request-result-response';
import { DocumentImport, SaveDocumentGeneratorRequest } from '@app/models/documents';
import { ValidationResults, ValidationResultsLineItem } from '@app/models/file-imports';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { DisbursementGroupsService } from '@app/services/api/disbursement-groups.service';
import { ValidationResultErrorGridRow } from '@app/models/file-imports/validation-result-error-grid-row';
import { ClaimantsSummaryService } from '@app/services/api/claimants-summary.service';
import { RequestReviewOption } from '@app/models/payment-request/payment-request-review-result';
import { ProjectMessagingService } from '@app/services/api/project-messaging.service';
import { ProjectMessage } from '@app/models/projects/project-message';
import { DeficiencySettingsService } from '@app/services/api/deficiency-settings.service';
import { DeficiencySettingsConfig } from '@app/models/deficiencies/deficiency-settings-config';
import { BatchActionReviewOptions } from '@app/models/batch-action/batch-action-review-options';
import { TransferRequestDto } from '@app/models/transfer-request/transfer-review-dto';
import { BatchDetails } from '@app/models/closing-statement/batch-details';
import { OrganizationPaymentStatus } from '@app/models/org-payment-status/org-payment-status';
import { TypedAction } from '@ngrx/store/src/models';
import * as fromProjects from '.';
import * as actions from './actions';
import * as selectors from './selectors';
import { MaintenanceService } from '@app/services/api/maintenance.service';
import { MaintenanceIdEnum } from '@app/models/enums/maintenance-id.enum';
import { Maintenance } from '@app/models/admin/maintenance';
import { TransfersService } from '@app/services/api/transfers.service'
import { ScheduledReport } from '@app/models/scheduled-report';
import { ReportSchedule } from '@app/models/projects/report-schedule';
import { ManualPaymentItemRowModel } from '@app/models/file-imports/manual-payment-item';
import { VoidClosingStatementEnum } from '@app/models/enums/void-closing-statement.enum';

@Injectable()
export class ProjectsEffects {
  constructor(
    private projectsService: ProjectsService,
    private chartOfAccountsService: ChartOfAccountsService,
    private toaster: ToastService,
    private documentImportService: DocumentImportsService,
    private batchActionsService: BatchActionsService,
    private transfersService: TransfersService,
    private actions$: Actions,
    private store$: Store<fromProjects.AppState>,
    private router: Router,
    private clientsService: ClientsService,
    private disbursementGroupsService: DisbursementGroupsService,
    private docGenerationsService: DocumentGenerationService,
    private ledgerSettingsService: ClaimSettlementLedgerSettingsService,
    private orgsService: OrgsService,
    private projectContactsService: ProjectContactsService,
    private billingRuleService: BillingRuleService,
    private financialProcessorService: FinancialProcessorService,
    private projectReceivablesService: ProjectReceivablesService,
    private deficiencyService: DeficiencyService,
    private portalDeficiencyService: PortalDeficiencyService,
    private readonly disbursementsService: DisbursementsService,
    private readonly orgService: OrgsService,
    private documentsService: DocumentsService,
    private readonly claimantsSummaryService: ClaimantsSummaryService,
    private projectMessagingService: ProjectMessagingService,
    private readonly messageService: MessageService,
    private readonly deficiencySettingsService: DeficiencySettingsService,
    private readonly maintenanceService: MaintenanceService,
    private readonly bankAccountsService: BankAccountService,
  ) { }

  getAllProjects$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAllProjectsActionRequest),
    mergeMap(action => this.projectsService.getProjectsList(action.gridParams.request)
      .pipe(
        switchMap(response => {
          const projectsModels = response.items.map(Project.toModel);

          return [actions.GetAllProjectsActionRequestComplete({
            projects: projectsModels,
            gridParams: action.gridParams,
            totalRecords: response.totalRecordsCount,
          })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getAllProjectsComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAllProjectsActionRequestComplete),
    tap(action => {
      action.gridParams.success({ rowData: action.projects, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  gotoProjectDetailsPage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GotoProjectDetailsPage),
    tap(({ projectId, navSettings }) => this.router.navigate(
      [`/projects/${projectId}`],
      { state: { navSettings } },
    )),
  ), { dispatch: false });

  gotoProjectServicesPage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GotoProjectServicesPage),
    tap(({ projectId, productCategoryId, navSettings }) => this.router.navigate(
      [`/projects/${projectId}/services/${productCategoryId}`],
      { state: { navSettings } },
    )),
  ), { dispatch: false });

  gotoProjectOrganizationsPage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GotoProjectOrganizationsPage),
    tap(({ projectId }) => this.router.navigate(
      [`/projects/${projectId}/organizations/tabs/organizations-list`],
    )),
  ), { dispatch: false });

  getIndex$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetIndex),
    withLatestFrom(this.store$.pipe(select(selectors.search))),
    mergeMap(([, search]) => this.projectsService.index(search).pipe(
      map(index => actions.GetIndexComplete({ index })),
      catchError(err => of(actions.Error({ error: err.message }))),
    )),
  ));

  getIndexSearch$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetIndexSearch),
    map(() => actions.GetIndex()),
  ));

  getItem$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetItem),
    mergeMap(action => forkJoin(
      this.projectsService.get(action.id),
    ).pipe(
      switchMap(data => [
        actions.GetItemComplete({ item: Project.toModel(data[0]) }),
        rootActions.LoadingFinished({ actionName: actions.GetItem.type }),
      ]),
      catchError(err => of(actions.Error({ error: err.message }))),
    )),
  ));

  saveItem$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveItem),
    mergeMap(action => this.projectsService.put(action.item).pipe(
      switchMap(item => [actions.SaveItemCompleted({ item: Project.toModel(item) })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  saveItemCompleted$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveItemCompleted),
    tap(() => this.toaster.showSuccess('Project saved successfully')),
  ), { dispatch: false });

  getClaimantsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantsList),
    withLatestFrom(this.store$.select(selectors.clientGridParams)),
    mergeMap(([action, clientGridParams]) => {
      const agGridParams = action.agGridParams
        ? action.agGridParams
        : clientGridParams;

      return this.projectsService.getClients(agGridParams.request, action.projectId)
        .pipe(
          switchMap(response => [
            actions.GetClaimantsListSuccess({
              clients: response.items,
              totalRecords: response.totalRecordsCount,
              agGridParams,
            }),
          ]),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  getClientListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantsListSuccess),
    tap(action => {
      action.agGridParams?.success({ rowData: action.clients, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  gotoClaimantDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToClaimantDetails),
    tap(action => this.router.navigate(
      [`claimants/${action.claimantDetailsRequest.id}`],
      {
        state: {
          projectId: action.claimantDetailsRequest.projectId,
          navSettings: action.claimantDetailsRequest.navSettings,
          gridParamsRequest: action.claimantDetailsRequest.gridParamsRequest,
        },
      },
    )),
  ), { dispatch: false });

  getDocumentImportById$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentImportById),
    mergeMap(action => {
      return this.documentImportService.get(action.id)
        .pipe(
          switchMap(response => [actions.GetDocumentImportByIdSuccess({ paymentRequestDocumentImportPreviewResults: response })]),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  getDocumentImportsRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentImportsRequest),
    withLatestFrom(this.store$.select(selectors.documentImportGridParams)),
    mergeMap(([action, documentImportGridParams]) => {
      const agGridParams = action.gridParams
        ? action.gridParams
        : documentImportGridParams;

      return this.documentImportService.getDocumentImportsSearch(3, action.projectId, agGridParams ? agGridParams.request : null)
        .pipe(
          switchMap(response => [actions.GetDocumentImportsSuccess({
            documentImports: response.items,
            totalRecords: response.totalRecordsCount,
            agGridParams,
          }),
          ]),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  getDocumentImportsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentImportsSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.documentImports, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getDocumentImportTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentImportTemplatesRequest),
    mergeMap(action => this.documentImportService
      .getDocumentImportTemplates(action.entityType).pipe(
        switchMap(templates => [actions.GetDocumentImportTemplatesSuccess({ templates })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getServices$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectServices),
    mergeMap(action => this.projectsService.getServices(action.projectId)
      .pipe(
        switchMap(items => [
          actions.GetProjectServicesSuccess({ services: items }),
          rootActions.LoadingFinished({ actionName: actions.GetProjectServices.type }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectOverviewDashboardClaimantStatistic$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectOverviewDashboardClaimantStatistic),
    mergeMap(action => this.projectsService.getProjectOverviewDashboardClaimantStatistics(action.projectId, action.bypassSpinner)
      .pipe(
        switchMap(response => [
          actions.GetProjectOverviewDashboardClaimantStatisticSuccess({ statistics: { projectId: action.projectId, infoBlockItems: response } }),
          rootActions.LoadingFinished({ actionName: actions.GetProjectOverviewDashboardClaimantStatistic.type }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectCounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectCounts),
    mergeMap(action => this.projectsService.getProjectCounts(action.projectId)
      .pipe(
        switchMap(response => [
          actions.GetProjectCountsSuccess({ projectCounts: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectOverviewDashboardClaimantDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectOverviewDashboardClaimantDetails),
    mergeMap(action => this.projectsService.getProjectOverviewDashboardClaimantDetails(action.projectId)
      .pipe(
        switchMap(response => [
          actions.GetProjectOverviewDashboardClaimantDetailsSuccess({ data: { projectId: action.projectId, ...response } }),
          rootActions.LoadingFinished({ actionName: actions.GetProjectOverviewDashboardClaimantDetails.type }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectOverviewDashboardClaimantDetailsByPhase$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectOverviewDashboardClaimantDetailsByPhase),
    mergeMap(action => this.projectsService.getProjectOverviewDashboardClaimantDetailsByPhase(action.projectId, action.bypassSpinner)
      .pipe(
        switchMap(response => [
          actions.GetProjectOverviewDashboardClaimantDetailsByPhaseSuccess({ data: { projectId: action.projectId, ...response } }),
          rootActions.LoadingFinished({ actionName: actions.GetProjectOverviewDashboardClaimantDetailsByPhase.type }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getFinalizationCounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetFinalizationCounts),
    mergeMap(action => this.projectsService.getFinalizationCounts(action.projectId)
      .pipe(
        switchMap(response => [
          actions.GetFinalizationCountsSuccess({ finalizationsCounts: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getFinalizationCountsByDates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetFinalizationCountsByDates),
    mergeMap(action => this.projectsService.getFinalizationCountsByDates(action.projectId, action.productCategoryId, action.from, action.to)
      .pipe(
        switchMap(response => [
          actions.GetFinalizationCountsByDatesSuccess({ finalizationsCount: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getDeficienciesWidgetData$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficienciesWidgetData),
    mergeMap(action => this.projectsService.getDeficienciesWidgetData(action.projectId, action.bypassSpinner)
      .pipe(
        switchMap(response => [
          actions.GetDeficienciesWidgetDataSuccess({ deficienciesWidgetData: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectOverviewDashboardClaimants$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectOverviewDashboardClaimants),
    withLatestFrom(this.store$.select(selectors.clientGridParams)),
    mergeMap(([action, clientGridParams]) => this.projectsService.getProjectOverviewDashboardClaimants(action.request)
      .pipe(
        switchMap(response => [
          actions.GetClaimantsListSuccess({
            clients: response.items,
            totalRecords: response.totalRecordsCount,
            agGridParams: action.agGridParams || clientGridParams,
          }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectDetailsRequest),
    mergeMap(action => this.projectsService.getProjectDetails(action.projectId)
      .pipe(
        switchMap(response => [actions.GetProjectDetailsSuccess({ details: ProjectDetails.toModel(response) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  downloadClients$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadClients),
    mergeMap(action => {
      return this.projectsService.export(action.id, ExportName[ExportName.Claimants], action.searchOptions, action.columns, action.channelName).pipe(
        switchMap(data => [actions.DownloadClientsComplete({ channel: data })]),
        catchError(error => of(actions.Error({ error }))),
      );
    }),
  ));

  downloadDashboardClients$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadDashboardClients),
    mergeMap(action => {
      return this.projectsService.exportDashboard(ExportName[ExportName.Claimants], action.searchOptions, action.columns, action.channelName).pipe(
        switchMap(data => [actions.DownloadClientsComplete({ channel: data })]),
        catchError(error => of(actions.Error({ error }))),
      );
    }),
  ));

  downloadDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadDocument),
    mergeMap(action => this.projectsService.downloadDocument(action.id, action?.fileName).pipe(
      switchMap(() => []),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  createProject$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateProject),
    mergeMap(action => this.projectsService.createProject(action.project)
      .pipe(
        switchMap(project => [actions.CreateProjectSuccess({ project })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  createProjectSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateProjectSuccess),
    tap(action => {
      this.toaster.showSuccess('Project was created');
      this.router.navigate(['projects', action.project.id, 'overview', 'tabs', 'details']);
    }),
  ), { dispatch: false });

  readonly generatePaymentsRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GeneratePaymentRequest),
    mergeMap(action => this.batchActionsService.generatePaymentRequest(action.params)
      .pipe(
        switchMap(generatePaymentRequestData => [actions.GeneratePaymentRequestSuccess({ generatePaymentRequestData })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly generatePaymentsRequestGlobal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GeneratePaymentRequestGlobal),
    mergeMap(action => this.batchActionsService.generatePaymentRequestGlobal(action.params)
      .pipe(
        switchMap(generatePaymentRequestData => [actions.GeneratePaymentRequestGlobalSuccess({ generatePaymentRequestData })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly updatePaymentRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdatePaymentRequest),
    mergeMap(action => this.batchActionsService.updatePaymentRequest(action.paymentRequestId, action.params)
      .pipe(
        switchMap(updatePaymentRequestData => [actions.UpdatePaymentRequestSuccess({ updatePaymentRequestData })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly startPaymentRequestJob$ = createEffect(() => this.actions$.pipe(
    ofType(actions.StartPaymentRequestJob),
    mergeMap(action => this.batchActionsService.startPaymentRequestJob(action.paymentRequestId)
      .pipe(
        switchMap(() => [actions.StartPaymentRequestJobSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly reviewPaymentRequestJob$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ReviewPaymentRequestJob),
    mergeMap(action => this.batchActionsService.reviewPaymentRequestJob(action.paymentRequestId)
      .pipe(
        switchMap(() => [actions.ReviewPaymentRequestJobSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly startAcceptPaymentRequestJob$ = createEffect(() => this.actions$.pipe(
    ofType(actions.StartAcceptPaymentRequestJob),
    mergeMap(action => this.batchActionsService.startAcceptPaymentRequestJob(action.paymentRequestId, action.requestData)
      .pipe(
        switchMap(() => [actions.StartAcceptPaymentRequestJobSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly getPaymentRequestData$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentRequestData),
    mergeMap(action => this.batchActionsService.getPaymentRequestData(action.projectId, action.paymentRequestId, action.documentId)
      .pipe(
        switchMap(paymentsData => [actions.GetPaymentRequestDataSuccess({ paymentsData: PaymentItemListResponse.toModel(paymentsData) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly getPaymentRequestReviewWarnings$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentRequestReviewWarnings),
    mergeMap(action => {
      return this.batchActionsService.getPaymentRequestReviewWarnings(action.projectId, action.paymentRequestId, action.documentId)
        .pipe(
          switchMap(response => {
            return [
              actions.GetPaymentRequestReviewWarningsSuccess({
                requestDeficiencies: response.map(RequestReviewOption.toModel),
              }),
            ];
          }),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  readonly getPaymentRequestDataResult$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentRequestDataResult),
    mergeMap(action => this.batchActionsService.getPaymentRequestResultData(action.projectId, action.paymentRequestId, action.documentId)
      .pipe(
        switchMap(paymentsResultData => [actions.GetPaymentRequestDataResultSuccess({ paymentsResultData: PaymentRequestResultResponse.toModel(paymentsResultData) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly acceptPaymentsRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.AcceptPaymentRequest),
    mergeMap(action => this.batchActionsService.acceptPaymentRequest(action.paymentRequestId)
      .pipe(
        switchMap(acceptPaymentRequestData => [actions.AcceptPaymentRequestSuccess({ acceptPaymentRequestData })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getClaimantsWithLedgersList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantsWithLedgersList),
    mergeMap(action => this.clientsService.getClaimSettlementLedgers(action.searchOpts, action.projectId)
      .pipe(
        switchMap(response => [
          actions.GetClaimantsWithLedgersListSuccess({
            result: LedgerInfoSearchResult.toModel(response),
            agGridParams: action.gridParams,
          }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getClaimantsWithLedgersListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantsWithLedgersListSuccess),
    tap(action => {
      const gridRows = action.result.page.items.map(ClaimantsWithLedgersGridRow.toModel);
      action.agGridParams?.success({ rowData: gridRows, rowCount: action.result.page.totalRecordsCount});
    }),
  ), { dispatch: false });

  enqueueFeeExpenseWorksheetGeneration$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueDocumentGeneration),
    mergeMap(action => this.clientsService.generateFeeExpense(action.generationRequest)
      .pipe(
        switchMap(generationRequest => [actions.EnqueueDocumentGenerationSuccess({ generationRequest })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  enqueueClosingStatementGeneration$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueClosingStatementGeneration),
    mergeMap(action => this.docGenerationsService.generate(ControllerEndpoints.Ledgers, action.generationRequest)
      .pipe(
        switchMap(generationRequest => [actions.EnqueueClosingStatementGenerationSuccess({ generationRequest })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  canPublishDWGeneration$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CanPublishDWGeneration),
    mergeMap(action => this.clientsService.canPublishDWGeneration(action.caseId, action.request)
      .pipe(
        switchMap(canPublish => [actions.CanPublishDWGenerationSuccess({ canPublish })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  batchUpdateLedgerStage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueBatchUpdateLedgerStage),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [actions.EnqueueBatchUpdateLedgerStageSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  batchUpdateLedgerStageSelection$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueBatchUpdateLedgerStageSelection),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [actions.EnqueueBatchUpdateLedgerStageSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  batchUpdateLedgerStageValidation$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueBatchUpdateLedgerStageValidation),
    mergeMap(action => this.clientsService.updateLedgerStageBatchAction(action.batchAction)
      .pipe(
        switchMap(res => [actions.EnqueueBatchUpdateLedgerStageValidationSuccess({ batchAction: BatchAction.toModel(res) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  batchUpdateLedgerLienDataValidation$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueBatchUpdateByActionTemplateIdValidation),
    mergeMap(action => this.disbursementGroupsService.validateByActionTemplateId(action.batchAction)
      .pipe(
        switchMap(res => [actions.EnqueueBatchUpdateByActionTemplateIdValidationSuccess({ batchAction: BatchAction.toModel(res) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  batchUpdateDisbursementGroupValidation$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueBatchUpdateDisbursementGroupValidation),
    mergeMap(action => this.clientsService.updateDisbursementGroupBatchAction(action.batchAction)
      .pipe(
        switchMap(res => [actions.EnqueueBatchUpdateDisbursementGroupValidationSuccess({ batchAction: BatchAction.toModel(res) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  downloadFeeExpenseWorksheet$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadGeneratedDocument),
    mergeMap(action => this.docGenerationsService.getLatestExports(action.generatorId)
      .pipe(
        switchMap(() => [actions.DownloadGeneratedDocumentSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  downloadClosingStatement$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadClosingStatement),
    mergeMap(action => this.docGenerationsService.getLatestExports(action.generatorId)
      .pipe(
        switchMap(() => [actions.DownloadClosingStatementSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getLedgerSettings$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerSettings),
    mergeMap(action => this.ledgerSettingsService.getByProjectId(action.projectId)
      .pipe(
        switchMap(res => [actions.GetLedgerSettingsSuccess({ settings: ClaimSettlementLedgerSettings.toModel(res) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  // project disbursement group effects

  getDisbursementGrid$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDisbursementGroupsGrid),
    mergeMap(action => this.projectsService.getDisbursementGroupList(action.agGridParams.request, action.projectId)
      .pipe(
        switchMap(response => [
          actions.GetDisbursementGroupsGridSuccess({
            disbursementGroupList: response.items.map(DisbursementGroup.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getDisbursementGridSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDisbursementGroupsGridSuccess),
    tap(action => {
      action.agGridParams?.success({ rowData: action.disbursementGroupList, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  refreshDisbursementGroupList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshDisbursementGroupList),
    withLatestFrom(this.store$.select(selectors.disbursementGroupGridParams)),
    switchMap(([action, agGridParams]) => [
      actions.GetDisbursementGroupsGrid({ projectId: action.projectId, agGridParams }),
    ]),
  ));

  getDisbursementGroup$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDisbursementGroup),
    mergeMap(action => this.projectsService.getDisbursementGroup(action.disbursementGroupId)
      .pipe(
        switchMap(disbursementGroup => ([actions.GetDisbursementGroupSuccess({ disbursementGroup: DisbursementGroup.toModel(disbursementGroup) })])),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  createDisbursementGroup$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateDisbursementGroup),
    mergeMap(action => this.projectsService.createDisbursementGroup(DisbursementGroup.toDto(action.disbursementGroup))
      .pipe(
        switchMap(() => ([
          actions.CreateDisbursementGroupSuccess({ modal: action.modal }),
          actions.RefreshDisbursementGroupList({ projectId: action.disbursementGroup.projectId }),
        ])),
        catchError(error => of(actions.CreateOrUpdateDisbursementGroupError({ error }))),
      )),
  ));

  createDisbursementGroupSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateDisbursementGroupSuccess),
    tap(({ modal }) => {
      modal.hide();
      this.toaster.showSuccess('New disbursement group was created');
    }),
  ), { dispatch: false });

  updateDisbursementGroup$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateDisbursementGroup),
    mergeMap(action => this.projectsService.updateDisbursementGroup(DisbursementGroup.toDto(action.disbursementGroup))
      .pipe(
        switchMap(() => ([
          actions.UpdateDisbursementGroupSuccess({ modal: action.modal }),
          actions.RefreshDisbursementGroupList({ projectId: action.disbursementGroup.projectId }),
        ])),
        catchError(error => of(actions.CreateOrUpdateDisbursementGroupError({ error }))),
      )),
  ));

  updateDisbursementGroupSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateDisbursementGroupSuccess),
    tap(({ modal }) => {
      modal.hide();
      this.toaster.showSuccess('Disbursement group was updated');
    }),
  ), { dispatch: false });

  deleteDisbursementGroup$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueDeleteDisbursementGroup),
    mergeMap(action => this.disbursementGroupsService.validateByActionTemplateId(action.batchAction)
      .pipe(
        switchMap(() => ([])),
        catchError(error => of(actions.DeleteDisbursementGroupError({ errorMessage: error }))),
      )),
  ));

  deleteDisbursementGroupSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteDisbursementGroupSuccess),
    tap(({modal}) => {
      modal.hide();
      this.toaster.showSuccess('Disbursement group was deleted');
    }),
  ), { dispatch: false });

  // Project payment requests effects

  readonly getDisbursementsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentRequestsList),
    mergeMap(action => this.disbursementsService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetPaymentRequestsListSuccess({
            paymentRequests: response.items.map(PaymentRequestSummary.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetPaymentRequestsListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  readonly getManualPaymentRequestsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetManualPaymentRequestsList),
    mergeMap(action => this.disbursementsService.getManualPaymentRequests(action.caseId, action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetManualPaymentRequestsListSuccess({
            paymentRequests: response.items.map(PaymentRequestSummary.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetManualPaymentRequestsListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  readonly getManualPaymentRequestsListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetManualPaymentRequestsListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.paymentRequests, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  readonly getDisbursementsListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentRequestsListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.paymentRequests, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  // Chart of accounts effects

  getProjectChartOfAccounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetChartOfAccountsList),
    mergeMap(action => this.chartOfAccountsService.getChartOfAccounts(action.projectId)
      .pipe(
        switchMap(response => [
          actions.GetChartOfAccountsListSuccess({ chartOfAccounts: response.map(ChartOfAccountProjectConfig.toModel) }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getChartOfAccountsSettingsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetChartOfAccountsSettingsList),
    mergeMap(action => this.chartOfAccountsService.getChartOfAccountsSettings(action.projectId)
      .pipe(
        switchMap(response => [
          actions.GetChartOfAccountsSettingsListSuccess({ chartOfAccountsSettings: response.map(ChartOfAccountSettings.toModel) }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  saveChartOfAccounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveChartOfAccounts),
    mergeMap(action => this.chartOfAccountsService.updateChartOfAccounts(action.projectId, action.data)
      .pipe(
        switchMap(() => ([
          actions.SaveChartOfAccountsSuccess(),
        ])),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  updateChartOfAccountSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveChartOfAccountsSuccess),
    tap(() => this.toaster.showSuccess('Chart of Accounts saved successfully')),
  ), { dispatch: false });

  getUsedChartOfAccountsNOs$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetUsedChartOfAccountsNOs),
    mergeMap(action => this.chartOfAccountsService.getUsedChartOfAccountsNos(action.projectId)
      .pipe(
        switchMap(response => [
          actions.GetUsedChartOfAccountsNOsSuccess({ usedChartOfAccountsNOs: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectChartOfAccountModes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetChartOfAccountModes),
    mergeMap(action => this.chartOfAccountsService.getChartOfAccountModes(action.chartOfAccountId)
      .pipe(
        switchMap(chartOfAccountModes => [
          actions.GetChartOfAccountModesSuccess({ chartOfAccountModes }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectChartOfAccountDisbursementModes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetChartOfAccountDisbursementModes),
    mergeMap(() => this.chartOfAccountsService.getChartOfAccountDisbursementModes()
      .pipe(
        switchMap(response => [
          actions.GetChartOfAccountDisbursementModesSuccess({ chartOfAccountDisbursementModes: SelectHelper.toOptions(response) }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly getProjectOrgs$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectOrgs),
    mergeMap(action => this.orgsService.getByCaseId(action.projectId)
      .pipe(
        switchMap(response => {
          const items = response.items.map(ProjectOrganization.toModel);
          const projectOrganizationItems = new Array<ProjectOrganizationItem>();
          items.forEach(item => projectOrganizationItems.push(...ProjectOrganizationItem.toItems(item)));
          return [
            actions.GetProjectOrgsSuccess({ items: projectOrganizationItems }),
          ];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly getProjectOrgsDropdownValues$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectOrgsDropdownValues),
    mergeMap(action => this.orgsService.getByCaseIdWithTypes(action.projectId)
      .pipe(
        switchMap(response => {
          const orgsList = response.items.map(item => new IdValue(item.id, item.name));
          return [actions.GetProjectOrgsDropdownValuesSuccess({ items: orgsList })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  downloadProjectOrgs$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadProjectOrgs),
    mergeMap(action => {
      return this.projectsService.exportProjectOrgs(action.id, ExportName[ExportName.ProjectOrgs], action.searchOptions, action.columns, action.channelName).pipe(
        switchMap(() => [actions.DownloadProjectOrgsComplete()]),
        catchError(error => of(actions.Error({ error }))),
      );
    }),
  ));

  gotoOrg$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToOrg),
    tap(action => {
      this.router.navigate([`/admin/user/orgs/${action.id}/my-organization`], { state: { restoreSearch: true } });
    }),
  ), { dispatch: false });

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    filter(action => isString(action.error)),
    tap(data => {
      this.toaster.showError(data.error);
    }),
  ), { dispatch: false });

  getContactsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetContactsList),
    withLatestFrom(this.store$.select(selectors.clientGridParams)),
    mergeMap(([action]) => {
      const isDeficiencyReport = action.isDeficiencyReport ?? false;
      return this.projectContactsService.getContacts(action.agGridParams.request, action.projectId, isDeficiencyReport)
        .pipe(
          switchMap(response => [
            actions.GetContactsListSuccess({
              contacts: response.items.map(ProjectContactReference.toModel),
              totalRecords: response.totalRecordsCount,
              agGridParams: action.agGridParams,
            }),
          ]),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  getContactsListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetContactsListSuccess),
    tap(action => {
      action.agGridParams?.success({ rowData: action.contacts, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  refreshContactsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshContactsList),
    withLatestFrom(this.store$.select(selectors.contactsGridParams)),
    switchMap(([action, agGridParams]) => [
      actions.GetContactsList({ projectId: action.projectId, agGridParams, isDeficiencyReport: action.isDeficiencyReport }),
    ]),
  ));

  createOrUpdateContact$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateOrUpdateContact),
    withLatestFrom(this.store$.select(selectors.item)),
    mergeMap(
      ([{ contact, isDeficiencyReport }, item]) => (this.projectContactsService.putsert(contact))
        .pipe(
          switchMap(() => ([
            actions.CreateOrUpdateContactSuccess({ successMessage: contact.id ? 'Contact Updated' : 'Contact Created' }),
            actions.RefreshContactsList({ projectId: item.id, isDeficiencyReport: isDeficiencyReport }),
          ])),
          catchError(error => of(actions.CreateOrUpdateContactError({ error }))),
        ),
    ),
  ));

  createOrUpdateContactSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateOrUpdateContactSuccess),
    tap(action => this.toaster.showSuccess(action.successMessage)),
  ), { dispatch: false });

  getProjectContactRoles$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectContactRoles),
    mergeMap(action => this.projectContactsService.getProjectContactRoles(action.id, action.isMaster)
      .pipe(
        switchMap(response => {
          return [
            actions.GetProjectContactRolesSuccess({ roles: response as IdValue[] }),
          ];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getClosingStatementTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClosingStatementTemplates),
    mergeMap(action => (this.ledgerSettingsService.getClosingStatementTemplates(action.projectId, action.isProjectAssociated))
      .pipe(
        switchMap(closingStatementTemplates => [
          actions.GetClosingStatementTemplatesSuccess({ closingStatementTemplates }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getDisbursementsTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDisbursementsTemplates),
    mergeMap(action => (this.ledgerSettingsService.getDisbursementsTemplates(action.templateId))
      .pipe(
        switchMap(disbursementsTemplates => [
          actions.GetDisbursementsTemplatesSuccess({ disbursementsTemplates }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  searchInvoiceItems$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchInvoiceItems),
    mergeMap(action => this.billingRuleService.searchInvoiceItems(action.agGridParams.request)
      .pipe(
        switchMap(response => {
          const items = response.items.map(InvoiceItem.toModel);
          action.agGridParams.success({ rowData: items, rowCount: response.totalRecordsCount });
          return [actions.SearchInvoiceItemsSuccess()];
        }),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  exportInvoiceItems$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ExportInvoiceItems),
    mergeMap(action => this.billingRuleService.export(action.exportRequest)
      .pipe(
        switchMap(() => EMPTY),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  startFinancialProcessorForProject$ = createEffect(() => this.actions$.pipe(
    ofType(actions.StartFinancialProcessorForProject),
    mergeMap(action => this.financialProcessorService.startProjectProcessing(action.projectId, action.pusherChannelName)
      .pipe(
        tap(() => {
          this.toaster.showSuccess('Started Financial Processor');
        }),
        catchError(error => [actions.Error(error)]),
      )),
  ), { dispatch: false });

  getFinancialProcessorLatestRun$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetFinancialProcessorLatestRun),
    mergeMap(action => this.financialProcessorService.getLatestRun(action.entityType, action.entityId)
      .pipe(
        switchMap(response => [actions.GetFinancialProcessorLatestRunSuccess({ latestRun: FinancialProcessorRun.toModel(response[0]) })]),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  readonly getTabCounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTabCounts),
    map(action => tabInfoActions.GetTabsCount({
      entityId: action.projectId,
      entityTypeId: EntityTypeEnum.Projects,
      tabsList: [
        EntityTypeEnum.Notes,
        EntityTypeEnum.ProjectsCommunications,
      ],
    })),
  ));

  getProjectStart$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectLoadingStarted),
    map(action => rootActions.LoadingStarted({
      actionNames: [
        actions.GetItem.type,
        actions.GetProjectServices.type,
      ].concat(action.additionalActionNames || [] as any),
    })),
  ));

  getProjectReceivables$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectReceivables),
    mergeMap(action => this.projectReceivablesService.getProjectReceivables(action.id)
      .pipe(
        switchMap(response => {
          const receivables = response.projectReceivableCategories.map(item => ProjectReceivable.toModel(item));
          return [actions.GetProjectReceivablesSuccess({ projectReceivables: receivables })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  setProjectReceivablesToDefault$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SetProjectReceivablesToDefault),
    mergeMap(action => this.projectReceivablesService.setProjectReceivablesToDefault(action.projectId, action.sectionId, action.groupId)
      .pipe(
        switchMap(response => {
          const resetGroup: ReceivableGroup = response;
          return [actions.SetProjectReceivablesToDefaultSuccess({ sectionId: action.sectionId, resetGroup })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  saveProjectReceivables$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveProjectReceivables),
    mergeMap(action => this.projectReceivablesService.updateProjectReceivables(action.id, action.changedItems)
      .pipe(
        switchMap(response => {
          const receivables = response.projectReceivableCategories.map(item => ProjectReceivable.toModel(item));
          return [actions.SaveProjectReceivablesSuccess({ projectReceivables: receivables })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  saveProjectReceivablesSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveProjectReceivablesSuccess),
    tap(() => {
      return this.toaster.showSuccess('Receivables saved successfully');
    }),
  ), { dispatch: false });

  getDeficienciesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficienciesList),
    withLatestFrom(this.store$.select(selectors.item)),
    mergeMap(([action, item]) => this.deficiencyService.searchProjectDeficiencies(action.params.request, item.id).pipe(
      switchMap(response => {
        const deficiencies: Deficiency[] = response.items.map(deficiency => Deficiency.toModel(deficiency));
        return [actions.GetDeficienciesListSuccess({
          deficiencies,
          agGridParams: action.params,
          totalRecords: response.totalRecordsCount,
        })];
      }),
    )),
  ));

  getDeficienciesListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficienciesListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.deficiencies, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  refreshDeficienciesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshDeficienciesList),
    withLatestFrom(this.store$.select(selectors.deficienciesGridParams)),
    switchMap(([, agGridParams]) => [
      actions.GetDeficienciesList({ params: agGridParams }),
    ]),
  ));

  overrideDeficiency$ = createEffect(() => this.actions$.pipe(
    ofType(actions.OverrideDeficiency),
    mergeMap(action => this.deficiencyService.overrideDeficiency(action.id, action.caseId).pipe(
      switchMap(() => [
        actions.OverrideDeficiencySuccess(),
        actions.RefreshDeficienciesList(),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  overrideDeficiencyComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.OverrideDeficiencySuccess),
    map(() => [this.toaster.showSuccess('Deficiency Cured')]),
  ), { dispatch: false });

  getPortalDeficienciesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPortalDeficienciesList),
    withLatestFrom(this.store$.select(selectors.item)),
    mergeMap(([action, item]) => this.portalDeficiencyService.searchProjectDeficiencies(action.params.request, item.id).pipe(
      switchMap(response => {
        const deficiencies: PortalDeficiency[] = response.items.map(deficiency => PortalDeficiency.toModel(deficiency));
        return [actions.GetPortalDeficienciesListSuccess({
          deficiencies,
          agGridParams: action.params,
          totalRecords: response.totalRecordsCount,
        })];
      }),
    )),
  ));

  getPortalDeficienciesListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPortalDeficienciesListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.deficiencies, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  loadTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.LoadTemplates),
    mergeMap((action: {
      templateTypes: number[];
      entityTypeId: number;
      documentTypes: number[];
      entityId?: number;
    } & TypedAction<'[Project] Load Templates'>) => this.docGenerationsService.getTemplates(action.templateTypes, action.entityTypeId, action.documentTypes, action.entityId).pipe(
      switchMap(data => [
        actions.LoadTemplatesComplete({ data }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  generateDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GenerateDocuments),
    mergeMap((action: {
      controller: ControllerEndpoints;
      request: SaveDocumentGeneratorRequest;
    } & TypedAction<'[Project] Generate Documents'>) => this.docGenerationsService.generate(action.controller, action.request)
      .pipe(
        switchMap((generationRequest: SaveDocumentGeneratorRequest) => [actions.GenerateDocumentsComplete({ generationRequest })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectFirmsOptions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectFirmsOptions),
    mergeMap(action => this.orgService.getFirmsByProjectId(action.projectId)
      .pipe(
        switchMap(response => [actions.GetProjectFirmsOptionsSuccess({ values: response })]),
      )),
    catchError(error => of(actions.Error({ error }))),
  ));

  validatePaymentRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ValidatePaymentRequest),
    mergeMap(action => this.disbursementsService.validatePaymentRequest(action.paymentRequest)
      .pipe(
        switchMap((documentImport: DocumentImport) => [
          actions.ValidatePaymentRequestSuccess({ documentImport: DocumentImport.toModel(documentImport) }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  validatePaymentRequestSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ValidatePaymentRequestSuccess),
    tap(() => this.toaster.showSuccess('Document was submitted')),
  ), { dispatch: false });

  getDocumentImportsResultRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentRequestImportsResultRequest),
    mergeMap(action => {
      return this.documentImportService.getDocumentImportsResult(
        action.entityId,
        action.documentTypeId,
        AGGridHelper.getDefaultSearchRequest(),
      )
        .pipe(
          switchMap(response => {
            return [
              actions.GetPaymentRequestImportsResultRequestSuccess({ validationResults: ValidationResults.toModel(response) }),
            ];
          }),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  getValidationDocument$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetValidationDocument),
    mergeMap(action => {
      return this.documentsService.downloadDocument(action.previewDocId)
        .pipe(
          switchMap(() => []),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  getBatchActionResultRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBatchActionResultRequest),
    mergeMap(action => {
      const agGridParams = action.agGridParams;

      return this.batchActionsService.getBatchActionDocumentResult(
        action.entityId,
        action.documentTypeId,
        agGridParams ? agGridParams.request : null,
        action.status,
      )
        .pipe(
          switchMap(response => {
            const result = { ...response };
            return [
              actions.GetBatchActionResultRequestSuccess({
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

  getBatchActionResultRequestSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBatchActionResultRequestSuccess),
    tap(action => {
      let gridRows: ValidationResultsLineItem[] | ValidationResultErrorGridRow[] = action.validationResults.rows;
      const rowsCount = ValidationResults.getCount(action.validationResults, action.tab);
      if (action.tab === FileImportReviewTabs.Errors || action.tab === FileImportReviewTabs.Warnings) {
        gridRows = ValidationResultErrorGridRow.toFlattenedArrayOfModels(action.validationResults.rows);
      }
      action.agGridParams.success({ rowData: gridRows, rowCount: rowsCount});
    }),
  ), { dispatch: false });

  hasDuplicateClaimantIdsRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.HasDuplicateClaimantIdsRequest),
    mergeMap(action => this.claimantsSummaryService.hasDuplicateClaimantIds(action.searchOptions)
      .pipe(
        switchMap(response => {
          return [actions.HasDuplicateClaimantIdsSuccess({ hasDuplicateClaimantIds: response })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  submitPaymentRequestImportsResultRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SubmitPaymentRequestImportsResultRequest),
    mergeMap(action => {
      return this.disbursementsService.approveManualPaymentRequests(action.submitData)
        .pipe(
          switchMap(response => {
            return [
              actions.SubmitPaymentRequestImportsResultRequestSuccess({ submitData: response }),
            ];
          }),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  manualPaymentRequestDocsRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ManualPaymentRequestDocsRequest),
    withLatestFrom(this.store$.select(selectors.item), this.store$.select(selectors.manualPaymentGridParams)),
    mergeMap(([action, project, manualPaymentGridParams]) => {
      return this.disbursementsService.uploadDocumentForPaymentRequests(action.manualPaymentRequestDocs)
        .pipe(
          switchMap(response => {
            return [actions.ManualPaymentRequestDocsRequestSuccess({
              manualPaymentRequestDocsResponse: {
                paymentRequestId: response.paymentRequestId,
                numberOfClaims: response.numberOfClaims,
                paymentsCount: response.paymentsCount,
              },
            }),
            actions.GetManualPaymentRequestsList({ caseId: project.id, agGridParams: manualPaymentGridParams })];
          }),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  readonly getClosingStatementList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClosingStatementList),
    mergeMap(action => this.projectsService.getClosingStatement(action.caseId, action.agGridParams.request)
      .pipe(
        switchMap(response => {
          const result = response?.items.map(item => (Document.toModel(item)));
          return [
            actions.GetClosingStatementListSuccess({
              closingStatement: result,
              agGridParams: action.agGridParams,
              totalRecords: response.totalRecordsCount,
            })];
        }),
        catchError(error => of(actions.GetClosingStatementListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  readonly getClosingStatementListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClosingStatementListSuccess),
    tap(action => {
      const closingStatements = action.closingStatement;
      const statuses = closingStatements
      .map(cs => cs.closingStatement?.electronicDelivery?.externalStatus)
      .filter(status => status !== undefined);

      const isSingleRecordVoided = closingStatements.length === 1 && statuses[0] === VoidClosingStatementEnum.voided;
      const allVoided = statuses.length > 0 && statuses.every(status => status === VoidClosingStatementEnum.voided);
      const isButtonDisabled = isSingleRecordVoided || allVoided;
      action.agGridParams.success({ rowData: action.closingStatement, rowCount: action.totalRecords});
      this.store$.dispatch(actions.SendEDeliveryButtonDisabled({ isDisabled: isButtonDisabled }));
    }),
  ), { dispatch: false });

  getBatchDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBatchDetails),
    mergeMap(action => this.projectsService.getBatchDetails(action.caseId, action.batchId, action.documentId)
      .pipe(
        switchMap(response => {
          return [
            actions.GetBatchDetailsSuccess({
              batchDetails: response as BatchDetails,
            })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  updateQcStatus$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateQcStatus),
    mergeMap(action => this.projectsService.updateQcStatus(action.batchId, action.qcStatus)
      .pipe(
        switchMap(() => {
          return [
            actions.GetUpdatedQcStatus({ caseId: action.caseId, batchId: action.batchId, documentId: action.documentId }),
          ];
        }),
        catchError(error => of(actions.UpdateQcStatusError({ errorMessage: error }))),
      )),
  ));

  getUpdatedQcStatus$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetUpdatedQcStatus),
    mergeMap(action => this.projectsService.getBatchDetails(action.caseId, action.batchId, action.documentId)
      .pipe(
        switchMap(response => {
          return [
            actions.GetUpdatedQcStatusSuccess({
              batchDetails: response as BatchDetails,
            })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  updateQcStatusSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetUpdatedQcStatusSuccess),
    tap(() => this.toaster.showSuccess('QC Status successfully updated')),
  ), { dispatch: false });

  updateQcStatusError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateQcStatusError),
    tap(action => this.toaster.showError(action.errorMessage ? action.errorMessage : 'Not able to update QC Status')),
  ), { dispatch: false });

  getClosingStatementDoc$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClosingStatementDoc),
    mergeMap(action => this.projectsService.getClosingStatementDoc(action.docId)
      .pipe(
        switchMap(data => [actions.GetClosingStatementDocSuccess({ channel: data })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  downloadClosingStatementList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadClosingStatementList),
    mergeMap(action => this.projectsService.exportClosingStatementList(
      action.id,
      ExportName[ExportName.ClosingStatements],
      action.searchOptions,
      action.columns,
      action.channelName,
    ).pipe(
      switchMap(data => [actions.DownloadClosingStatementListComplete({ channel: data })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getClosingStatementBatch$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClosingStatementBatch),
    mergeMap(action => this.projectsService.getClosingStatementBatch(action.batchId)
      .pipe(
        switchMap(data => [actions.GetClosingStatementDocSuccess({ channel: data })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  downloadClosingStatementBatchLog$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadClosingStatementBatchLog),
    mergeMap(action => this.projectsService.downloadClosingStatementBatchLog(action.batchId)
      .pipe(
        switchMap(() => [actions.DownloadClosingStatementBatchLogSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  enqueueSendDocuSignDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueSendDocuSignDocuments),
    mergeMap(action => this.batchActionsService.create(action.batchAction)
      .pipe(
        switchMap(batchActionData => this.batchActionsService.process(batchActionData.id).pipe(
          switchMap(() => [
            actions.EnqueueSendDocuSignDocumentsSuccess({ batchAction: BatchAction.toModel(batchActionData) }),
          ]),
          catchError(error => of(actions.Error({ error }))),
        )),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  enqueueApproveSendDocuSignDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueApproveSendDocuSignDocuments),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [actions.EnqueueApproveSendDocuSignDocumentsSuccess()]),
        catchError((error: any) => of(actions.Error({ error }))),
      )),
  ));

  sendDocuSignDocumentsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SendDocuSignDocumentsCompleted)//,
   // tap(() => this.toaster.showSuccess('DocuSign Documents sent successfully.')),
  ), { dispatch: false });

  downloadProjects$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadProjects),
    mergeMap(action => {
      return this.projectsService.exportProjectsList(
        ExportName[ExportName.Projects],
        action.searchOptions,
        action.columns,
        action.channelName,
      ).pipe(
        switchMap(data => [actions.DownloadProjectsComplete({ channel: data })]),
        catchError(error => of(actions.Error({ error }))),
      );
    }),
  ));

  getBatchActionDeficienciesRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBatchActionDeficienciesRequest),
    mergeMap(action => {
      return this.batchActionsService.getBatchActionWarningsRequest(
        action.batchActionId,
        action.documentTypeId,
      )
        .pipe(
          switchMap(response => {
            return [
              actions.GetBatchActionDeficienciesSuccess({
                batchActionDeficienciesReview: BatchActionReviewOptions.toModel(response),
              }),
            ];
          }),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  createProjectOrganizationMessage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateProjectOrganizationMessage),
    mergeMap(action => this.projectMessagingService.createProjectOrganizationMessage(action.message)
      .pipe(
        switchMap(() => {
          return [actions.GetProjectFirmsMessaging({ projectId: action.message.projectId }),
            actions.CreateProjectOrganizationMessageSuccess()];
        }),
        catchError(error => { return of(actions.Error({ error })); }),
      )),
  ));

  editProjectOrganizationMessage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EditProjectOrganizationMessage),
    mergeMap(action => this.projectMessagingService.editProjectOrganizationMessage(action.id, action.message)
      .pipe(
        switchMap(() => {
          return [actions.GetProjectFirmsMessaging({ projectId: action.message.projectId }),
            actions.EditProjectOrganizationMessageSuccess()];
        }),
        catchError(error => { return of(actions.Error({ error })); }),
      )),
  ));

  createProjectOrganizationMessageSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateProjectOrganizationMessageSuccess),
    tap(() => this.toaster.showSuccess('Message saved successfully')),
  ), { dispatch: false });

  updateProjectOrganizationMessageSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EditProjectOrganizationMessageSuccess),
    tap(() => this.toaster.showSuccess('Message updated successfully')),
  ), { dispatch: false });

  getProjectMessagesRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectMessagesRequest),
    mergeMap(action => this.projectMessagingService.getProjectMessagingSettings(action.projectId)
      .pipe(
        switchMap(response => {
          const messages = response?.map(item => ProjectMessage.toModel(item));
          return [actions.GetProjectMessagesSuccess({ messages })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectMessagesTypesRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectMessagesTypesRequest),
    mergeMap(() => this.projectMessagingService.getProjectMessagesTypes()
      .pipe(
        switchMap(response => [actions.GetProjectMessagesTypesSuccess({ items: response })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  saveProjectMessages$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveProjectMessages),
    withLatestFrom(this.store$.select(selectors.projectMessagesModified)),
    mergeMap(([action, messagesModified]) => this.projectMessagingService.saveProjectMessages(action.projectId, messagesModified)
      .pipe(
        switchMap(response => {
          const messages = response?.map(item => ProjectMessage.toModel(item));
          return [actions.SaveProjectMessagesSuccess({ messages })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectFirmsMessaging$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectFirmsMessaging),
    mergeMap(action => this.projectMessagingService.getProjectCustomMessaging(action.projectId)
      .pipe(
        switchMap(response => {
          const messages = response?.map(item => ProjectCustomMessage.toModel(item));
          return [actions.GetProjectFirmsMessagingSuccess({ projectCustomMessages: messages })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  batchUpdateLedgerStageError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.BatchUpdateLedgerStageError),
    switchMap(action => this.messageService.showAlertDialog(
      'Update Stage Error',
      action.errorMessage,
    ).pipe(
      filter(confirmed => !!confirmed),
      tap(() => action.bsModalRef.hide()),
    )),
  ), { dispatch: false });

  getDeficiencySettingsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficiencySettingsList),
    mergeMap(action => this.deficiencySettingsService.getDeficiencySettings(action.projectId)
      .pipe(
        switchMap(response => [
          actions.GetDeficiencySettingsListSuccess({ deficiencySettings: response.map(DeficiencySettingsConfig.toModel) }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  saveDeficiencySettings$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveDeficiencySettings),
    mergeMap(action => this.deficiencySettingsService.updateDeficiencySettings(action.projectId, action.data)
      .pipe(
        switchMap(() => ([
          actions.SaveDeficiencySettingsSuccess({ projectId: action.projectId }),
        ])),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  saveDeficiencySettingsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveDeficiencySettingsSuccess),
    tap(action => {
      this.toaster.showSuccess('Deficiency Settings saved successfully');
      this.store$.dispatch(actions.GetDeficiencySettingsList({ projectId: action.projectId }));
    }),
  ), { dispatch: false });

  getOrgPaymentStatusList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgPaymentStatusList),
    mergeMap(action => this.orgService.getOrganizationPaymentStatuses(action.projectId, action.orgId, action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetOrgPaymentStatusListSuccess({
            paymentStatuses: response.items.map(OrganizationPaymentStatus.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetOrgPaymentStatusListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  getOrgPaymentStatusListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgPaymentStatusListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.paymentStatuses, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  downloadOrgPaymentStatus$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadOrgPaymentStatus),
    mergeMap(action => this.projectsService.exportOrganizationPaymentStatuses(
      action.projectId,
      action.orgId,
      action.searchOptions,
      ExportName[ExportName.Projects],
      action.columns,
      action.channelName,
    ).pipe(
      switchMap(() => [actions.DownloadOrgPaymentStatusSuccess()]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  enqueueUpdateFundedDateValidation$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueUpdateFundedDateValidation),
    mergeMap(action => this.batchActionsService.create(action.batchAction).pipe(
      switchMap((batchActionResult: BatchAction) => {
        const batchAction = BatchAction.toModel(batchActionResult);
        return this.batchActionsService.process(batchAction.id).pipe(
          switchMap(() => [
            actions.EnqueueUpdateFundedDateValidationSuccess({ batchAction }),
          ]),
          catchError((error: any) => of(actions.UpdateFundedDateValidationError({ errorMessage: error.errorMessage })))
        );
      }),
      catchError((error: any) => of(actions.UpdateFundedDateValidationError({ errorMessage: error.errorMessage })))
    )),
  ));

  updateFundedDateApprove$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateFundedDateApprove),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [actions.UpdateFundedDateApproveSuccess()]),
        catchError((error: any) => of(actions.UpdateFundedDateApproveError({ errorMessage: error.errorMessage }))),
      )),
  ));

  generateTranfersRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GenerateTransferRequest),
    mergeMap(action => this.batchActionsService.create(action.params).pipe(
      switchMap(batchActionData => this.batchActionsService.review(batchActionData.id).pipe(
        switchMap(() => [
          actions.GenerateTransferRequestSuccess({ batchActionData }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  reviewTransferRequestJob$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ReviewTransferRequestJob),
    mergeMap(action => this.batchActionsService.review(action.transferRequestId)
      .pipe(
        switchMap(() => [actions.ReviewTransferRequestJobSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly getTransferRequestDeficiencies$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTransferDeficiencies),
    mergeMap(action => {
      return this.transfersService.getTransferRequest(action.transferRequestId)
        .pipe(
          switchMap((transferRequest: TransferRequestDto) => {
            return [
              actions.GetPaymentRequestReviewWarningsSuccess({
                requestDeficiencies: transferRequest.reviewOptions,
              }),
              actions.GetTransferRequestSuccess({ transferRequest }),
            ];
          }),
          catchError((error: string) => of(actions.Error({ error }))),
        );
    }),
  ));

  updateTransferOptions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateTransferOptions),
    mergeMap(action => this.transfersService.updateTransferOptions(action.transferRequestId, action.params).pipe(
      switchMap(() => [
        actions.UpdateTransferOptionsSuccess(),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  proccessTransfersRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ProccessTransferRequest),
    mergeMap(action => this.batchActionsService.process(action.batchActionId).pipe(
      switchMap(() => [
        actions.ProccessTransferRequestSuccess(),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getTransferItems$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTransfersItems),
    mergeMap(action => this.transfersService.getTransferItems(action.transferRequestId)
      .pipe(
        switchMap(transferItemsData => [
          actions.GetTransfersItemsSuccess({ transferData: TransferItemsResponse.toModel(transferItemsData) }),
        ]),
      )),
    catchError(error => of(actions.Error({ error }))),
  ));

  getReviewTransfers$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetReviewTransfers),
    mergeMap(action => this.transfersService.getReviewTransfers(action.transferRequestId)
      .pipe(
        switchMap(transferItemsData => [
          actions.GetTransfersItemsSuccess({ transferData: TransferItemsResponse.toModel(transferItemsData) }),
        ]),
      )),
    catchError(error => of(actions.Error({ error }))),
  ));

  acceptTransfer$ = createEffect(() => this.actions$.pipe(
    ofType(actions.AcceptTransferRequest),
    mergeMap(action => this.transfersService.acceptTransferRequest(action.transferRequestId, action.request)
      .pipe(
        switchMap(() => [
          actions.AcceptTransferRequestSuccess(),
        ]),
      )),
    catchError(error => of(actions.Error({ error }))),
  ));

  loadTransfer$ = createEffect(() => this.actions$.pipe(
    ofType(actions.LoadTransferRequest),
    mergeMap(action => this.batchActionsService.load(action.batchActionId)
      .pipe(
        switchMap(() => [
          actions.LoadTransferRequestSuccess(),
        ]),
      )),
    catchError(error => of(actions.Error({ error }))),
  ));

  getBatchAction$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBatchAction),
    mergeMap(action => this.batchActionsService.getBatch(action.batchActionId)
      .pipe(
        switchMap((batchActionData: BatchAction) => [
          actions.GetBatchActionSuccess({ batchActionData }),
        ]),
      )),
    catchError(error => of(actions.Error({ error }))),
  ));

  checkMaintenance$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CheckMaintenance),
    mergeMap(() => this.maintenanceService.getById(MaintenanceIdEnum.PreventElectronicDelivery)
      .pipe(
        switchMap((maintance: Maintenance) => [actions.CheckMaintenanceSuccess({ isMaintance: maintance?.value === '1' })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));
  validateMaintenance$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ValidateMaintenance),
    mergeMap(() => this.maintenanceService.getById(MaintenanceIdEnum.PreventElectronicDelivery)
      .pipe(
        switchMap((maintance: Maintenance) => [actions.ValidateMaintenanceCompleted({ isMaintance: maintance?.value === '1' })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  // Project Reporting
  createReportSchedule$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateReportSchedule),
    mergeMap(action => this.projectsService.scheduleReport(action.reportSchedule)
      .pipe(
        switchMap(() => [
          actions.CreateReportScheduleSuccess({ successMessage: 'Report Scheduled' }),
          actions.RefreshReportScheduleList(),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
      )
    );

  createReportScheduleSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateReportScheduleSuccess),
    tap(action => this.toaster.showSuccess(action.successMessage)),
  ), { dispatch: false });

  getReportScheduleList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetReportScheduleList),
    withLatestFrom(this.store$.select(selectors.item)),
    mergeMap(([action, item]) => this.projectsService.getScheduledReports(action.params.request, item.id).pipe(
      switchMap(response => {
        const scheduledReports: ScheduledReport[] = response.items.map(scheduledReport => ScheduledReport.toModel(scheduledReport));
        return [actions.GetReportScheduleListSuccess({
          scheduledReports,
          agGridParams: action.params,
          totalRecords: response.totalRecordsCount,
        })];
      }),
    )),
  ));

  getReportScheduleListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetReportScheduleListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.scheduledReports, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  refreshReportScheduleList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshReportScheduleList),
    withLatestFrom(this.store$.select(selectors.scheduledReportsGridParams)),
    switchMap(([, agGridParams]) =>
      of(actions.GetReportScheduleList({ params: agGridParams })),
  ),
));

  getReportSchedule$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetReportSchedule),
    mergeMap(action => this.projectsService.getReportSchedule(action.id)
    .pipe(
      switchMap(reportSchedule => [
        actions.GetReportScheduleSuccess({ reportSchedule: ReportSchedule.toModel(reportSchedule) }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  updateReportSchedule$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateReportSchedule),
    mergeMap(action => this.projectsService.updateReportSchedule(action.reportSchedule)
      .pipe(
        switchMap(() => [
          actions.UpdateReportScheduleSuccess({ successMessage: 'Report Schedule Updated'}),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
    ));

  updateReportScheduleSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateReportScheduleSuccess),
    tap(action => this.toaster.showSuccess(action.successMessage)),
  ), { dispatch: false });

  getManualRequestDocumentImportsRowsRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetManualPaymentRequestImportsRowsRequest),
    mergeMap(action => {
      return this.disbursementsService.searchPaymentRequestItemsSummary(
        action.params,
      )
        .pipe(
          switchMap(response => {
            return [
              actions.GetManualPaymentResultBankAccounts({ manualPaymentItemsRows: ManualPaymentItemRowModel.toModel(response), agGridParams: action.agGridParams }),
            ];
          }),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  getBankAccountsManualRowsRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetManualPaymentResultBankAccounts),
    mergeMap(action => {
      let orgIds: number[] = [];
      action.manualPaymentItemsRows.forEach(row => {
        if (row.organizationId && orgIds.findIndex((o: number) => o ==row.organizationId) == -1) {
          orgIds.push(row.organizationId);
        }
      });
      return this.bankAccountsService.getListByOrgIds(orgIds)
        .pipe(
          switchMap(manualPaymentBankAccounts => {
            return [
              actions.GetManualPaymentResultBankAccountsSuccess({ manualPaymentBankAccounts }),
              actions.GetManualPaymentRequestImportsRowsRequestSuccess({ manualPaymentItemsRows: action.manualPaymentItemsRows, agGridParams: action.agGridParams }),
            ];
          }),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  getManualRequestDocumentImportsRowsRequestSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetManualPaymentRequestImportsRowsRequestSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.manualPaymentItemsRows, rowCount: action.manualPaymentItemsRows.length});
    }),
  ), { dispatch: false });

}
