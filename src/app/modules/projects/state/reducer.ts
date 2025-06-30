/* eslint-disable prefer-object-spread */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { createReducer, on, Action, combineReducers } from '@ngrx/store';

import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { DocumentImport, DocumentImportTemplate } from '@app/models/documents';
import { ProjectDetails } from '@app/models/projects/project-details';
import { ProjectOverviewDashboardSearchOptions, ProjectOverviewStatistics, ChartOfAccountProjectConfig, ChartOfAccountMode } from '@app/models/projects';
import { ChartOfAccountSettings } from '@app/models/closing-statement/chart-of-account-settings';
import { DashboardData, DashboardRow, FinalizationCount } from '@app/models/dashboards';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DisbursementGroup } from '@app/models/disbursement-group';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings/claim-settlement-ledger-settings';
import { ProjectContactReference } from '@app/models/project-contact-reference';
import { ClaimSettlementLedger } from '@app/models/closing-statement/claim-settlement-ledger';
import { FinancialProcessorRun } from '@app/models/financial-processor-run';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { Dictionary, IDictionary } from '@app/models/utils';
import { ProjectReceivable } from '@app/models/projects/project-receivable/project-receivable';
import { ReceivableGroup } from '@app/models/projects/project-receivable/project-receivable-group';
import { PaymentRequestResultResponse } from '@app/models/payment-request/payment-request-result-response';
import { ManualPaymentRequestDocsResponse } from '@app/models/manual-payment-request-docs-response';
import { RequestReviewOption } from '@app/models/payment-request/payment-request-review-result';
import { SelectHelper } from '@app/helpers/select.helper';
import { SelectGroupsEnum } from '@app/models/enums/select-groups.enum';
import cloneDeep from 'lodash-es/cloneDeep';
import { ProjectMessage } from '@app/models/projects/project-message';
import { DeficienciesWidgetData } from '@app/models/dashboards/deficiencies-response';
import { ProjectCounts } from '@app/models/projects/project-counts';
import { DeficiencySettingsConfig } from '@app/models/deficiencies/deficiency-settings-config';
import { BatchActionReviewOptions } from '@app/models/batch-action/batch-action-review-options';
import { IdValuePrimary } from '@app/models/idValuePrimary';
import { BatchDetails } from '@app/models/closing-statement/batch-details';
import { ProgressValuesPusherChannel } from '@app/models/file-imports/progress-values-with-channel';
import { TransferRequestDto } from '@app/models/transfer-request/transfer-review-dto';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { IdValue } from '../../../models/idValue';
import { SelectOption } from '../../shared/_abstractions/base-select';

import { Project,
  LienService,
  PaymentRequest,
  PaymentItemListResponse,
  ProjectOrganizationItem,
  PaymentRequestSummary,
  ProjectCustomMessage,
  TransferItemsResponse } from '../../../models';
import * as fromAdvancedSearch from '../../shared/state/advanced-search/reducer';
import * as actions from './actions';

import { ClaimantsSummaryInitialState, claimantsSummaryReducer, ClaimantsSummaryState } from '../project-disbursement-claimant-summary/state/reducer';
import { electionFormsInitialState, electionFormsReducer, ElectionFormsState } from '../project-disbursement-election-forms/state/reducer';
import { claimantSettlementLedgerSettingsInitialState, claimSettlementLedgerSettingsReducer, LedgerSettingsState } from '../project-ledger-settings/state/reducer';
import { scopeOfWorkInitialState, scopeOfWorkReducer, ScopeOfWorkState } from '../project-scope-of-work/state/reducer';
import * as fromBillingRule from '../billing-rule/state/reducer';
import { paymentQueueInitialState, paymentQueueReducer, PaymentQueueState } from '../project-disbursement-payment-queue/state/reducer';
import { ClaimantsSummaryRollupInitialState, claimantsSummaryRollupReducer, ClaimantsSummaryRollupState } from '../project-disbursement-claimant-summary-rollup/state/reducer';
import { ScheduledReport } from '@app/models/scheduled-report';
import { ReportSchedule } from '@app/models/projects/report-schedule';

export interface PaymentRequestState {
  generatePaymentRequestData: IdValue;
  paymentRequest: PaymentRequest;
  paymentsData: PaymentItemListResponse;
  paymentsResultData: PaymentRequestResultResponse;
  acceptPaymentRequestData: IdValue;
  updatePaymentRequestData: IdValue;
  isPaymentRequestInProgress: boolean;
  requestDeficiencies: RequestReviewOption[];
}

export interface ProjectsCommonState {
  projects: Project[],
  documentImports: DocumentImport[]
  index: any,
  search: {
    page: number
    per_page: number
    search_term: string
    admin_user_id: number
    status: number
    sort_on: string
    sort: string
  },
  item: Project,
  clients: any,
  disbursementGroupList: DisbursementGroup[],
  showInfoBar: boolean;
  actionBar: ActionHandlersMap,
  contextBar: ContextBarElement[],
  projectGridParams: IServerSideGetRowsParamsExtended,
  clientsGridParams: IServerSideGetRowsParamsExtended,
  documentImportGridParams: IServerSideGetRowsParamsExtended,
  disbursementGroupGridParams: IServerSideGetRowsParamsExtended,
  services: LienService[],
  error: string,
  errorMessage: string,
  projectCounts: ProjectCounts,
  projectOverviewStatistics: ProjectOverviewStatistics,
  projectOverviewDashboard: DashboardData,
  projectOverviewDashboardByPhase: DashboardData,
  projectOverviewDashboardClaimantsSearchRequest: ProjectOverviewDashboardSearchOptions,
  projectDetails: ProjectDetails,
  isExpanded: boolean,
  disbursementGroup: DisbursementGroup,
  chartOfAccounts: ChartOfAccountProjectConfig[],
  chartOfAccountsSettings: ChartOfAccountSettings[],
  chartOfAccountsSavedSuccessfully: boolean,
  chartOfAccountModes: ChartOfAccountMode[],
  usedChartOfAccountsNOs: string[],
  chartOfAccountDisbursementModes: SelectOption[],
  ledgerSettings: ClaimSettlementLedgerSettings,
  contacts: ProjectContactReference[],
  contactsGridParams: IServerSideGetRowsParamsExtended,
  closingStatementGridParams: IServerSideGetRowsParamsExtended,
  batchDetails: BatchDetails,
  batchDetailsLoading: boolean,
  paymentRequest: PaymentRequestState,
  projectContactRoles: IdValue[],
  createOrUpdateContactError: string,
  closingStatementTemplates: SelectOption[],
  disbursementsTemplates: IdValuePrimary[],
  claimantsWithLedgersList: ClaimSettlementLedger[];
  financialProcessorLatestRun: FinancialProcessorRun;
  projectReceivables: ProjectReceivable[];
  projectReceivablesModified: IDictionary<number, boolean>;
  projectOrgs: ProjectOrganizationItem[];
  projectOrgsDropdownValues: IdValue[];
  deficienciesGridParams: IServerSideGetRowsParamsExtended,
  paymentRequests: PaymentRequestSummary[],
  projectFirmsOptions: IdValue[],
  canPublish: boolean,
  manualPaymentGridParams: IServerSideGetRowsParamsExtended,
  paymentRequestDocumentImport: DocumentImport,
  paymentRequestImportsResult: any
  paymentRequestDocumentImportPreviewResults: DocumentImport,
  manualPaymentRequestDocsResponse: ManualPaymentRequestDocsResponse,
  templates: DocumentImportTemplate[],
  projectMessages: ProjectMessage[],
  projectMessagesModified: ProjectMessage[],
  projectMessagesTypes: IdValue[],
  projectFirmMessages: ProjectCustomMessage[],
  batchActionDeficienciesReview: BatchActionReviewOptions,
  recentFinalizationsCounts: IDictionary<number, FinalizationCount>,
  deficienciesWidgetData: DeficienciesWidgetData,

  batchActionData: BatchAction,
  progressBarData: ProgressValuesPusherChannel,
  transferRequest: TransferRequestDto,
  transferData: TransferItemsResponse;

  isDashboardStatisticsLoaded: boolean,
  sendEDeliveryButtonDisabled:boolean,

  // OLD DEFICIENCIES SETTINGS
  deficiencySettings: DeficiencySettingsConfig[],
  deficiencySettingsSavedSuccessfully: boolean,
  disbursementGroupDeletedSuccessfully: boolean,

  isMaintance: boolean,

  scheduledReports: ScheduledReport[],
  scheduledReportsGridParams: IServerSideGetRowsParamsExtended,
  reportSchedule: ReportSchedule,
  manualPaymentItemsRows: any
}

const initialPaymentRequestState: PaymentRequestState = {
  generatePaymentRequestData: null,
  paymentRequest: null,
  paymentsData: null,
  paymentsResultData: null,
  acceptPaymentRequestData: null,
  updatePaymentRequestData: null,
  isPaymentRequestInProgress: null,
  requestDeficiencies: null,
};

const initialProjectsCommonState: ProjectsCommonState = {
  projects: null,
  index: null,
  documentImports: null,
  disbursementGroupList: null,
  search: {
    page: 1,
    per_page: 30,
    search_term: null,
    admin_user_id: null,
    status: null,
    sort_on: 'name',
    sort: 'asc',
  },
  item: null,
  clients: null,
  showInfoBar: true,
  actionBar: null,
  contextBar: null,
  projectGridParams: null,
  clientsGridParams: null,
  documentImportGridParams: null,
  disbursementGroupGridParams: null,
  services: null,
  error: null,
  errorMessage: null,
  projectCounts: null,
  projectOverviewStatistics: null,
  projectOverviewDashboard: null,
  projectOverviewDashboardByPhase: null,
  projectOverviewDashboardClaimantsSearchRequest: null,
  projectDetails: null,
  isExpanded: true,
  disbursementGroup: null,
  chartOfAccounts: null,
  chartOfAccountsSettings: null,
  chartOfAccountsSavedSuccessfully: null,
  chartOfAccountModes: null,
  usedChartOfAccountsNOs: null,
  chartOfAccountDisbursementModes: null,
  ledgerSettings: null,
  contacts: null,
  contactsGridParams: null,
  closingStatementGridParams: null,
  batchDetails: null,
  batchDetailsLoading: false,
  paymentRequest: initialPaymentRequestState,
  projectContactRoles: null,
  createOrUpdateContactError: null,
  closingStatementTemplates: null,
  disbursementsTemplates: null,
  claimantsWithLedgersList: null,
  financialProcessorLatestRun: null,
  projectReceivables: null,
  projectReceivablesModified: new Dictionary<number, boolean>(),
  projectOrgs: null,
  projectOrgsDropdownValues: null,
  deficienciesGridParams: null,
  paymentRequests: null,
  projectFirmsOptions: null,
  canPublish: null,
  manualPaymentGridParams: null,
  paymentRequestDocumentImport: null,
  paymentRequestImportsResult: null,
  paymentRequestDocumentImportPreviewResults: null,
  manualPaymentRequestDocsResponse: null,
  templates: null,
  projectMessages: null,
  projectMessagesModified: null,
  projectMessagesTypes: null,
  projectFirmMessages: null,
  batchActionDeficienciesReview: null,
  recentFinalizationsCounts: new Dictionary<number, FinalizationCount>(),
  deficienciesWidgetData: null,

  batchActionData: null,
  progressBarData: null,
  transferRequest: null,
  transferData: null,

  deficiencySettings: null,
  deficiencySettingsSavedSuccessfully: null,
  disbursementGroupDeletedSuccessfully: false,

  isMaintance: false,

  isDashboardStatisticsLoaded: false,

  scheduledReports: null,
  scheduledReportsGridParams: null,
  reportSchedule: null,
  manualPaymentItemsRows: null,
  sendEDeliveryButtonDisabled:false,
};

const projectsCommonReducer = createReducer(
  initialProjectsCommonState,
  on(actions.GetIndex, state => ({ ...state, index: null, pending: true })),
  on(actions.GetIndexSearch, (state, { search }) => ({ ...state, search: Object.assign(state.search, search) })),
  on(actions.GetIndexComplete, (state, { index }) => ({ ...state, index, pending: false })),
  on(actions.GetItem, state => ({ ...state, item: null, pending: true })),
  on(actions.GetItemComplete, (state, { item }) => ({ ...state, item, pending: false })),
  on(actions.GetClaimantsList, state => ({ ...state, clients: null, pending: true, error: null })),
  on(actions.GetClaimantsListSuccess, (state, { clients, agGridParams }) => ({ ...state, clientsGridParams: agGridParams, clients, pending: false, error: null })),

  on(actions.GetAllProjectsActionRequest, state => ({ ...state, pending: true, error: null, projects: null })),
  on(actions.GetAllProjectsActionRequestComplete, (state, { projects, gridParams }) => ({ ...state, pending: false, projects, projectGridParams: gridParams })),
  on(actions.UpdateItem, (state, { item }) => ({ ...state, item: { ...state.item, ...item }, pending: false })),

  on(actions.SaveItem, state => ({ ...state, pending: true })),
  on(actions.SaveItemCompleted, (state, { item }) => ({ ...state, item: { ...item }, pending: false })),

  on(actions.ShowInfoBar, (state, { show }) => ({ ...state, showInfoBar: show })),
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(actions.UpdateContextBar, (state, { contextBar }) => ({ ...state, contextBar })),

  on(actions.GetDocumentImportsRequest, state => ({ ...state, clients: null, pending: true, error: null })),
  on(actions.GetDocumentImportsSuccess, (state, { documentImports, agGridParams }) => ({ ...state, documentImportGridParams: agGridParams, documentImports, pending: false, error: null })),
  on(actions.ResetDocumentImports, state => ({ ...state, documentImports: null, pending: false, error: null })),

  on(actions.GetProjectOverviewDashboardClaimantStatistic, state => ({ ...state, projectOverviewStatistics: null, isDashboardStatisticsLoaded: false })),
  on(actions.GetProjectOverviewDashboardClaimantStatisticSuccess, (state, { statistics }) => ({ ...state, projectOverviewStatistics: statistics, isDashboardStatisticsLoaded: true })),

  on(actions.GetProjectCounts, state => ({ ...state, projectCounts: null })),
  on(actions.GetProjectCountsSuccess, (state, { projectCounts }) => ({ ...state, projectCounts })),

  on(actions.CreateDisbursementGroup, state => ({ ...state, error: null })),
  on(actions.CreateOrUpdateDisbursementGroupError, (state, { error }) => ({ ...state, error })),

  on(actions.GetProjectDetailsRequest, state => ({ ...state, projectDetails: null })),
  on(actions.GetProjectDetailsSuccess, (state, { details }) => ({ ...state, projectDetails: details })),

  on(actions.GetProjectOverviewDashboardClaimantDetailsSuccess, (state, { data }) => ({ ...state, projectOverviewDashboard: data })),
  on(actions.GetProjectOverviewDashboardClaimantDetailsByPhaseSuccess, (state, { data }) => ({ ...state, projectOverviewDashboardByPhase: data })),
  on(actions.GetFinalizationCountsSuccess, (state, payload) => setRecentFinalizationsCounts(state, payload)),
  on(actions.GetFinalizationCountsByDatesSuccess, (state, payload) => updateRecentFinalizationsCounts(state, payload)),
  on(actions.GetDeficienciesWidgetDataSuccess, (state, { deficienciesWidgetData }) => ({ ...state, deficienciesWidgetData })),

  on(actions.ToggleLevelsAtProjectOverviewDashboardClaimantDetails, (state, payload) => toggleLevelsReducer(state, payload)),
  on(actions.ToggleSectionAtProjectOverviewDashboardClaimantDetails, (state, payload) => toggleSectionReducer(state, payload)),

  on(actions.CreateOrUpdateProjectOverviewDashboardClaimantsRequest, (state, { request }) => ({ ...state, projectOverviewDashboardClaimantsSearchRequest: request })),
  on(actions.GetProjectOverviewDashboardClaimants, state => ({ ...state, clients: null, pending: true, error: null })),
  on(actions.GetLedgerSettings, state => ({ ...state, ledgerSettings: null, claimantsWithLedgersList: null })),
  on(actions.GetLedgerSettingsSuccess, (state, { settings }) => ({ ...state, ledgerSettings: settings })),

  on(actions.CanPublishDWGenerationSuccess, (state, { canPublish }) => ({ ...state, canPublish })),
  on(actions.SendEDeliveryButtonDisabled, (state, { isDisabled }) => ({ ...state, sendEDeliveryButtonDisabled:isDisabled })),

  // Organizations
  on(actions.GetProjectOrgs, state => ({ ...state, pending: true, error: null, projectOrgs: null })),
  on(actions.GetProjectOrgsSuccess, (state, { items }) => ({ ...state, projectOrgs: items, error: null })),
  on(actions.GetProjectOrgsDropdownValues, state => ({ ...state, pending: true, error: null, projectOrgsDropdownValues: null })),
  on(actions.GetProjectOrgsDropdownValuesSuccess, (state, { items }) => ({ ...state, projectOrgsDropdownValues: items, error: null })),

  // Disbursement groups
  on(actions.ClearDisbursementGroup, state => ({ ...state, disbursementGroup: null })),
  on(actions.GetDisbursementGroupSuccess, (state, { disbursementGroup }) => ({ ...state, disbursementGroup })),
  on(actions.GetDisbursementGroupsGridSuccess, (state, { disbursementGroupList, agGridParams }) => ({ ...state, error: null, disbursementGroupList, disbursementGroupGridParams: agGridParams })),

  // Payment requests
  on(actions.GetPaymentRequestsList, state => ({ ...state, pending: true, error: null, paymentRequests: null })),
  on(actions.GetPaymentRequestsListSuccess, (state, { paymentRequests, agGridParams }) => ({ ...state, pending: false, paymentRequests, agGridParams })),
  on(actions.GetPaymentRequestsListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  // Chart of accounts
  on(actions.GetChartOfAccountsListSuccess, (state, { chartOfAccounts }) => ({ ...state, error: null, chartOfAccounts })),
  on(actions.SaveChartOfAccounts, state => ({ ...state, chartOfAccountsSavedSuccessfully: false })),
  on(actions.SaveChartOfAccountsSuccess, state => ({ ...state, chartOfAccountsSavedSuccessfully: true })),
  on(actions.GetChartOfAccountModes, state => ({ ...state, error: null, chartOfAccountModes: [] })),
  on(actions.GetChartOfAccountModesSuccess, (state, { chartOfAccountModes }) => ({ ...state, error: null, chartOfAccountModes })),
  on(actions.GetChartOfAccountDisbursementModes, state => ({ ...state, error: null, chartOfAccountDisbursementModes: [] })),
  on(actions.GetChartOfAccountDisbursementModesSuccess, (state, { chartOfAccountDisbursementModes }) => ({ ...state, error: null, chartOfAccountDisbursementModes })),
  on(actions.GetUsedChartOfAccountsNOs, state => ({ ...state, error: null, usedChartOfAccountsNOs: null })),
  on(actions.GetUsedChartOfAccountsNOsSuccess, (state, { usedChartOfAccountsNOs }) => ({ ...state, error: null, usedChartOfAccountsNOs })),

  // Settings
  on(actions.GetChartOfAccountsSettingsListSuccess, (state, { chartOfAccountsSettings }) => ({ ...state, error: null, chartOfAccountsSettings })),
  on(actions.ResetChartOfAccountsSettingsList, state => ({ ...state, chartOfAccountsSettings: null })),

  // Services
  on(actions.GetProjectServices, state => ({ ...state, services: null })),
  on(actions.GetProjectServicesSuccess, (state, { services }) => ({ ...state, services, error: null })),

  on(actions.GetContactsList, state => ({ ...state, contacts: null, pending: true, error: null })),
  on(actions.GetContactsListSuccess, (state, { contacts, agGridParams }) => ({ ...state, contactsGridParams: agGridParams, contacts, pending: false, error: null })),
  on(actions.GetClosingStatementListSuccess, (state, { agGridParams }) => ({ ...state, closingStatementGridParams: agGridParams, pending: false, error: null })),
  on(actions.GetContactsList, state => ({ ...state, contacts: null, pending: true, error: null })),
  on(actions.CreateOrUpdateContactError, (state, { error }) => ({ ...state, createOrUpdateContactError: error })),
  on(actions.ClearCreateUpdateContactError, state => ({ ...state, createOrUpdateContactError: null })),
  on(actions.GetProjectContactRolesSuccess, (state, { roles }) => ({ ...state, projectContactRoles: roles, error: null })),

  on(actions.GetBatchDetails, state => ({ ...state, batchDetails: null, batchDetailsLoading: true })),
  on(actions.GetBatchDetailsSuccess, (state, { batchDetails }) => ({ ...state, batchDetails, batchDetailsLoading: false })),

  on(actions.UpdateQcStatus, state => ({ ...state, batchDetailsLoading: true })),
  on(actions.UpdateQcStatusError, (state, {  }) => ({ ...state, batchDetailsLoading: false })),
  on(actions.GetUpdatedQcStatusSuccess, (state, { batchDetails }) => ({
    ...state,
    batchDetails: {
      ...state.batchDetails,
      qcStatus: batchDetails.qcStatus,
      canBeSent: batchDetails.canBeSent,
    },
    batchDetailsLoading: false,
  })),

  // Payment requests
  on(actions.GeneratePaymentRequestSuccess, (state, { generatePaymentRequestData }) => ({ ...state, error: null, paymentRequest: { ...state.paymentRequest, generatePaymentRequestData } })),
  on(actions.GeneratePaymentRequestGlobalSuccess, (state, { generatePaymentRequestData }) => ({ ...state, error: null, paymentRequest: { ...state.paymentRequest, generatePaymentRequestData } })),
  on(actions.GetPaymentRequestDataSuccess, (state, { paymentsData }) => ({ ...state, error: null, paymentRequest: { ...state.paymentRequest, paymentsData } })),
  on(actions.GetPaymentRequestDataResultSuccess, (state, { paymentsResultData }) => ({ ...state, error: null, paymentRequest: { ...state.paymentRequest, paymentsResultData } })),
  on(actions.ClearPaymentRequest, state => ({ ...state, error: null, paymentRequest: initialPaymentRequestState })),
  on(actions.AcceptPaymentRequestSuccess, (state, { acceptPaymentRequestData }) => ({ ...state, error: null, paymentRequest: { ...state.paymentRequest, acceptPaymentRequestData } })),
  on(actions.GetClosingStatementTemplatesSuccess, (state, { closingStatementTemplates }) => ({
    ...state,
    closingStatementTemplates: closingStatementTemplates?.map(item => SelectHelper.toGroupedOption(item, item?.isGlobal ? SelectGroupsEnum.GlobalTemplates : SelectGroupsEnum.ProjectSpecificTemplates)),
  })),
  on(actions.GetDisbursementsTemplatesSuccess, (state, { disbursementsTemplates }) => ({ ...state, disbursementsTemplates })),
  on(actions.IsPaymentRequestInProgress, (state, { isPaymentRequestInProgress }) => ({ ...state, paymentRequest: { ...state.paymentRequest, isPaymentRequestInProgress } })),
  on(actions.GetPaymentRequestReviewWarningsSuccess, actions.SetPaymentRequestDeficiencies, (state, { requestDeficiencies }) => ({ ...state, paymentRequest: { ...state.paymentRequest, requestDeficiencies: addIdsForRequestDeficiencies(requestDeficiencies) } })),
  on(actions.UpdatePaymentRequestSuccess, (state, { updatePaymentRequestData }) => ({ ...state, error: null, paymentRequest: { ...state.paymentRequest, updatePaymentRequestData } })),

  on(actions.GetClaimantsWithLedgersList, state => ({ ...state, claimantsWithLedgersList: null })),
  on(actions.GetClaimantsWithLedgersListSuccess, (state, { result }) => ({ ...state, claimantsWithLedgersList: result.page.items })),

  on(actions.GetFinancialProcessorLatestRunSuccess, (state, { latestRun }) => ({ ...state, financialProcessorLatestRun: latestRun })),

  // Project Receivables
  on(actions.GetProjectReceivables, state => ({ ...state, projectReceivablesModified: new Dictionary<number, boolean>(), pending: true })),
  on(actions.GetProjectReceivablesSuccess, (state, { projectReceivables }) => ({ ...state, projectReceivables })),
  on(actions.UpdateProjectReceivables, (state, payload) => updateProjectReceivablesReducer(state, payload)),
  on(actions.SetProjectReceivablesToDefaultSuccess, (state, { sectionId, resetGroup }) => setProjectReceivablesToDefaultReducer(state, sectionId, resetGroup)),
  on(actions.SaveProjectReceivablesSuccess, (state, { projectReceivables }) => ({ ...state, projectReceivables, projectReceivablesModified: new Dictionary<number, boolean>() })),
  on(actions.ExpandProjectReceivablesSection, (state, { sectionIndex }) => expandProjectReceivablesSectionsReducer(state, sectionIndex)),

  // Project Deficiencies
  on(actions.GetDeficienciesList, (state, { params }) => ({ ...state, deficienciesGridParams: params })),

  on(actions.GetProjectFirmsOptionsSuccess, (state, { values }) => ({ ...state, error: null, projectFirmsOptions: values })),

  on(actions.Error, (state, { error }) => ({ ...state, error })),

  // Project manual payment requests
  on(actions.GetManualPaymentRequestsList, (state, { agGridParams }) => ({ ...state, manualPaymentGridParams: agGridParams })),

  on(actions.ValidatePaymentRequestSuccess, (state, { documentImport }) => ({ ...state, paymentRequestDocumentImport: documentImport })),
  on(actions.GetPaymentRequestImportsResultRequestSuccess, (state, { validationResults }) => ({ ...state, error: null, paymentRequestImportsResult: validationResults })),

  on(actions.GetDocumentImportByIdSuccess, (state, { paymentRequestDocumentImportPreviewResults }) => ({ ...state, paymentRequestDocumentImportPreviewResults })),
  on(actions.ManualPaymentRequestDocsRequestSuccess, (state, { manualPaymentRequestDocsResponse }) => ({ ...state, manualPaymentRequestDocsResponse })),

  on(actions.GetDocumentImportTemplatesSuccess, (state, { templates }) => ({ ...state, templates: templates.map(DocumentImportTemplate.toModel) })),

  // Project Messaging
  on(actions.GetProjectMessagesRequest, state => ({ ...state, projectMessages: null, projectMessagesModified: null })),
  on(actions.GetProjectMessagesSuccess, (state, { messages }) => ({ ...state, projectMessages: messages, projectMessagesModified: cloneDeep(messages) })),
  on(actions.SaveProjectMessagesSuccess, (state, { messages }) => ({ ...state, projectMessages: messages, projectMessagesModified: cloneDeep(messages) })),

  on(actions.GetProjectMessagesTypesRequest, state => ({ ...state, projectMessagesTypes: null })),
  on(actions.GetProjectMessagesTypesSuccess, (state, { items }) => ({ ...state, projectMessagesTypes: items })),

  on(actions.UpdateProjectMessageType, (state, payload) => updateProjectMessageTypeReducer(state, payload)),
  on(actions.UpdateProjectMessageText, (state, payload) => updateProjectMessageTextReducer(state, payload)),
  on(actions.ResetProjectMessages, state => ({ ...state, projectMessagesModified: cloneDeep(state.projectMessages) })),

  on(actions.GetProjectFirmsMessaging, state => ({ ...state, projectFirmMessages: null, pending: true, error: null })),
  on(actions.GetProjectFirmsMessagingSuccess, (state, { projectCustomMessages }) => ({ ...state, projectFirmMessages: projectCustomMessages, pending: false, error: null })),

  // Update Stage
  on(actions.GetBatchActionDeficienciesSuccess, (state, { batchActionDeficienciesReview }) => ({ ...state, batchActionDeficienciesReview })),
  on(actions.ResetBatchActionDeficiencies, state => ({ ...state, batchActionDeficienciesReview: null })),

  // Def settings
  on(actions.GetDeficiencySettingsListSuccess, (state, { deficiencySettings }) => ({ ...state, error: null, deficiencySettings })),
  on(actions.SaveDeficiencySettings, state => ({ ...state, deficiencySettingsSavedSuccessfully: false })),
  on(actions.SaveDeficiencySettingsSuccess, state => ({ ...state, deficiencySettingsSavedSuccessfully: true })),
  on(actions.DeleteDisbursementGroupError, (state, { errorMessage }) => ({ ...state, errorMessage: errorMessage, disbursementGroupDeletedSuccessfully: false })),
  on(actions.DeleteDisbursementGroupSuccess, state => ({ ...state, disbursementGroupDeletedSuccessfully: true })),
  on(actions.EnqueueDeleteDisbursementGroup, state => ({ ...state, disbursementGroupDeletedSuccessfully: false })),

  // Transfer requests
  on(actions.GenerateTransferRequestSuccess, (state, { batchActionData }) => ({ ...state, error: null, batchActionData: BatchAction.toModel(batchActionData)})),
  on(actions.GetBatchActionSuccess, (state, { batchActionData }) => ({ ...state, error: null, batchActionData })),
  on(actions.GenerateTransferRequest, (state, { params }) => ({ ...state, error: null, progressBarData: { ...state.progressBarData, pusherChannel: params.pusherChannelName,
  } })),
  on(actions.GenerateTransferRequestJobSuccess, (state, { jobResult }) => ({ ...state, error: null, progressBarData: jobResult })),
  on(actions.GetTransferDeficienciesSuccess, (state, { transferRequestDeficiencies }) => ({ ...state, error: null, requestDeficiencies: transferRequestDeficiencies })),
  on(actions.GetTransferRequestSuccess, (state, { transferRequest }) => ({ ...state, error: null, transferRequest })),
  on(actions.ClearTransferData, state => ({ ...state, error: null, transferData: null })),
  on(actions.UpdateProgressBarData, (state, { progressBarData }) => ({ ...state, error: null, progressBarData })),
  on(actions.ClearProgressBarData, state => ({ ...state, error: null, progressBarData: null })),
  on(actions.GetTransfersItemsSuccess, (state, { transferData }) => ({ ...state, error: null, transferData })),

  on(actions.CheckMaintenanceSuccess, (state, { isMaintance }) => ({ ...state, isMaintance })),
  on(actions.ValidateMaintenanceCompleted, (state, { isMaintance }) => ({ ...state, isMaintance })),
  on(actions.ResetMaintenance, state => ({ ...state, isMaintance: false })),

  on(actions.GetReportScheduleListSuccess, (state, { scheduledReports, agGridParams }) => ({ ...state, scheduledReportsGridParams: agGridParams, scheduledReports, pending: false, error: null })),
  on(actions.GetReportScheduleSuccess, (state, { reportSchedule }) => ({ ...state, reportSchedule })),

  on(actions.ResetReportSchedule, state => ({ ...state, reportSchedule: null })),

  // Manual Payment Request
  on(actions.GetManualPaymentRequestImportsRowsRequestSuccess, (state, { manualPaymentItemsRows }) => ({ ...state, error: null, manualPaymentItemsRows })),
);

/**
 * Changes the checked status of receivable items
 *
 * @param {ProjectsState} state - current state
 * @param {{
 *   sectionIndex: number,
 *   groupIndex: number,
 *   itemId: number,
 *   isChecked: boolean,
 * }} payload - action payload
 * @returns {ProjectsState}
 */
function updateProjectReceivablesReducer(state: ProjectsCommonState, payload: {
  sectionIndex: number,
  groupIndex: number,
  itemId: number,
  isChecked: boolean,
}): ProjectsCommonState {
  const newState = { ...state, projectReceivables: [...state.projectReceivables], projectReceivablesModified: state.projectReceivablesModified.clone() };

  newState.projectReceivables[payload.sectionIndex].items[payload.groupIndex].receivables.find(recievable => recievable.id === payload.itemId).checked = payload.isChecked;

  updateProjectReceivablesModified(newState, payload.itemId, payload.isChecked);

  return newState;
}

/**
 *
 * Changes the message type in the project message
 *
 * @param {ProjectsState} state - current state
 * @param {{
 *   messageType: IdValue,
 *   sectionIndex: number
 * }} payload - action payload
 * @returns {ProjectsState}
 */
function updateProjectMessageTypeReducer(state: ProjectsCommonState, payload: {
  messageType: IdValue,
  sectionIndex: number
}): ProjectsCommonState {
  const newState = { ...state, projectMessagesModified: [...state.projectMessagesModified] };

  newState.projectMessagesModified[payload.sectionIndex].messageType = payload.messageType;

  return newState;
}

/**
 *
 * Changes the message type in the project message
 *
 * @param {ProjectsState} state - current state
 * @param {{
 *   customMessage: string,
 *   sectionIndex: number
 * }} payload - action payload
 * @returns {ProjectsState}
 */
function updateProjectMessageTextReducer(state: ProjectsCommonState, payload: {
  customMessage: string,
  sectionIndex: number
}): ProjectsCommonState {
  const newState = { ...state, projectMessagesModified: [...state.projectMessagesModified] };

  newState.projectMessagesModified[payload.sectionIndex].customMessage = payload.customMessage;

  return newState;
}

/**
 * Changes the expand status of receivable sections
 *
 * @param {ProjectsState} state - current state
 * @param {sectionId: number} sectionId - sectionId
 * @param {resetGroup: ReceivableGroup} resetGroup - resetGroup
 * @returns {ProjectsState}
 */
function setProjectReceivablesToDefaultReducer(state: ProjectsCommonState, sectionId: number, resetGroup: ReceivableGroup): ProjectsCommonState {
  const newState = { ...state, projectReceivables: [...state.projectReceivables], projectReceivablesModified: state.projectReceivablesModified.clone() };

  const groupItems = newState.projectReceivables.find(item => item.id === sectionId).items.find(item => item.serviceId === resetGroup.serviceId).receivables;
  const changedItems = resetGroup.receivables.filter(item => item.checked !== groupItems.find(resetItem => resetItem.id === item.id).checked);

  changedItems.forEach(item => updateProjectReceivablesModified(newState, item.id, item.checked));

  groupItems.splice(0, groupItems.length, ...resetGroup.receivables);

  return newState;
}

// Updates Modified Receivables
function updateProjectReceivablesModified(state: ProjectsCommonState, id: number, isChecked: boolean): void {
  if (state.projectReceivablesModified.containsKey(id)) {
    state.projectReceivablesModified.remove(id);
  } else {
    state.projectReceivablesModified.setValue(id, isChecked);
  }
}

function setRecentFinalizationsCounts(state: ProjectsCommonState, payload: {
  finalizationsCounts: FinalizationCount[]
}): ProjectsCommonState {
  const newState = Object.assign({}, state);

  newState.recentFinalizationsCounts = Object.assign({}, ...payload.finalizationsCounts.map(fc => ({ [fc.productCategoryId]: {
    from: fc.from,
    to: fc.to,
    count: fc.count,
  } })));
  return newState;
}

function updateRecentFinalizationsCounts(state: ProjectsCommonState, payload: {
  finalizationsCount: FinalizationCount,
}): ProjectsCommonState {
  const newState = Object.assign({}, state);
  const id = payload.finalizationsCount.productCategoryId;
  if (newState.recentFinalizationsCounts[id]) {
    newState.recentFinalizationsCounts[id].count = payload.finalizationsCount.count;
  } else {
    newState.recentFinalizationsCounts.setValue(id, payload.finalizationsCount);
  }
  return newState;
}

/**
 * Sets Project Receivables to default
 *
 * @param {ProjectsState} state - current state
 * @param {sectionIndex: number} sectionIndex - sectionIndex
 * @returns {ProjectsState}
 */
function expandProjectReceivablesSectionsReducer(state: ProjectsCommonState, sectionIndex: number): ProjectsCommonState {
  const newState = { ...state, projectReceivables: [...state.projectReceivables] };

  newState.projectReceivables[sectionIndex].isExpanded = !newState.projectReceivables[sectionIndex].isExpanded;

  return newState;
}

// we have to wrap our reducer like this or it won't compile in prod
function ProjectsCommonReducer(state: ProjectsCommonState | undefined, action: Action) {
  return projectsCommonReducer(state, action);
}

/**
 * Toggles expanded\collapsed state for provided hierarchy level in dashboard table
 *
 * @param {ProjectsState} state - current state
 * @param {{
 *   expand: boolean,
 *   toggledLevels?: number
 * }} payload - action payload
 * @returns {ProjectsState}
 */
function toggleLevelsReducer(state: ProjectsCommonState, payload: {
  expand: boolean,
}): ProjectsCommonState {
  if (!state.projectOverviewDashboardByPhase || !state.projectOverviewDashboardByPhase.rows) {
    return state;
  }
  const newState = Object.assign(state, {
    projectOverviewDashboardByPhase: Object.assign(
      {},
      new DashboardData(),
      state.projectOverviewDashboardByPhase,
      { rows: [...state.projectOverviewDashboardByPhase.rows] },
    ),
  });

  for (const row of newState.projectOverviewDashboardByPhase.rows) {
    row.expanded = payload.expand;
  }

  newState.isExpanded = newState.projectOverviewDashboardByPhase.rows
    .filter(row => row.expandable)
    .every(row => row.expanded);

  return newState;
}

/**
 * Toggles visibility state for sub-sections of provided section
 *
 * @param {ProjectsState} state - current state
 * @param {{
 *   expand: boolean,
 *   toggledSection: DashboardRow
 * }} payload - action payload
 * @returns {ProjectsState}
 */
function toggleSectionReducer(state: ProjectsCommonState, payload: {
  expand: boolean,
  toggledSection: DashboardRow
}): ProjectsCommonState {
  const newState = Object.assign(state, {
    projectOverviewDashboardByPhase: Object.assign(
      {},
      new DashboardData(),
      state.projectOverviewDashboardByPhase,
      { rows: [...state.projectOverviewDashboardByPhase.rows] },
    ),
  });

  const index = newState.projectOverviewDashboardByPhase.rows.findIndex(row => row.id === payload.toggledSection.id);
  if (index >= 0) {
    const toggledSection = newState.projectOverviewDashboardByPhase.rows[index];
    toggledSection.expanded = payload.expand;
  }
  return newState;
}

function addIdsForRequestDeficiencies(addIdsForRequestDeficiencies: RequestReviewOption[]): RequestReviewOption[] {
  return addIdsForRequestDeficiencies.map((item, index) => ({
    ...item,
    id: index,
  }));
}

export interface ProjectsState {
  common: ProjectsCommonState,
  claimantsSummary: ClaimantsSummaryState,
  claimantsSummaryRollup: ClaimantsSummaryRollupState,
  projectClaimantsAdvancedSearch: fromAdvancedSearch.AdvancedSearchState,
  electionForms: ElectionFormsState,
  paymentQueue: PaymentQueueState,
  claimantSettlementLedgerSettings: LedgerSettingsState,
  billingRule: fromBillingRule.BillingRuleState,
  scopeOfWork: ScopeOfWorkState,
}

const initialState: ProjectsState = {
  common: initialProjectsCommonState,
  claimantsSummary: ClaimantsSummaryInitialState,
  claimantsSummaryRollup: ClaimantsSummaryRollupInitialState,
  projectClaimantsAdvancedSearch: fromAdvancedSearch.initialState,
  electionForms: electionFormsInitialState,
  claimantSettlementLedgerSettings: claimantSettlementLedgerSettingsInitialState,
  billingRule: fromBillingRule.initialState,
  scopeOfWork: scopeOfWorkInitialState,
  paymentQueue: paymentQueueInitialState,
};

const projectsReducer = combineReducers({
  common: ProjectsCommonReducer,
  claimantsSummary: claimantsSummaryReducer,
  claimantsSummaryRollup: claimantsSummaryRollupReducer,
  projectClaimantsAdvancedSearch: fromAdvancedSearch.AdvancedSearchReducerFor(actions.CASE_CLAIMANTS_FEATURE_NAME),
  electionForms: electionFormsReducer,
  claimantSettlementLedgerSettings: claimSettlementLedgerSettingsReducer,
  billingRule: fromBillingRule.reducer,
  scopeOfWork: scopeOfWorkReducer,
  paymentQueue: paymentQueueReducer,
}, initialState);

export function ProjectsReducer(state: ProjectsState | undefined, action: Action) {
  return projectsReducer(state, action);
}
