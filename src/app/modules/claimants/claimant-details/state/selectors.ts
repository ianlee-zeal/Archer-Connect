import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClaimantDetailsState } from './reducer';

const selectFeature = createFeatureSelector<ClaimantDetailsState>('claimant_details_feature');

export const showInfoBar = createSelector(selectFeature, state => state.showInfoBar);
export const item = createSelector(selectFeature, state => state.item);
export const id = createSelector(selectFeature, state => state.id);
export const error = createSelector(selectFeature, state => state.error);
export const actionBar = createSelector(selectFeature, state => state.actionBar);
export const claimantDashboardOverviewItems = createSelector(selectFeature, state => state.claimantDashboardOverviewItems);
export const claimantDashboardOverviewData = createSelector(selectFeature, state => state.claimantDashboardOverviewData);
export const claimantOverviewPaymentItems = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.paymentItems);
export const claimantOverviewBankruptcyItems = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.bankruptcyItems);
export const claimantOverviewLiensData = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.lienData);
export const claimantOverviewLiensItems = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.lienData?.items);
export const claimantOverviewReleaseAdmin = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.releaseAdmin);
export const claimantOverviewReleaseAdminItems = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.releaseAdmin?.items);
export const claimantOverviewInvoicingDetails = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.invoicingDetails);
export const claimantOverviewInvoicingDetailsItems = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.invoicingDetails?.items);
export const claimantOverviewProbateItems = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.probateItems);
export const claimantOverviewQSFData = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.qsfAdmin);
export const claimantOverviewQSFItems = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.qsfAdmin?.items);
export const engagedServicesIds = createSelector(selectFeature, state => state.claimantDashboardOverviewData?.engagedServicesIds);
export const claimantDashboardOverviewAdditionalInfo = createSelector(selectFeature, (state, props) => state.claimantDashboardOverviewAdditionalInfo[props.productCategoryId]?.sort((a, b) => (a.sortOrder - b.sortOrder)));
export const claimantSummary = createSelector(selectFeature, state => state.claimantSummary);
export const organizationAccess = createSelector(selectFeature, state => state.organizationAccess);
export const agGridParams = createSelector(selectFeature, state => state.agGridParams);
export const claimantDetailsRequest = createSelector(selectFeature, state => state.claimantDetailsRequest);
export const services = createSelector(selectFeature, state => state.services);
export const projects = createSelector(selectFeature, state => state.projects);
export const productDetails = createSelector(selectFeature, (state, props) => state.productDetails?.items && state.productDetails.items[props.typeId]);
export const productDetailsIsLoaded = createSelector(selectFeature, state => state.productDetails?.isLoaded);
export const clientWorkflow = createSelector(selectFeature, state => state.clientWorkflow);
export const headerElements = createSelector(selectFeature, state => state.headerElements);
export const showSpecialDesignationsBar = createSelector(selectFeature, state => state.showSpecialDesignationsBar);
export const dataSource = createSelector(selectFeature, (state, productCategory) => state.dataSource?.items && state.dataSource.items[productCategory]);
export const dataSourceIsLoaded = createSelector(selectFeature, state => state.dataSource?.isLoaded);
export const ledgerInfo = createSelector(selectFeature, state => state.ledgerInfo);
export const netAllocationDetails = createSelector(selectFeature, state => state.netAllocationDetails);
export const formulaModes = createSelector(selectFeature, state => state.formulaModes);
export const formulaSet = createSelector(selectFeature, state => state.formulaSet);
export const qsfTypes = createSelector(selectFeature, state => state.qsfTypes);
export const holdTypes = createSelector(selectFeature, state => state.holdTypes);
export const chartOfAccounts = createSelector(selectFeature, state => state.chartOfAccounts);
export const docId = createSelector(selectFeature, state => state.docId);
export const isExpanded = createSelector(selectFeature, state => state.isExpanded === null || state.isExpanded);
export const claimantIdentifiersSelector = createSelector(selectFeature, state => state.identifiers);
export const electionForm = createSelector(selectFeature, state => state.electionForm);
export const ledgerStages = createSelector(selectFeature, state => state.ledgerStages);
export const ledgerStagesWithClaimantCount = createSelector(selectFeature, state => state.ledgerStagesWithClaimantCount);
export const ledgerSummaryGrid = createSelector(selectFeature, state => state.ledgerSummaryGrid);
export const ledgerOverviewGrid = createSelector(selectFeature, state => state.ledgerOverview);
export const ledgerOverviewTotal = createSelector(selectFeature, state => state.ledgerOverviewTotal);
export const electionFormList = createSelector(selectFeature, state => state.electionFormList);
export const electionFormGridParams = createSelector(selectFeature, state => state.electionFormGridParams);
export const ledgerEntryInfo = createSelector(selectFeature, state => state.ledgerEntryInfo);
export const ledgerVariances = createSelector(selectFeature, state => state.ledgerVariances);
export const paymentInstructions = createSelector(selectFeature, state => state.paymentInstructions);
export const paymentInstructionPayees = createSelector(selectFeature, state => state.paymentInstructions?.payees);
export const availableDisbursementGroupsForElectionForm = createSelector(selectFeature, state => state.availableDisbursementGroupsForElectionForm);
export const orgAccessOrganizationsSelector = createSelector(selectFeature, state => state.orgAccessOrganizations);
export const deficienciesGridParams = createSelector(selectFeature, state => state.deficienciesGridParams);
export const claimantFinalizedDate = createSelector(selectFeature, state => state.item?.finalizedDate);
export const payeeItems = createSelector(selectFeature, state => state.payeeItems);
export const closingStatementSettingsData = createSelector(selectFeature, state => state.closingStatementsSettingsData);
export const clientPaymentHold = createSelector(selectFeature, state => state.clientPaymentHold);
export const paymentHoldHistory = createSelector(selectFeature, state => state.historyItems);
export const probateDetailsItem = createSelector(selectFeature, state => state.probateDetailsItem);
export const probateOverviewItems= createSelector(selectFeature, state => state.probateOverviewItems);
export const bankruptcyOverviewItems= createSelector(selectFeature, state => state.bankruptcyOverviewItems);
export const releaseOverviewItem= createSelector(selectFeature, state => state.releaseItem);
export const probateServiceTypes = createSelector(selectFeature, state => state.probateServiceTypes);
export const probateStages = createSelector(selectFeature, state => state.probateStages);
export const inactiveReasons = createSelector(selectFeature, state => state.inactiveReasons);
export const probateDisbursementGroups = createSelector(selectFeature, state => state.probateDisbursementGroups);
export const probateAssignUser = createSelector(selectFeature, state => state.probateAssignUser);
export const archerId = createSelector(selectFeature, state => state.archerId);
export const projectMessages = createSelector(selectFeature, state => state.projectMessages);
export const isProjectMessagesModalOpen = createSelector(selectFeature, state => state.isProjectMessagesModalOpen);
export const claimantCounts = createSelector(selectFeature, state => state.claimantCounts);
export const paymentTrackingTotalCount = createSelector(selectFeature, state => state.paymentTrackingTotalCount);

export const isLoadedClaimantOverview = createSelector(selectFeature, state => state.isLoadedClaimantOverview);
export const isFullPinLoaded = createSelector(selectFeature, state => state.isFullPinLoaded);
export const fullClaimantPin = createSelector(selectFeature, state => state.fullClaimantPin);
export const designatedNotes = createSelector(selectFeature, state => state.designatedNotes);
export const ledgerEntryValidationData = createSelector(selectFeature, state => state.ledgerEntryValidationData);

export const uncuredDeficienciesCount = createSelector(selectFeature, state => state.uncuredDeficienciesCount);
export const claimantDeficiencies = createSelector(selectFeature, state => state.claimantDeficiencies);
export const pendingDeficiencies = createSelector(selectFeature, state => state.pendingDeficiencies);