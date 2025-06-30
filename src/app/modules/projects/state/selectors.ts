import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromProjects from './reducer';
import { authSelectors } from '@app/modules/auth/state';

const projectsFeature = createFeatureSelector<fromProjects.ProjectsState>('projects_feature');
const selectFeature = createSelector(projectsFeature, state => state.common);

export const projects = createSelector(selectFeature, state => state.projects);
export const projectGridParams = createSelector(selectFeature, state => state.projectGridParams);
export const clientGridParams = createSelector(selectFeature, state => state.clientsGridParams);
export const contactsGridParams = createSelector(selectFeature, state => state.contactsGridParams);
export const closingStatementGridParams = createSelector(selectFeature, state => state.closingStatementGridParams);
export const batchDetails = createSelector(selectFeature, state => state.batchDetails);
export const batchDetailsLoading = createSelector(selectFeature, state => state.batchDetailsLoading);
export const index = createSelector(selectFeature, state => state.index);
export const item = createSelector(selectFeature, state => state.item);
export const projectReceivables = createSelector(selectFeature, state => state.projectReceivables);
export const projectReceivablesModified = createSelector(selectFeature, state => state.projectReceivablesModified);
export const projectDetails = createSelector(selectFeature, state => state.projectDetails);
export const clients = createSelector(selectFeature, state => state.clients);
export const projectOverviewStatistics = createSelector(selectFeature, state => state.projectOverviewStatistics);
export const projectCounts = createSelector(selectFeature, state => state.projectCounts);
export const projectDeficienciesCount = createSelector(selectFeature, state => state.projectCounts?.portalDeficienciesCount);
export const projectOverviewDashboard = createSelector(selectFeature, state => state.projectOverviewDashboard);
export const projectOverviewDashboardByPhase = createSelector(selectFeature, state => state.projectOverviewDashboardByPhase);
export const recentFinalizationsCounts = createSelector(selectFeature, state => state.recentFinalizationsCounts);
export const deficienciesWidgetData = createSelector(selectFeature, state => state.deficienciesWidgetData);
export const projectOverviewDashboardClaimantsSearchRequest = createSelector(selectFeature, state => state.projectOverviewDashboardClaimantsSearchRequest);
export const services = createSelector(selectFeature, state => state.services);
export const disbursementGroup = createSelector(selectFeature, state => state.disbursementGroup);
export const disbursementGroupGridParams = createSelector(selectFeature, state => state.disbursementGroupGridParams);
export const disbursementGroupList = createSelector(selectFeature, state => state.disbursementGroupList);
export const documentImports = createSelector(selectFeature, state => state.documentImports);
export const documentImportGridParams = createSelector(selectFeature, state => state.documentImportGridParams);
export const showInfoBar = createSelector(selectFeature, state => state.showInfoBar);
export const actionBar = createSelector(selectFeature, state => state.actionBar);
export const contextBar = createSelector(selectFeature, state => state.contextBar);
export const search = createSelector(selectFeature, state => state.search);
export const projectClaimantsAdvancedSearch = createSelector(projectsFeature, state => state.projectClaimantsAdvancedSearch);
export const isExpanded = createSelector(selectFeature, state => state.isExpanded);
export const deficienciesGridParams = createSelector(selectFeature, state => state.deficienciesGridParams);

export const chartOfAccounts = createSelector(selectFeature, state => state.chartOfAccounts);
export const chartOfAccountsSettings = createSelector(selectFeature, state => state.chartOfAccountsSettings);
export const chartOfAccountsSavedSuccessfully = createSelector(selectFeature, state => state.chartOfAccountsSavedSuccessfully);
export const chartOfAccountModes = createSelector(selectFeature, state => state.chartOfAccountModes);
export const usedChartOfAccountsNOs = createSelector(selectFeature, state => state.usedChartOfAccountsNOs);
export const chartOfAccountDisbursementModes = createSelector(selectFeature, state => state.chartOfAccountDisbursementModes);
export const ledgerSettings = createSelector(selectFeature, state => state.ledgerSettings);

export const generatePaymentRequestData = createSelector(selectFeature, state => state.paymentRequest.generatePaymentRequestData);
export const generatedPaymentsData = createSelector(selectFeature, state => state.paymentRequest.paymentsData);
export const generatedPaymentsResultData = createSelector(selectFeature, state => state.paymentRequest.paymentsResultData);
export const acceptPaymentRequestData = createSelector(selectFeature, state => state.paymentRequest.acceptPaymentRequestData);
export const updatePaymentRequestData = createSelector(selectFeature, state => state.paymentRequest.updatePaymentRequestData);
export const isPaymentRequestInProgress = createSelector(selectFeature, state => state.paymentRequest.isPaymentRequestInProgress);
export const paymentRequestCriticalDeficiencies = createSelector(selectFeature, state => state.paymentRequest.requestDeficiencies?.filter(i => i.severe));
export const paymentRequestWarningDeficiencies = createSelector(selectFeature, state => state.paymentRequest.requestDeficiencies?.filter(i => !i.severe));
export const paymentRequesDeficiencies = createSelector(selectFeature, state => state.paymentRequest.requestDeficiencies);

export const projectContactRoles = createSelector(selectFeature, state => state.projectContactRoles);
export const closingStatementTemplates = createSelector(selectFeature, state => state.closingStatementTemplates);
export const disbursementsTemplates = createSelector(selectFeature, state => state.disbursementsTemplates);

export const claimantsWithLedgersList = createSelector(selectFeature, state => state.claimantsWithLedgersList);
export const financialProcessorLatestRun = createSelector(selectFeature, state => state.financialProcessorLatestRun);

export const projectOrgs = createSelector(selectFeature, state => state.projectOrgs);
export const projectOrgsDropdownValues = createSelector(selectFeature, state => state.projectOrgsDropdownValues);
export const projectFirmsOptions = createSelector(selectFeature, state => state.projectFirmsOptions);

export const canPublish = createSelector(selectFeature, state => state.canPublish);

export const manualPaymentGridParams = createSelector(selectFeature, state => state.manualPaymentGridParams);
export const paymentRequestDocumentImport = createSelector(selectFeature, state => state.paymentRequestDocumentImport);
export const paymentRequestImportsResult = createSelector(selectFeature, state => state.paymentRequestImportsResult);
export const paymentRequestDocumentImportPreviewResults = createSelector(selectFeature, state => state.paymentRequestDocumentImportPreviewResults);
export const manualPaymentRequestDocsResponse = createSelector(selectFeature, state => state.manualPaymentRequestDocsResponse);

export const documentImportTemplates = createSelector(selectFeature, state => state.templates);

export const projectMessages = createSelector(selectFeature, state => state.projectMessages);
export const projectMessagesModified = createSelector(selectFeature, state => state.projectMessagesModified);
export const projectMessagesTypes = createSelector(selectFeature, state => state.projectMessagesTypes);
export const projectFirmMessages = createSelector(selectFeature, state => state.projectFirmMessages);

export const severeActionDeficienciesReview = createSelector(selectFeature, state => state.batchActionDeficienciesReview?.options?.filter(def => def.severe));
export const nonSevereActionDeficienciesReview = createSelector(selectFeature, state => state.batchActionDeficienciesReview?.options?.filter(def => !def.severe));
export const criticalActionDeficienciesReview = createSelector(selectFeature, state => state.batchActionDeficienciesReview?.options?.filter(def => def.severe && !def.other));
export const warningActionDeficienciesReview = createSelector(selectFeature, state => state.batchActionDeficienciesReview?.options?.filter(def => !def.severe && !def.other));
export const totalErroredLedgers = createSelector(selectFeature, state => state.batchActionDeficienciesReview?.totalErroredLedgers);
export const totalValidatedLedgers = createSelector(selectFeature, state => state.batchActionDeficienciesReview?.totalLedgers);

export const error = createSelector(selectFeature, state => state.error);
export const errorMessage = createSelector(selectFeature, state => state.errorMessage);

export const deficiencySettings = createSelector(selectFeature, state => state.deficiencySettings);
export const deficiencySettingsSavedSuccessfully = createSelector(selectFeature, state => state.deficiencySettingsSavedSuccessfully);

export const deleteDisbursementGroupSuccess = createSelector(selectFeature, state => state.disbursementGroupDeletedSuccessfully);

export const isMaintance = createSelector(selectFeature, state => state.isMaintance);

export const progressBarData = createSelector(selectFeature, state => state.progressBarData);
export const batchActionData = createSelector(selectFeature, state => state.batchActionData);
export const transferRequest = createSelector(selectFeature, state => state.transferRequest);
export const transferData = createSelector(selectFeature, state => state.transferData);

export const isDashboardStatisticsLoaded = createSelector(selectFeature, state => state.isDashboardStatisticsLoaded);

export const scheduledReportsGridParams = createSelector(selectFeature, state => state.scheduledReportsGridParams);
export const reportSchedule = createSelector(selectFeature, state => state.reportSchedule);

export const manualPaymentItemsRows = createSelector(selectFeature, state => state.manualPaymentItemsRows);

export const sendEDeliveryButtonDisabled = createSelector(selectFeature, state => state.sendEDeliveryButtonDisabled);

export const projectPrimaryOrgId = createSelector(item, project => project?.primaryOrgId);
export const hasAccessToPrimaryOrgFeatures = createSelector(
  authSelectors.selectedOrganization,
  projectPrimaryOrgId,
  (userOrg, primaryOrgId) => (!!userOrg.id && !!primaryOrgId && userOrg.id === primaryOrgId) || userOrg.isMaster
);