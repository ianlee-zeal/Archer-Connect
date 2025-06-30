import { Document } from '@app/models/documents/document';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { Project,
  LienService,
  DashboardData,
  DashboardRow,
  ColumnExport,
  IGeneratePaymentRequest,
  PaymentItemListResponse,
  IdValue,
  ProjectOrganizationItem,
  PaymentRequestSummary,
  ProjectCustomMessage,
  FinalizationCount,
  IGeneratePaymentRequestGlobal,
  TransferItemsResponse,
  BankAccount} from '@app/models';
import { NavigationSettings } from '@app/modules/shared/action-bar/navigation-settings';
import { DocumentImport, DocumentImportTemplate, SaveDocumentGeneratorRequest } from '@app/models/documents';
import { ProjectDetails } from '@app/models/projects/project-details';
import { ProjectOverviewDashboardSearchOptions, ProjectOverviewDashboardClaimantItem, ProjectOverviewStatistics, ChartOfAccountProjectConfig, ChartOfAccountMode } from '@app/models/projects';
import { ControllerEndpoints, EntityTypeEnum, FileImportDocumentType, FileImportReviewTabs, FileImportTemplateTypes, ProductCategory } from '@app/models/enums';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/actions';
import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { DisbursementGroup } from '@app/models/disbursement-group';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjectDto } from '@app/models/projects/project-dto';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings/claim-settlement-ledger-settings';
import { ChartOfAccountSettings } from '@app/models/closing-statement/chart-of-account-settings';
import { ProjectContactReference, ProjectContactReferenceAddEdit } from '@app/models/project-contact-reference';
import { ISearchOptions } from '@app/models/search-options';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import { FinancialProcessorRun } from '@app/models/financial-processor-run';
import { LedgerInfoSearchResult } from '@app/models/ledger-info-search-result';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { IDictionary } from '@app/models/utils';
import { ProjectReceivable } from '@app/models/projects/project-receivable/project-receivable';
import { Deficiency } from '@app/models/deficiency';
import { ReceivableGroup } from '@app/models/projects/project-receivable/project-receivable-group';
import { PaymentRequestResultResponse } from '@app/models/payment-request/payment-request-result-response';
import { PaymentRequestUpload } from '@app/models/payment-request-upload';
import { ValidationResults } from '@app/models/file-imports';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { ManualPaymentRequestDocs } from '@app/models/manual-payment-request-docs';
import { IUpdatePaymentRequest } from '@app/models/payment-request/update-payment-request';
import { ClosingStatementTemplatesListItem } from '@app/models/closing-statement/closing-statement-templates-list-item';
import { ProjectMessage } from '@app/models/projects/project-message';
import { ProjectCustomMessageDto } from '@app/models/projects/project-custom-message-dto';
import { RequestReviewOption } from '@app/models/payment-request/payment-request-review-result';
import { DeficienciesWidgetData } from '@app/models/dashboards/deficiencies-response';
import { ProjectCounts } from '@app/models/projects/project-counts';
import { IExportRequest } from '@app/models/export-request';
import { DeficiencySettingsConfig } from '@app/models/deficiencies/deficiency-settings-config';
import { BatchActionReviewOptions } from '@app/models/batch-action/batch-action-review-options';
import { OrganizationPaymentStatus } from '@app/models/org-payment-status/org-payment-status';
import { IdValuePrimary } from '@app/models/idValuePrimary';
import { BatchDetails } from '@app/models/closing-statement/batch-details';
import { PortalDeficiency } from '@app/models/portal-deficiency';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { ProgressValuesPusherChannel } from '@app/models/file-imports/progress-values-with-channel';
import { TransferRequestDto } from '@app/models/transfer-request/transfer-review-dto';
import { ManualPaymentRequestDocsResponse } from '../../../models/manual-payment-request-docs-response';
import { ReportSchedule } from '@app/models/projects/report-schedule';
import { ScheduledReport } from '@app/models/scheduled-report';
import { ManualPaymentItemRow } from '@app/models/file-imports/manual-payment-item';

const featureName = '[Project]';
export const CASE_CLAIMANTS_FEATURE_NAME = `${featureName} Claimants`;

export const GetIndex = createAction(`${featureName} Get Index`);
export const GetIndexSearch = createAction(`${featureName} Get Index Search`, props<{ search: any }>());
export const GetIndexComplete = createAction(`${featureName} Get Index Complete`, props<{ index: any }>());

export const GetItem = createAction(`${featureName} Get Item`, props<{ id: number }>());
export const GetItemComplete = createAction(`${featureName} Get Item Complete`, props<{ item: Project }>());

export const GetClaimantsList = createAction(`${featureName} Get Claimants List`, props<{ projectId: number, agGridParams?: IServerSideGetRowsParamsExtended, lienTypes?: number[], lienPhases?: number[], clientStatuses?: number[] }>());
export const GetClaimantsListSuccess = createAction(`${featureName} Get Claimants List Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, clients: any[], totalRecords: number }>());

export const GetProjectLoadingStarted = createAction(`${featureName} Get Project Loading Started`, props<{ additionalActionNames: string[] }>());

export const DownloadClients = createAction(`[${featureName}] Download Clients`, props<{
  id: number,
  searchOptions: IServerSideGetRowsRequestExtended,
  columns: ColumnExport[],
  channelName: string,
}>());
export const DownloadDashboardClients = createAction(`[${featureName}] Download Dashboard Clients`, props<{
  searchOptions: ProjectOverviewDashboardSearchOptions,
  columns: ColumnExport[],
  channelName: string,
}>());
export const DownloadClientsComplete = createAction(`[${featureName}] Download Clients Complete`, props<{ channel: string }>());
export const DownloadDocument = createAction(`[${featureName}] Download Document`, props<{ id: number, fileName?: string }>());

export const GetAllProjectsActionRequest = createAction(`${featureName} Get All Projects Action Request`, props<{ gridParams: IServerSideGetRowsParamsExtended }>());
export const GetAllProjectsActionRequestComplete = createAction(`${featureName} Get All Projects Action Request Complete`, props<{ projects: Project[], gridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const DownloadProjects = createAction(`[${featureName}] Download Projects`, props<{
  searchOptions: IServerSideGetRowsRequestExtended,
  columns: ColumnExport[],
  channelName: string,
}>());
export const DownloadProjectsComplete = createAction(`[${featureName}] Download Projects Complete`, props<{ channel: string }>());
export const DownloadProjectsDocument = createAction(`[${featureName}] Download Projects Document`, props<{ id: number }>());

export const UpdateItem = createAction(`${featureName} Update Item`, props<{ item: Project[] }>());

export const SaveItem = createAction(`${featureName} Save Item`, props<{ item: ProjectDto }>());
export const SaveItemCompleted = createAction(`${featureName} Save Item Completed`, props<{ item: Project }>());

export const ShowInfoBar = createAction(`${featureName} Show Info Bar`, props<{ show: boolean }>());
export const UpdateActionBar = createAction(`${featureName} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());
export const UpdateContextBar = createAction(`${featureName} Update Context Bar`, props<{ contextBar: ContextBarElement[] }>());

export const GoToClaimantDetails = createAction(`${featureName} Go To Claimant Details`, props<{ claimantDetailsRequest: ClaimantDetailsRequest }>());
export const GotoProjectDetailsPage = createAction(`${featureName} Goto Project Details Page`, props<{ projectId: number, navSettings: NavigationSettings }>());
export const GotoProjectServicesPage = createAction(`${featureName} Goto Project Services Page`, props<{ projectId: number, productCategoryId: ProductCategory, navSettings: NavigationSettings }>());
export const GotoProjectOrganizationsPage = createAction(`${featureName} Goto Project Organizations Page`, props<{ projectId: number }>());
export const GotoBatchDetailsPage = createAction(`${featureName} Goto Batch Details Page`, props<{ batchId: number, navSettings: NavigationSettings }>());

export const GetDocumentImportsRequest = createAction(`${featureName} Get Document Imports Request`, props<{ projectId: number, gridParams: IServerSideGetRowsParamsExtended }>());
export const GetDocumentImportsSuccess = createAction(`${featureName} Get Document Imports Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, documentImports: DocumentImport[], totalRecords: number }>());
export const ResetDocumentImports = createAction(`${featureName} Reset Document Imports`);

export const GetProjectServices = createAction(`${featureName} Get Project Services`, props<{ projectId: number }>());
export const GetProjectServicesSuccess = createAction(`${featureName} Get Project Services Success`, props<{ services: LienService[] }>());

export const GetProjectOverviewDashboardClaimantStatistic = createAction(`${featureName} Get Project Overview Dashboard Claimant Statistics`, props<{ projectId: number, bypassSpinner?: boolean }>());
export const GetProjectOverviewDashboardClaimantStatisticSuccess = createAction(`${featureName} Get Project Overview Dashboard Claimant Statistics Success`, props<{ statistics: ProjectOverviewStatistics }>());

export const GetProjectCounts = createAction(`${featureName} Get Project Counts`, props<{ projectId: number }>());
export const GetProjectCountsSuccess = createAction(`${featureName} Get Project Counts Success`, props<{ projectCounts: ProjectCounts }>());

export const GetProjectOverviewDashboardClaimantDetails = createAction(`${featureName} Get Project Overview Dashboard Claimant Details`, props<{ projectId: number }>());
export const GetProjectOverviewDashboardClaimantDetailsSuccess = createAction(`${featureName} Get Project Overview Dashboard Claimant Details Success`, props<{ data: DashboardData }>());
export const ToggleLevelsAtProjectOverviewDashboardClaimantDetails = createAction(`${featureName} Toggle Levels At Project Overview Dashboard Claimant Details`, props<{ expand: boolean }>());
export const ToggleSectionAtProjectOverviewDashboardClaimantDetails = createAction(`${featureName} Toggle Section At Project Overview Dashboard Claimant Details`, props<{ expand: boolean, toggledSection: DashboardRow }>());
export const CreateOrUpdateProjectOverviewDashboardClaimantsRequest = createAction(`${featureName} Create Or Update Project Overview Dashboard Claimants Request`, props<{ request: ProjectOverviewDashboardSearchOptions }>());
export const GetProjectOverviewDashboardClaimants = createAction(`${featureName} Get Project Overview Dashboard Claimants`, props<{ request: ProjectOverviewDashboardSearchOptions, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetProjectOverviewDashboardClaimantsSuccess = createAction(`${featureName} Get Project Overview Dashboard Claimants Success`, props<{ data: ProjectOverviewDashboardClaimantItem[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetProjectOverviewDashboardClaimantDetailsByPhase = createAction(`${featureName} Get Project Overview Dashboard Claimant Details By Phase`, props<{ projectId: number, bypassSpinner?: boolean }>());
export const GetProjectOverviewDashboardClaimantDetailsByPhaseSuccess = createAction(`${featureName} Get Project Overview Dashboard Claimant Details By Phase Success`, props<{ data: DashboardData }>());

export const GetFinalizationCounts = createAction(`${featureName} Get Finalizations Counts`, props<{ projectId: number }>());
export const GetFinalizationCountsSuccess = createAction(`${featureName} Get Finalizations Counts Success`, props<{ finalizationsCounts: FinalizationCount[] }>());
export const GetFinalizationCountsByDates = createAction(`${featureName} Get Finalizations Count By Dates`, props<{ projectId: number, productCategoryId: number, from: Date, to: Date }>());
export const GetFinalizationCountsByDatesSuccess = createAction(`${featureName} Get Finalizations Count By Dates Success`, props<{ finalizationsCount: FinalizationCount }>());
export const GetDeficienciesWidgetData = createAction(`${featureName} Get Deficiencies Widget Data`, props<{ projectId: number, bypassSpinner?: boolean }>());
export const GetDeficienciesWidgetDataSuccess = createAction(`${featureName} Get Deficiencies Widget Data Success`, props<{ deficienciesWidgetData: DeficienciesWidgetData }>());

export const GetProjectDetailsRequest = createAction(`${featureName} Get Project Details Request`, props<{ projectId: number }>());
export const GetProjectDetailsSuccess = createAction(`${featureName} Get Project Details Success`, props<{ details: ProjectDetails }>());

export const SetActiveGridParams = createAction(`${featureName} Set Active Grid Params`);

export const SaveSearchParams = fromAdvancedSearch.SaveSearchParamsFor(CASE_CLAIMANTS_FEATURE_NAME);
export const SaveAdvancedSearchVisibility = fromAdvancedSearch.SaveAdvancedSearchVisibilityFor(CASE_CLAIMANTS_FEATURE_NAME);

export const CreateProject = createAction(`${featureName} Create Project`, props<{ project: ProjectDto }>());
export const CreateProjectSuccess = createAction(`${featureName} Create Project Success`, props<{ project: Project }>());

export const GeneratePaymentRequest = createAction(`${featureName} Generate Payment Request`, props<{ params: IGeneratePaymentRequest }>());
export const GeneratePaymentRequestSuccess = createAction(`${featureName} Generate Payment Request Success`, props<{ generatePaymentRequestData: IdValue }>());
export const GeneratePaymentRequestGlobal = createAction(`${featureName} Generate Payment Request Global`, props<{ params: IGeneratePaymentRequestGlobal }>());
export const GeneratePaymentRequestGlobalSuccess = createAction(`${featureName} Generate Payment Request Global Success`, props<{ generatePaymentRequestData: IdValue }>());
export const UpdatePaymentRequest = createAction(`${featureName} Update Payment Request`, props<{ paymentRequestId: number, params: IUpdatePaymentRequest }>());
export const UpdatePaymentRequestSuccess = createAction(`${featureName} Update Payment Request Success`, props<{ updatePaymentRequestData: IdValue }>());
export const StartPaymentRequestJob = createAction(`${featureName} Start Payment Request Job`, props<{ paymentRequestId: number }>());
export const StartPaymentRequestJobSuccess = createAction(`${featureName} Start Payment Request Job Success`);
export const ReviewPaymentRequestJob = createAction(`${featureName} Review Payment Request Job`, props<{ paymentRequestId: number }>());
export const ReviewPaymentRequestJobSuccess = createAction(`${featureName} Review Payment Request Job Success`);
export const GeneratePaymentRequestJobSuccess = createAction(`${featureName} Generate Payment Request Job Finished Successfully`);
export const GeneratePaymentRequestJobFailed = createAction(`${featureName} Generate Payment Request Job Failed`);
export const GetPaymentRequestData = createAction(`${featureName} Get Payment Request Data`, props<{ projectId: number, paymentRequestId: number, documentId: number }>());
export const GetPaymentRequestDataSuccess = createAction(`${featureName} Get Payment Request Data Success`, props<{ paymentsData: PaymentItemListResponse }>());
export const GetPaymentRequestReviewWarnings = createAction(`${featureName} Get Payment Request Review Warnings`, props<{ projectId: number, paymentRequestId: number, documentId: number }>());
export const GetPaymentRequestReviewWarningsSuccess = createAction(`${featureName} Get Payment Request Review Warnings Success`, props<{ requestDeficiencies: RequestReviewOption[] }>());
export const SetPaymentRequestDeficiencies = createAction(`${featureName} Set Payment Request Deficiencies`, props<{ requestDeficiencies: RequestReviewOption[] }>());
export const GetPaymentRequestDataResult = createAction(`${featureName} Get Payment Request Data Result`, props<{ projectId: number, paymentRequestId: number, documentId: number }>());
export const GetPaymentRequestDataResultSuccess = createAction(`${featureName} Get Payment Request Data Result Success`, props<{ paymentsResultData: PaymentRequestResultResponse }>());
export const ClearPaymentRequest = createAction(`${featureName} Clear Payment Request`);
export const AcceptPaymentRequest = createAction(`${featureName} Accept Payment Request`, props<{ paymentRequestId: number }>());
export const AcceptPaymentRequestSuccess = createAction(`${featureName} Accept Payment Request Success`, props<{ acceptPaymentRequestData: IdValue }>());
export const StartAcceptPaymentRequestJob = createAction(`${featureName} Start Accept Payment Request Job`, props<{ paymentRequestId: number, requestData: FormData }>());
export const StartAcceptPaymentRequestJobSuccess = createAction(`${featureName} Start Accept Payment Request Job Success`);
export const AcceptPaymentRequestJobSuccess = createAction(`${featureName} Accept Payment Request Job Finished Successfully`);
export const AcceptPaymentRequestJobFailed = createAction(`${featureName} Accept Payment Request Job Failed`);
export const IsPaymentRequestInProgress = createAction(`${featureName} Is Payment Request In Progress`, props<{ isPaymentRequestInProgress: boolean }>());

export const GetClaimantsWithLedgersList = createAction(`${featureName} Get Claimants With Ledgers Grid`, props<{ searchOpts: ISearchOptions, projectId: number, gridParams: IServerSideGetRowsParamsExtended }>());
export const GetClaimantsWithLedgersListSuccess = createAction(`${featureName} Get Claimants With Ledgers Grid Success`, props<{ result: LedgerInfoSearchResult, agGridParams: IServerSideGetRowsParamsExtended }>());

export const EnqueueDocumentGeneration = createAction(`${featureName} Enqueue Document Generation`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());
export const EnqueueDocumentGenerationSuccess = createAction(`${featureName} Enqueue Document Generation Success`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());

export const CanPublishDWGeneration = createAction(`${featureName} Can Publish DW Generation`, props<{ caseId: number, request: IServerSideGetRowsRequestExtended }>());
export const CanPublishDWGenerationSuccess = createAction(`${featureName} Can Publish DW Generation Success`, props<{ canPublish: boolean }>());

export const DownloadGeneratedDocument = createAction(`${featureName} Download Generated Document`, props<{ generatorId: number }>());
export const DownloadGeneratedDocumentSuccess = createAction(`${featureName} Download Generated Document Success`);

export const GetLedgerSettings = createAction(`${featureName} Get Project Ledger Settings`, props<{ projectId: number }>());
export const GetLedgerSettingsSuccess = createAction(`${featureName} Get Project Ledger Settings Success`, props<{ settings: ClaimSettlementLedgerSettings }>());

export const EnqueueBatchUpdateLedgerStage = createAction(`${featureName} Batch Update Ledger Stage`, props<{ batchActionId: number }>());
export const EnqueueBatchUpdateLedgerStageSelection = createAction(`${featureName} Batch Update Ledger Stage Selection`, props<{ batchActionId: number }>());
export const EnqueueBatchUpdateLedgerStageSuccess = createAction(`${featureName} Batch Update Ledger Stage Success`);
export const EnqueueBatchUpdateLedgerStageValidation = createAction(`${featureName} Enqueue Batch Update Ledger Stage Validation`, props<{ batchAction: BatchActionDto }>());
export const EnqueueBatchUpdateLedgerStageValidationSuccess = createAction(`${featureName} Enqueue Batch Update Ledger Stage Validation Success`, props<{ batchAction: BatchAction }>());
export const BatchUpdateLedgerStageValidationCompleted = createAction(`${featureName} Batch Update Ledger Stage Validation Completed`);
export const BatchUpdateLedgerStageError = createAction(`${featureName} Batch Update Ledger Stage Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());
export const BatchUpdateLienDataError = createAction(`${featureName} Batch Update Lien Data Error`);

// Update Lien Data
export const EnqueueBatchUpdateByActionTemplateIdValidation = createAction(`${featureName} Enqueue Batch Update Ledger Lien Data Validation`, props<{ batchAction: BatchActionDto }>());
export const EnqueueBatchUpdateByActionTemplateIdValidationSuccess = createAction(`${featureName} Enqueue Batch Update Ledger Lien Data Validation Success`, props<{ batchAction: BatchAction }>());

export const EnqueueBatchUpdateDisbursementGroupValidation = createAction(`${featureName} Enqueue Batch Update Disbursement Group Validation`, props<{ batchAction: BatchActionDto }>());
export const EnqueueBatchUpdateDisbursementGroupValidationSuccess = createAction(`${featureName} Enqueue Batch Update Disbursement Group Validation Success`, props<{ batchAction: BatchAction }>());
export const BatchUpdateDisbursementGroupValidationCompleted = createAction(`${featureName} Batch Update Disbursement Group Validation Completed`);
export const BatchUpdateDisbursementGroupError = createAction(`${featureName} Batch Update Disbursement Group Error`);

export const Error = createAction(`${featureName} Error Message`, props<{ error: string }>());
export const ResetError = createAction(`${featureName} Reset Error`);

// project disbursement group actions
export const GetDisbursementGroupsGrid = createAction(`${featureName} Get Disbursement Groups Grid`, props<{ projectId: number, agGridParams: IServerSideGetRowsParamsExtended, }>());
export const GetDisbursementGroupsGridSuccess = createAction(`${featureName} Get Disbursement Groups Grid Success`, props<{ disbursementGroupList: DisbursementGroup[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const RefreshDisbursementGroupList = createAction(`${featureName} Refresh Disbursement Grid`, props<{ projectId: number }>());

export const GetDisbursementGroup = createAction(`${featureName} Get Disbursement Group`, props<{ disbursementGroupId: number }>());
export const GetDisbursementGroupSuccess = createAction(`${featureName} Get Disbursement Group Success`, props<{ disbursementGroup: DisbursementGroup }>());

export const CreateDisbursementGroup = createAction(`${featureName} Create Disbursement Group`, props<{ disbursementGroup: DisbursementGroup, modal: BsModalRef }>());
export const CreateDisbursementGroupSuccess = createAction(`${featureName} Create Disbursement Group Success`, props<{ modal: BsModalRef }>());
export const CreateOrUpdateDisbursementGroupError = createAction(`${featureName} Create Or Update Disbursement Group Error`, props<{ error: string }>());

export const UpdateDisbursementGroup = createAction(`${featureName} Update Disbursement Group`, props<{ disbursementGroup: DisbursementGroup, modal: BsModalRef }>());
export const UpdateDisbursementGroupSuccess = createAction(`${featureName} Update Disbursement Group Success`, props<{ modal: BsModalRef }>());

export const EnqueueDeleteDisbursementGroup = createAction(`${featureName} Delete Disbursement Group`, props<{ batchAction: BatchActionDto }>());
export const DeleteDisbursementGroupSuccess = createAction(`${featureName} Delete Disbursement Group Success`, props<{ projectId: number, modal: BsModalRef }>());
export const DeleteDisbursementGroupError = createAction(`${featureName} Delete Disbursement Group Error Message`, props<{ errorMessage: string }>());

export const ClearDisbursementGroup = createAction(`${featureName} Clear Disbursement Group`);

// Project payment requests actions
export const GetPaymentRequestsList = createAction(`${featureName} Get Payment Requests List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetPaymentRequestsListSuccess = createAction(`${featureName} Get Payment Requests List Success`, props<{ paymentRequests: PaymentRequestSummary[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetPaymentRequestsListError = createAction(`${featureName} Get Payment Requests List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

// Project manual payment requests actions
export const GetManualPaymentRequestsList = createAction(`${featureName} Get Manual Payment Requests List`, props<{ caseId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetManualPaymentRequestsListSuccess = createAction(`${featureName} Get Manual Payment Requests List Success`, props<{ paymentRequests: PaymentRequestSummary[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetManualPaymentRequestsListError = createAction(`${featureName} Get Manual Payment Requests List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const ManualPaymentRequestDocsRequest = createAction(`${featureName} Manual Payment Request Docs Request`, props<{ manualPaymentRequestDocs: ManualPaymentRequestDocs, }>());
export const ManualPaymentRequestDocsRequestSuccess = createAction(`${featureName} Manual Payment Request Docs Request Success`, props<{ manualPaymentRequestDocsResponse: ManualPaymentRequestDocsResponse }>());

// Project organization payment status
export const GetOrgPaymentStatusList = createAction(`${featureName} Get Org Payment Status List`, props<{ projectId: number, orgId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetOrgPaymentStatusListSuccess = createAction(`${featureName} Get Org Payment Status List Success`, props<{ paymentStatuses: OrganizationPaymentStatus[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetOrgPaymentStatusListError = createAction(`${featureName} Get Org Payment Status List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const DownloadOrgPaymentStatus = createAction(`${featureName} Download Org Payment Status`, props<{ projectId: number, orgId: number, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string }>());
export const DownloadOrgPaymentStatusSuccess = createAction(`${featureName} Download Org Payment Status Success`);

// Chart of accounts
export const GetChartOfAccountsList = createAction(`${featureName} Get Chart Of Accounts List`, props<{ projectId: number }>());
export const GetChartOfAccountsListSuccess = createAction(`${featureName} Get Chart Of Accounts List Success`, props<{ chartOfAccounts: ChartOfAccountProjectConfig[] }>());
export const SaveChartOfAccounts = createAction(`${featureName} Save Chart Of Accounts`, props<{ projectId: number, data: ChartOfAccountProjectConfig[] }>());
export const SaveChartOfAccountsSuccess = createAction(`${featureName} Save Chart Of Accounts Success`);

// Chart of accounts settings
export const GetChartOfAccountsSettingsList = createAction(`${featureName} Get Chart Of Accounts Settings List`, props<{ projectId: number }>());
export const GetChartOfAccountsSettingsListSuccess = createAction(`${featureName} Get Chart Of Accounts SettingsList Success`, props<{ chartOfAccountsSettings: ChartOfAccountSettings[] }>());
export const ResetChartOfAccountsSettingsList = createAction(`${featureName} Reset Chart Of Accounts Settings List`);

export const GetChartOfAccountModes = createAction(`${featureName} Get Chart Of Account Modes`, props<{ chartOfAccountId?: number }>());
export const GetChartOfAccountModesSuccess = createAction(`${featureName} Get Chart Of Account Modes Success`, props<{ chartOfAccountModes: ChartOfAccountMode[] }>());

export const GetUsedChartOfAccountsNOs = createAction(`${featureName} Get Used Chart Of Accounts NOs`, props<{ projectId: number }>());
export const GetUsedChartOfAccountsNOsSuccess = createAction(`${featureName} Get Used Chart Of Accounts NOs Success`, props<{ usedChartOfAccountsNOs: string[] }>());

export const GetChartOfAccountDisbursementModes = createAction(`${featureName} Get Chart Of Account Disbursement Modes`);
export const GetChartOfAccountDisbursementModesSuccess = createAction(`${featureName} Get Chart Of Account Disbursement Modes Success`, props<{ chartOfAccountDisbursementModes: SelectOption[] }>());

export const EnqueueClosingStatementGeneration = createAction(`${featureName} Enqueue Closing Statement`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());
export const EnqueueClosingStatementGenerationSuccess = createAction(`${featureName} Enqueue Closing Statement Success`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());

export const DownloadClosingStatement = createAction(`${featureName} Download Closing Statement`, props<{ generatorId: number }>());
export const DownloadClosingStatementSuccess = createAction(`${featureName} Download Closing Statement Success`);
export const DownloadClosingStatementError = createAction(`${featureName} Download Closing Statement Error`);

export const GetClosingStatementTemplates = createAction(`${featureName} Get Closing Statement Templates`, props<{ projectId?: number, isProjectAssociated?: boolean }>());
export const GetClosingStatementTemplatesSuccess = createAction(`${featureName} Get Closing Statement Templates Success`, props<{ closingStatementTemplates: ClosingStatementTemplatesListItem[] }>());

export const GetDisbursementsTemplates = createAction(`${featureName} Get Disbursements Templates`, props<{ templateId: FileImportTemplateTypes }>());
export const GetDisbursementsTemplatesSuccess = createAction(`${featureName} Get Disbursements Templates Success`, props<{ disbursementsTemplates: IdValuePrimary[] }>());
// project organization actions

export const GetProjectOrgs = createAction(`${featureName} Get Project Orgs`, props<{ projectId: number }>());
export const GetProjectOrgsSuccess = createAction(`${featureName} Get Project Orgs Success`, props<{ items: ProjectOrganizationItem[] }>());

export const GetProjectOrgsDropdownValues = createAction(`${featureName} Get Project Orgs Light`, props<{ projectId: number }>());
export const GetProjectOrgsDropdownValuesSuccess = createAction(`${featureName} Get Project Orgs Success Light`, props<{ items: IdValue[] }>());

export const GoToOrg = createAction(`${featureName} Goto Org`, props<{ id: number }>());

export const DownloadProjectOrgs = createAction(`[${featureName}] Download Project Orgs`, props<{ id: number, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string }>());
export const DownloadProjectOrgsComplete = createAction(`[${featureName}] Download Project Orgs Complete`);

export const GetContactsList = createAction(`${featureName} Get Contacts List`, props<{ projectId: number, agGridParams?: IServerSideGetRowsParamsExtended, isDeficiencyReport?: boolean }>());
export const GetContactsListSuccess = createAction(`${featureName} Get Contacts List Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, contacts: ProjectContactReference[], totalRecords: number }>());
export const RefreshContactsList = createAction(`${featureName} Refresh Contacts List`, props<{ projectId: number, isDeficiencyReport?: boolean }>());

export const CreateOrUpdateContactSuccess = createAction(`${featureName} Create Or Update Contact Success`, props<{ successMessage: string }>());
export const CreateOrUpdateContactError = createAction(`${featureName} Create Or Update Contact Error`, props<{ error: string }>());
export const ClearCreateUpdateContactError = createAction(`${featureName} Clear Create Update Contact Error`);

export const CreateOrUpdateContact = createAction(`${featureName} Create Or Update Contact`, props<{ contact: ProjectContactReferenceAddEdit, isDeficiencyReport?: boolean }>());

export const GetProjectContactRoles = createAction(`[${featureName}] Get Project Contact Roles`, props<{ id: number, isMaster: boolean }>());

export const GetProjectContactRolesSuccess = createAction(`[${featureName}] Get Project Contact Roles Success`, props<{ roles: IdValue[] }>());

export const SearchInvoiceItems = createAction(`${featureName} Search Invoice Items`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const SearchInvoiceItemsSuccess = createAction(`${featureName} Search Invoice Items Success`);
export const ExportInvoiceItems = createAction(`${featureName} Export Invoice Items`, props<{ exportRequest: IExportRequest }>());

export const StartFinancialProcessorForProject = createAction(`${featureName} Start Financial Processor For Project`, props<{ projectId: number, pusherChannelName: string }>());
export const GetFinancialProcessorLatestRun = createAction(`${featureName} Get Financial Processor Latest Run`, props<{ entityType: EntityTypeEnum, entityId: number }>());
export const GetFinancialProcessorLatestRunSuccess = createAction(`${featureName} Get Financial Processor Latest Run Success`, props<{ latestRun: FinancialProcessorRun }>());
export const GetTabCounts = createAction(`${featureName} Get Tab Counts`, props<{ projectId: number }>());

export const GetProjectReceivables = createAction(`${featureName} Get Project Receivables`, props<{ id: number }>());
export const GetProjectReceivablesSuccess = createAction(`${featureName} Get Project Receivables Success`, props<{ projectReceivables: ProjectReceivable[] }>());
export const UpdateProjectReceivables = createAction(`${featureName} Update Project Receivables`, props<{ sectionIndex: number, groupIndex: number, itemId: number, isChecked: boolean }>());
export const ExpandProjectReceivablesSection = createAction(`${featureName} Expand Project Receivables Section`, props<{ sectionIndex: number }>());
export const SaveProjectReceivables = createAction(`${featureName} Save Project Receivables`, props<{ id: number, changedItems: IDictionary<number, boolean> }>());
export const SaveProjectReceivablesSuccess = createAction(`${featureName} Save Project Receivables Success`, props<{ projectReceivables: ProjectReceivable[] }>());
export const SetProjectReceivablesToDefault = createAction(`${featureName} Set Project Receivables To Default`, props<{ projectId: number, sectionId: number, groupId: number }>());
export const SetProjectReceivablesToDefaultSuccess = createAction(`${featureName} Set Project Receivables To Default Success`, props<{ sectionId: number, resetGroup: ReceivableGroup }>());

export const GetDeficienciesList = createAction(`${featureName} Get Deficiencies List`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const GetDeficienciesListSuccess = createAction(`${featureName} Get Deficiencies List Success`, props<{ deficiencies: Deficiency[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const RefreshDeficienciesList = createAction(`${featureName} Refresh Deficiencies List`);
export const OverrideDeficiency = createAction(`${featureName} Override Deficiency`, props<{ id: number, caseId: number }>());
export const OverrideDeficiencySuccess = createAction(`${featureName} Override Deficiency Success`);

// Portal Deficiencies

export const GetPortalDeficienciesList = createAction(`${featureName} Get Portal Deficiencies List`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const GetPortalDeficienciesListSuccess = createAction(`${featureName} Get Portal Deficiencies List Success`, props<{ deficiencies: PortalDeficiency[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const LoadTemplates = createAction(`${featureName} Load Templates`, props<{ templateTypes: number[], entityTypeId: number, documentTypes: number[], entityId?: number }>());
export const LoadTemplatesComplete = createAction(`${featureName} Load Templates Complete`, props<{ data: any }>());

export const GenerateDocuments = createAction(`${featureName} Generate Documents`, props<{ controller: ControllerEndpoints, request: SaveDocumentGeneratorRequest }>());
export const GenerateDocumentsComplete = createAction(`${featureName} Generate Documents Complete`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());


export const GetProjectFirmsOptions = createAction(`${featureName} Get Project Firms Options`, props<{ projectId: number }>());
export const GetProjectFirmsOptionsSuccess = createAction(`${featureName} Get Project Firms Options Success`, props<{ values: IdValue[] }>());

//  Disbursements Payment Request Modal Component

export const ValidatePaymentRequest = createAction(`${featureName} Validate Payment Request Request`, props<{ paymentRequest: PaymentRequestUpload }>());
export const ValidatePaymentRequestSuccess = createAction(`${featureName} Validate Payment Request Success`, props<{ documentImport: DocumentImport }>());

export const StartValidatePaymentRequestJob = createAction(`${featureName} Start Validate Payment Request Job`, props<{ paymentRequestId: number }>());
export const StartValidatePaymentRequestJobSuccess = createAction(`${featureName} Start Validate Payment Request Job Success`);

export const GetDocumentImportById = createAction(`${featureName} Get Document Import By Id`, props<{ id: number, }>());
export const GetDocumentImportByIdSuccess = createAction(`${featureName} Get Document Import By Id Success`, props<{ paymentRequestDocumentImportPreviewResults: DocumentImport }>());

export const GetDocumentImportTemplatesRequest = createAction(`${featureName} Get Document Import Templates Request`, props<{ entityType: number }>());
export const GetDocumentImportTemplatesSuccess = createAction(`${featureName} Get Document Import Templates Success`, props<{ templates: DocumentImportTemplate[] }>());

export const GetPaymentRequestImportsResultRequest = createAction(`${featureName} Get Payment Request Imports Result Request`, props<{ entityId: number, documentTypeId: FileImportDocumentType }>());
export const GetPaymentRequestImportsResultRequestSuccess = createAction(`${featureName} Get Payment Request Imports Result Request Success`, props<{ validationResults: ValidationResults }>());

export const GetValidationDocument = createAction(`${featureName} Get Validation Document`, props<{ previewDocId: number }>());

export const SubmitPaymentRequestImportsResultRequest = createAction(`${featureName} Submit Payment Request Imports Result Request`, props<{ submitData: any }>());
export const SubmitPaymentRequestImportsResultRequestSuccess = createAction(`${featureName} Submit Payment Request Imports Result Request Success`, props<{ submitData: any }>());
export const GetBatchActionResultRequest = createAction(`${featureName} Get Batch Action Result Request`, props<{ entityId: number, documentTypeId: BatchActionDocumentType, tab: FileImportReviewTabs, agGridParams: IServerSideGetRowsParamsExtended, status?: BatchActionResultStatus }>());
export const GetBatchActionResultRequestSuccess = createAction(`${featureName} Get Batch Action Result Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, tab: FileImportReviewTabs, validationResults: ValidationResults }>());
export const GetBatchActionDeficienciesRequest = createAction(`${featureName} Get Batch Action Deficiencies Request`, props<{ batchActionId: number, documentTypeId: BatchActionDocumentType }>());
export const GetBatchActionDeficienciesSuccess = createAction(`${featureName} Get Batch Action Deficiencies Success`, props<{ batchActionDeficienciesReview: BatchActionReviewOptions }>());
export const ResetBatchActionDeficiencies = createAction(`${featureName} Reset Batch Action Deficiencies`);

export const HasDuplicateClaimantIdsRequest = createAction(`${featureName} Has Duplicate Claimant Ids Request`, props<{ searchOptions: IServerSideGetRowsRequestExtended }>());
export const HasDuplicateClaimantIdsSuccess = createAction(`${featureName} Has Duplicate Claimant Ids Success`, props<{ hasDuplicateClaimantIds: boolean }>());

// Closing Statement actions
export const GetClosingStatementList = createAction(`${featureName} Get Closing Statement List`, props<{ caseId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetClosingStatementListSuccess = createAction(`${featureName} Get Closing Statement List Success`, props<{ closingStatement: Document[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetClosingStatementListError = createAction(`${featureName} Get Closing Statement List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const GetClosingStatementDoc = createAction(`${featureName} Get Closing Statement Doc`, props<{ docId: number }>());
export const GetClosingStatementDocSuccess = createAction(`${featureName} Get Closing Statement Doc Success`, props<{ channel: string }>());

export const EnqueueSendDocuSignDocuments = createAction(`${featureName} Enqueue Send DocuSign Documents`, props<{ batchAction: BatchActionDto }>());
export const EnqueueSendDocuSignDocumentsSuccess = createAction(`${featureName} Enqueue Send DocuSign Documents Success`, props<{ batchAction: BatchAction }>());
export const EnqueueApproveSendDocuSignDocuments = createAction(`${featureName} Enqueue Approve Send DocuSign Documents`, props<{ batchActionId: number }>());
export const EnqueueApproveSendDocuSignDocumentsSuccess = createAction(`${featureName} Enqueue Approve Send DocuSign Documents Success`);
export const SendDocuSignDocumentsCompleted = createAction(`${featureName} Send DocuSign Documents Completed`);
export const SendVoidClosingStatmentCompleted = createAction(`${featureName} Send DocuSign Documents Completed`);

export const DownloadClosingStatementList = createAction(`${featureName} Download Closing Statement List`, props<{
  id: number,
  searchOptions: ISearchOptions,
  columns: ColumnExport[],
  channelName: string,
}>());
export const DownloadClosingStatementListComplete = createAction(`[${featureName}] Download Closing Statement Complete`, props<{ channel: string }>());
export const GetClosingStatementBatch = createAction(`${featureName} Get Closing Statement Batch`, props<{ batchId: number }>());
export const GetClosingStatementBatchSuccess = createAction(`${featureName} Get Closing Statement Batch Success`);

export const DownloadClosingStatementBatchLog = createAction(`${featureName} Download Closing Statement Batch Log`, props<{ batchId: number }>());
export const DownloadClosingStatementBatchLogSuccess = createAction(`${featureName} Download Closing Statement Batch Log Success`);

export const GetBatchDetails = createAction(`${featureName} Get Batch Details`, props<{ caseId: number, batchId: number, documentId: number }>());
export const GetBatchDetailsSuccess = createAction(`${featureName} Get Batch Details Success`, props<{ batchDetails: BatchDetails }>());
export const SendEDeliveryButtonDisabled = createAction('[Closing Statement] Set Button Disabled', props<{ isDisabled: boolean }>());

export const UpdateQcStatus = createAction(`${featureName} Update QC Status`, props<{ batchId: number, caseId: number, qcStatus: number, documentId: number }>());
export const UpdateQcStatusError = createAction(`${featureName} Update QC Status Error`, props<{ errorMessage: string }>());
export const GetUpdatedQcStatus = createAction(`${featureName} Get Updated QC Status`, props<{ caseId: number, batchId: number, documentId: number }>());
export const GetUpdatedQcStatusSuccess = createAction(`${featureName} Get Updated QC Status Success`, props<{ batchDetails: BatchDetails }>());

export const CheckMaintenance = createAction(`${featureName} Check Maintenance`);
export const CheckMaintenanceSuccess = createAction(`${featureName} Check Maintenance Success`, props<{ isMaintance: boolean }>());
export const ValidateMaintenance = createAction(`${featureName} Validate Maintenance`);
export const ValidateMaintenanceCompleted = createAction(`${featureName} Validate Maintenance Success`, props<{ isMaintance: boolean }>());
export const ValidateMaintenanceFailed = createAction(`${featureName} Validate Maintenance Failed`);
export const ResetMaintenance = createAction(`${featureName} Reset Maintenance`);
// Project messaging
export const CreateProjectOrganizationMessage = createAction(`${featureName} Create Project Organization Message`, props<{ message: ProjectCustomMessageDto }>());
export const CreateProjectOrganizationMessageSuccess = createAction(`${featureName} Create Project Organization Message Success`);

export const EditProjectOrganizationMessage = createAction(`${featureName} Edit Project Organization Message`, props<{ id: number, message: ProjectCustomMessageDto }>());
export const EditProjectOrganizationMessageSuccess = createAction(`${featureName} Edit Project Organization Message Success`);

export const GetProjectMessagesRequest = createAction(`${featureName} Get Project Messages Request`, props<{ projectId: number }>());
export const GetProjectMessagesSuccess = createAction(`${featureName} Get Project Messages Success`, props<{ messages: ProjectMessage[] }>());

export const GetProjectFirmsMessaging = createAction(`${featureName} Get Project Firms Messaging`, props<{ projectId: number }>());
export const GetProjectFirmsMessagingSuccess = createAction(`${featureName} Get Project Firms Messaging Success`, props<{ projectCustomMessages: ProjectCustomMessage[] }>());

export const GetProjectMessagesTypesRequest = createAction(`${featureName} Get Project Messaging Types Request`);
export const GetProjectMessagesTypesSuccess = createAction(`${featureName} Get Project Messaging Types Success`, props<{ items: IdValue[] }>());

export const UpdateProjectMessageType = createAction(`${featureName} Update Project Message Type`, props<{ messageType: IdValue, sectionIndex: number }>());
export const UpdateProjectMessageText = createAction(`${featureName} Update Project Message Text`, props<{ customMessage: string, sectionIndex: number }>());
export const ResetProjectMessages = createAction(`${featureName} Reset Project Messages`);

export const SaveProjectMessages = createAction(`${featureName} Update Project Messages`, props<{ projectId: number }>());
export const SaveProjectMessagesSuccess = createAction(`${featureName} Save Project Messages Success`, props<{ messages: ProjectMessage[] }>());

// Deficiencies Config
export const GetDeficiencySettingsList = createAction(`${featureName} Get Deficiency Settings List`, props<{ projectId: number }>());
export const GetDeficiencySettingsListSuccess = createAction(`${featureName} Get Deficiency Settings List Success`, props<{ deficiencySettings: DeficiencySettingsConfig[] }>());

export const SaveDeficiencySettings = createAction(`${featureName} Save Deficiency Settings`, props<{ projectId: number, data: DeficiencySettingsConfig[] }>());
export const SaveDeficiencySettingsSuccess = createAction(`${featureName} Save Deficiency Settings Success`, props<{ projectId: number }>());

// Update Funded Date
export const EnqueueUpdateFundedDateValidation = createAction(`${featureName} Enqueue Update Funded Date Validation`, props<{ batchAction: BatchActionDto }>());
export const EnqueueUpdateFundedDateValidationSuccess = createAction(`${featureName} Enqueue Update Funded Date Validation Success`, props<{ batchAction: BatchAction }>());
export const UpdateFundedDateValidationCompleted = createAction(`${featureName} Update Funded Date Validation Completed`);
export const UpdateFundedDateValidationError = createAction(`${featureName} Update Funded Date Validation Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());

export const UpdateFundedDateApprove = createAction(`${featureName} Update Funded Date Approve`, props<{ batchActionId: number }>());
export const UpdateFundedDateApproveSuccess = createAction(`${featureName} Update Funded Date Approve Success`);
export const UpdateFundedDateApproveError = createAction(`${featureName} Update Funded Date Approve Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());

// Tranfer Requests
export const GenerateTransferRequest = createAction(`${featureName} Generate Transfer Request`, props<{ params: BatchActionDto }>());
export const GenerateTransferRequestSuccess = createAction(`${featureName} Generate Transfer Request Success`, props<{ batchActionData: BatchAction }>());
export const GetTransferRequestSuccess = createAction(`${featureName} Get Transfer Request Success`, props<{ transferRequest: TransferRequestDto }>());
export const ReviewTransferRequestJob = createAction(`${featureName} Review Transfer Request Job`, props<{ transferRequestId: number }>());
export const ReviewTransferRequestJobSuccess = createAction(`${featureName} Review Transfer Request Job Success`);
export const GenerateTransferRequestJobSuccess = createAction(`${featureName} Generate Transfer Request Job Finished Successfully`, props<{ jobResult: ProgressValuesPusherChannel }>());
export const GenerateTransferRequestJobFailed = createAction(`${featureName} Generate Transfer Request Job Failed`);
export const GetTransferDeficiencies = createAction(`${featureName} Get Transfer Deficiencies`, props<{ transferRequestId: number }>());
export const GetTransferDeficienciesSuccess = createAction(`${featureName} Get Transfer Deficiencies Success`, props<{ transferRequestDeficiencies: TransferRequestDto }>());
export const UpdateTransferOptions = createAction(`${featureName} Update Transfer Options`, props<{ batchActionId: number, transferRequestId: number, params: RequestReviewOption[] }>());
export const UpdateTransferOptionsSuccess = createAction(`${featureName} Update Transfer Options Success`);
export const ProccessTransferRequest = createAction(`${featureName} Process Transfer Request`, props<{ batchActionId: number }>());
export const ProccessTransferRequestSuccess = createAction(`${featureName} Process Transfer Request Success`);
export const GetTransfersItems = createAction(`${featureName} Get Transfer Items`, props<{ transferRequestId: number }>());
export const GetTransfersItemsSuccess = createAction(`${featureName} Get Transfer Items Success`, props<{ transferData: TransferItemsResponse }>());
export const ClearTransferData = createAction('[Transfer] Clear Transfer Data');
export const GetReviewTransfers = createAction(`${featureName} Get Review Transfers`, props<{ transferRequestId: number }>());
export const AcceptTransferRequest = createAction(`${featureName} Accept Transfer Request`, props<{ transferRequestId: number, request: FormData }>());
export const AcceptTransferRequestSuccess = createAction(`${featureName} Accept Transfer Request Success`);
export const LoadTransferRequest = createAction(`${featureName} Load Transfer Request`, props<{ batchActionId: number }>());
export const LoadTransferRequestSuccess = createAction(`${featureName} Load Transfer Request Success`);
export const GetBatchAction = createAction(`${featureName} Get Batch Action`, props<{ batchActionId: number }>());
export const GetBatchActionSuccess = createAction(`${featureName} Get Batch Action Success`, props<{ batchActionData: BatchAction }>());

export const UpdateProgressBarData = createAction(`${featureName} Update Progress Bar Data`, props<{ progressBarData: ProgressValuesPusherChannel }>());
export const ClearProgressBarData = createAction(`${featureName} Clear Progress Bar Data`);

// Project Reporting
export const CreateReportSchedule = createAction(`${featureName} Create Report Schedule`, props<{ reportSchedule: ReportSchedule }>());
export const CreateReportScheduleSuccess = createAction(`${featureName} Create Report Schedule Success`, props<{ successMessage: string }>());

export const GetReportScheduleList = createAction(`${featureName} Get Report Schedule List`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const GetReportScheduleListSuccess = createAction(`${featureName} Get Report Schedule List Success`, props<{ scheduledReports: ScheduledReport[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const RefreshReportScheduleList = createAction(`${featureName} Refresh Report Schedule List`);

export const GetReportSchedule = createAction(`${featureName} Get Report Schedule`, props<{ id: number }>());
export const GetReportScheduleSuccess = createAction(`${featureName} Get Report Schedule Success`, props<{ reportSchedule: ReportSchedule }>());
export const ResetReportSchedule = createAction(`${featureName} Reset Report Schedule`);

export const UpdateReportSchedule = createAction(`${featureName} Update Report Schedule`, props<{ reportSchedule: ReportSchedule }>());
export const UpdateReportScheduleSuccess = createAction(`${featureName} Update Report Schedule Success`, props<{ successMessage: string }>());

// Manual Payment Request
export const GetManualPaymentRequestImportsRowsRequest = createAction(`${featureName} Get Manual Payment Request Import Rows Request`, props<{ params: IServerSideGetRowsRequestExtended, agGridParams?: IServerSideGetRowsParamsExtended }>());
export const GetManualPaymentRequestImportsRowsRequestSuccess = createAction(`${featureName} Get Manual Payment Request Import Rows Request Success`, props<{ manualPaymentItemsRows: ManualPaymentItemRow[], agGridParams?: IServerSideGetRowsParamsExtended }>());

export const GetManualPaymentResultBankAccounts = createAction(`${featureName} Get Manual Payment Result Bank Accounts`, props<{ manualPaymentItemsRows: ManualPaymentItemRow[], agGridParams?: IServerSideGetRowsParamsExtended  }>());
export const GetManualPaymentResultBankAccountsSuccess = createAction(`${featureName} Get Manual Payment Result Bank Accounts Success`, props<{ manualPaymentBankAccounts: BankAccount[] }>());
