/* eslint-disable @typescript-eslint/no-shadow */
import {
  ProjectClaimantRequest,
  LienService,
  ClientWorkflow,
  KeyValue,
  IdValue,
  ClaimantElection,
  PaymentInstruction,
  Address,
  FormulaSets,
  EntityAddress,
  Email,
} from '@app/models';
/* eslint-disable @typescript-eslint/no-use-before-define */
import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { items } from 'fusioncharts';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ClaimantSummary } from '@app/models/claimant-summary';
import { OrganizationEntityAccess } from '@app/models/organization-entity-access';

import { ClaimantDashboardOverviewItem } from '@app/models/claimant-dashboard-overview-item';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { HashTable } from '@app/models/hash-table';
import { DataSource } from '@app/models/dataSource';
import { ClaimantProductDetails } from '@app/models/claimant-product-details';
import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { LedgerInfo, NetAllocationDetails, ChartOfAccount } from '@app/models/closing-statement';
import { ClaimantIdentifier } from '@app/models/claimant-identifiers';
import { LedgerSummary } from '@app/models/closing-statement/ledger-summary';
import { Dictionary, IDictionary } from '@app/models/utils';
import { LedgerEntryInfo } from '@app/models/closing-statement/ledger-entry-info';
import { LedgerVariance } from '@app/models/closing-statement/ledger-variance';
import { ArrayHelper } from '@app/helpers/array.helper';
import { ClaimSettlementLedgerPayee } from '@app/models/ledger-settings';
import { PayeeItem } from '@app/models/closing-statement/payee-item';
import { AddressesListResponse } from '@app/modules/addresses/address-list/state/actions';
import { DisbursementGroup } from '@app/models/disbursement-group';
import { LedgerOverview } from '@app/models/ledger-overview';
import { LedgerOverviewTotal } from '@app/models/ledger-overview-total';
import { EmailsListResponse } from '@app/models/emails-list-response';
import { LedgerStageWithClaimantCount } from '@app/models/ledger-stage-with-claimant-count';
import { HoldType } from '@app/models/hold-type';
import { ClientPaymentHold } from '@app/models/client-payment-hold';
import { ClientPaymentHoldHistory } from '@app/models/client-payment-hold-history';
import { PaymentInstructionsValidationHelper } from '@app/helpers/payment-instructions-validation.helper';
import { ProbateDetails } from '@app/models/probate-details';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { SelectHelper } from '@app/helpers/select.helper';
import { SelectGroupsEnum } from '@app/models/enums/select-groups.enum';
import { ProjectMessage } from '@app/models/projects/project-message';
import { ClaimantCounts } from '@app/models/claimant-counts';
import { LedgerEntryValidationData } from '@app/models/closing-statement/ledger-entry-validation-data';
import { User } from '../../../../models/user';
import { PaymentTypeEnum } from '../../../../models/enums/payment-type.enum';
import * as claimantActions from './actions';
import { ClaimantOverview } from '../../../../models/claimant-overview/claimant-overview';
import { ClaimantOverviewProbate } from '@app/models/claimant-overview/claimant-overview-probate';
import { ClaimantOverviewBankruptcy } from '@app/models/claimant-overview/claimant-overview-bankruptcy';
import { ClaimantOverviewReleaseAdmin } from '@app/models/claimant-overview/claimant-overview-release-admin';
import { ClaimantDeficiency } from '@app/models/claimant-deficiency';
import { IDeficiencyResolutionWithFiles } from '@app/models/claimant-deficiency-resolution';

export interface ClaimantDetailsState {
  showInfoBar: boolean;
  agGridParams: IServerSideGetRowsParamsExtended,
  claimantDetailsRequest: ClaimantDetailsRequest,
  id: number,
  item: any,
  error: string,
  actionBar: ActionHandlersMap,
  isLoadedClaimantOverview: boolean;
  claimantDashboardOverviewItems: ClaimantDashboardOverviewItem[],
  claimantDashboardOverviewData: ClaimantOverview,
  claimantDashboardOverviewAdditionalInfo: HashTable<KeyValue[]>,
  claimantSummary: ClaimantSummary,
  claimantCounts: ClaimantCounts,
  organizationAccess: OrganizationEntityAccess[],
  services: LienService[],
  projects: ProjectClaimantRequest[],
  clientWorkflow: ClientWorkflow,
  headerElements: ContextBarElement[],
  showSpecialDesignationsBar: boolean,
  productDetails: {
    isLoaded: boolean,
    items: HashTable<ClaimantProductDetails>
  },
  dataSource: {
    isLoaded: boolean,
    items: HashTable<DataSource>,
  },
  ledgerInfo: LedgerInfo,
  netAllocationDetails: NetAllocationDetails,
  formulaModes: IdValue[];
  chartOfAccounts: ChartOfAccount[];
  formulaSet: FormulaSets;
  qsfTypes: IdValue[];
  holdTypes: HoldType[];
  historyItems: ClientPaymentHoldHistory[];
  clientPaymentHold: ClientPaymentHold;
  docId: number;
  isExpanded: boolean,
  identifiers: ClaimantIdentifier[];
  electionForm: ClaimantElection,
  ledgerStages: IdValue[],
  ledgerStagesWithClaimantCount: LedgerStageWithClaimantCount[],
  ledgerSummaryGrid: LedgerSummary[],
  electionFormList: ClaimantElection[];
  electionFormGridParams: IServerSideGetRowsParamsExtended;
  ledgerEntryInfo: LedgerEntryInfo;
  payeeItems: PayeeItem[];
  ledgerVariances: LedgerVariance[];
  paymentInstructions: IPaymentInstructionsState,
  closingStatementsSettingsData: {
    closingStatementTemplates: SelectOption[],
    electronicDeliveryProviders: IdValue[],
    addressesByEntity: IDictionary<string, EntityAddress[]>,
    emailsByEntity: IDictionary<string, Email[]>,
  },
  availableDisbursementGroupsForElectionForm: DisbursementGroup[],
  deficienciesGridParams: IServerSideGetRowsParamsExtended,
  ledgerOverview: LedgerOverview[];
  ledgerOverviewTotal: LedgerOverviewTotal,
  ledgerOverviewGridParams: IServerSideGetRowsParamsExtended;
  orgAccessOrganizations: IdValue[];
  probateDetailsItem: ProbateDetails;
  probateServiceTypes: IdValue[],
  probateStages: IdValue[],
  archerUsers: IdValue[],
  inactiveReasons: IdValue[],
  probateDisbursementGroups: SelectOption[],
  archerId: number,
  probateAssignUser: User,
  projectMessages: ProjectMessage[],
  isProjectMessagesModalOpen: boolean,
  paymentTrackingGridParams: IServerSideGetRowsParamsExtended,
  paymentTrackingTotalCount: number,
  isFullPinLoaded: boolean,
  fullClaimantPin: string;
  designatedNotes: string;
  probateOverviewItems: ClaimantOverviewProbate[];
  bankruptcyOverviewItems: ClaimantOverviewBankruptcy[];
  // digitalProviderStatus: DigitalProviderStatus;
  ledgerEntryValidationData: LedgerEntryValidationData;
  releaseItem: ClaimantOverviewReleaseAdmin;
  uncuredDeficienciesCount: number;
  claimantDeficiencies: ClaimantDeficiency[];
  pendingDeficiencies: IDeficiencyResolutionWithFiles[];
}

const initialState: ClaimantDetailsState = {
  showInfoBar: true,
  agGridParams: null,
  claimantDetailsRequest: null,
  id: null,
  item: null,
  error: null,
  actionBar: null,
  isLoadedClaimantOverview: false,
  claimantDashboardOverviewItems: null,
  claimantDashboardOverviewData: null,
  claimantDashboardOverviewAdditionalInfo: {},
  claimantSummary: null,
  claimantCounts: null,
  organizationAccess: null,
  services: null,
  projects: null,
  clientWorkflow: null,
  headerElements: null,
  showSpecialDesignationsBar: true,
  productDetails: {
    isLoaded: false,
    items: null,
  },
  dataSource: {
    isLoaded: false,
    items: null,
  },
  docId: null,
  ledgerInfo: null,
  netAllocationDetails: null,
  formulaModes: null,
  chartOfAccounts: null,
  formulaSet: null,
  qsfTypes: null,
  holdTypes: null,
  historyItems: null,
  clientPaymentHold: null,
  isExpanded: null,
  identifiers: [],
  electionForm: null,
  ledgerStages: null,
  ledgerStagesWithClaimantCount: [],
  ledgerSummaryGrid: null,
  electionFormList: null,
  electionFormGridParams: null,
  ledgerEntryInfo: null,
  ledgerVariances: null,
  paymentInstructions: {
    items: null,
    percentageIsValid: null,
    defaultPaymentInstructionIsValid: null,
    amountIsValid: null,
    emailIsValid: null,
    isFilled: null,
    amount: null,
    payees: null,
    paymentType: null,
    decimalsCount: null,
  },
  payeeItems: null,
  closingStatementsSettingsData: {
    closingStatementTemplates: null,
    electronicDeliveryProviders: null,
    addressesByEntity: new Dictionary<string, EntityAddress[]>(),
    emailsByEntity: new Dictionary<string, Email[]>(),
  },
  availableDisbursementGroupsForElectionForm: [],
  ledgerOverview: null,
  ledgerOverviewTotal: null,
  ledgerOverviewGridParams: null,
  orgAccessOrganizations: [],
  deficienciesGridParams: null,
  probateDetailsItem: null,
  probateServiceTypes: null,
  probateStages: null,
  archerUsers: null,
  probateDisbursementGroups: null,
  archerId: null,
  probateAssignUser: null,
  inactiveReasons: [],
  projectMessages: null,
  isProjectMessagesModalOpen: false,
  paymentTrackingGridParams: null,
  paymentTrackingTotalCount: null,
  isFullPinLoaded: false,
  fullClaimantPin: null,
  designatedNotes: null,
  probateOverviewItems: null,
  // digitalProviderStatus: null,
  ledgerEntryValidationData: null,
  bankruptcyOverviewItems: null,
  releaseItem: null,
  uncuredDeficienciesCount: null,
  claimantDeficiencies: null,
  pendingDeficiencies: [],
};

export interface IPaymentInstructionsState {
  items: PaymentInstruction[];
  percentageIsValid: boolean;
  amountIsValid: boolean;
  emailIsValid: boolean;
  defaultPaymentInstructionIsValid: boolean,
  isFilled: boolean;
  amount: number;
  payees: ClaimSettlementLedgerPayee[];
  paymentType: PaymentTypeEnum;
  decimalsCount: number;
}

// main reducer function
export const claimantsReducer = createReducer(
  initialState,
  on(claimantActions.ShowInfoBar, (state, { show }) => ({ ...state, showInfoBar: show })),
  on(claimantActions.GetClaimantRequest, (state, { id }) => ({
    ...state,
    id,
    item: null,
    headerElements: [],
    clientWorkflow: null,
    projects: null,
    qsfAdminStatus: null,
    services: null,
    clientPaymentHold: null,
  })),
  on(claimantActions.GetClaimantSuccess, (state, { data }) => ({
    ...state,
    item: { ...data },
  })),
  on(claimantActions.Error, (state, { error }) => ({ ...state, error })),
  on(claimantActions.UpdateClaimantsActionBar, (state, { actionBar }) => ({ ...state, actionBar: { ...actionBar } })),
  on(claimantActions.GetClaimantIdSummarySuccess, (state, { result }) => ({ ...state, claimantSummary: result, fullClaimantPin: result.pin, designatedNotes: result.designatedNotes })),
  on(claimantActions.GetOrganizationAccessRequest, state => ({ ...state, organizationAccess: null })),
  on(claimantActions.GetOrganizationAccessCompleted, (state, { items, agGridParams }) => ({ ...state, organizationAccess: items, agGridParams, error: null })),

  on(claimantActions.SetClaimantDetailsRequest, (state, { claimantDetailsRequest }) => ({
    ...state,
    claimantDetailsRequest,
    services: null,
    qsfAdminStatus: null,
    claimantSummary: null,
  })),

  on(claimantActions.ModalError, (state, { error }) => ({
    ...state,
    errorMessage: error,
  })),

  // Current Formula Set
  on(claimantActions.GetFormulaSet, state => ({ ...state, formulaSet: null })),
  on(claimantActions.GetFromulaSetSuccess, (state, { formulaSet }) => ({ ...state, formulaSet })),
  on(claimantActions.GetFormulaSetByProject, state => ({ ...state, formulaSet: null })),
  on(claimantActions.GetFromulaSetByProjectSuccess, (state, { formulaSet }) => ({ ...state, formulaSet })),

  // QSF Types
  on(claimantActions.GetQSFTypes, state => ({ ...state, qsfTypes: null })),
  on(claimantActions.GetQSFTypesSuccess, (state, { qsfTypes }) => ({ ...state, qsfTypes })),

  // Hold Types
  on(claimantActions.GetHoldTypes, state => ({ ...state, holdTypes: null, reasons: null })),
  on(claimantActions.GetHoldTypesSuccess, (state, { holdTypes }) => ({ ...state, holdTypes })),

  // Services
  on(claimantActions.GetClaimantServices, state => ({ ...state, services: null })),
  on(claimantActions.GetClaimantServicesSuccess, (state, { services }) => ({ ...state, services, error: null })),

  // Projects
  on(claimantActions.GetPersonProjects, state => ({ ...state, projects: null })),
  on(claimantActions.GetPersonProjectsSuccess, (state, { projects }) => ({ ...state, projects, error: null })),

  // Lien products
  on(claimantActions.GetClaimantDashboardOverview, state => ({ ...state, claimantDashboardOverviewItems: null, claimantDashboardOverviewData: null, isLoadedClaimantOverview: false })),
  on(claimantActions.GetClaimantDashboardOverviewSuccess, (state, { dashboard }) => ({ ...state, claimantDashboardOverviewData: dashboard, error: null, isLoadedClaimantOverview: true })),
  on(claimantActions.GetUncuredDeficienciesCountComplete, (state, { uncuredDeficienciesCount }) => ({ ...state, uncuredDeficienciesCount: uncuredDeficienciesCount })),

  on(claimantActions.GetClaimantOverviewProbateItems, state => ({ ...state, probateOverviewItems: null })),
  on(claimantActions.GetClaimantOverviewProbateItemsSuccess, (state, { probateItems }) => ({ ...state, probateOverviewItems: probateItems })),

  // Bankruptcy Overview
  on(claimantActions.GetClaimantOverviewBankruptcyItems, state => ({ ...state, bankruptcyOverviewItems: null })),
  on(claimantActions.GetClaimantOverviewBankruptcyItemsSuccess, (state, { bankruptcyItems }) => ({ ...state, bankruptcyOverviewItems: bankruptcyItems })),

  // Release Overview
  on(claimantActions.GetClaimantOverviewRelease, state => ({ ...state, bankruptcyOverviewItems: null })),
  on(claimantActions.GetClaimantOverviewReleaseSuccess, (state, { release }) => ({ ...state, releaseItem: release })),

  // Ledger
  on(claimantActions.GetLedgerInfo, state => ({ ...state, ledgerInfo: null })),
  on(claimantActions.GetLedgerInfoSuccess, (state, { ledgerInfo }) => ({ ...state, ledgerInfo, error: null })),
  on(claimantActions.UpdateLedgerInfoSuccess, (state, { ledgerInfo }) => ({ ...state, ledgerInfo, error: null })),

  on(claimantActions.GetNetAllocationDetails, state => ({ ...state, netAllocationDetails: null })),
  on(claimantActions.GetNetAllocationDetailsSuccess, (state, { netAllocationDetails }) => ({ ...state, netAllocationDetails, error: null })),

  on(claimantActions.GetLedgerChartOfAccountsSuccess, (state, { chartOfAccounts }) => ({ ...state, chartOfAccounts })),

  on(claimantActions.GetLedgerStagesSuccess, (state, { ledgerStages }) => ({ ...state, ledgerStages })),
  on(claimantActions.GetLedgerStagesWithClaimantCountSuccess, (state, { ledgerStagesWithClaimantCount }) => ({ ...state, ledgerStagesWithClaimantCount })),
  on(claimantActions.GetLedgerSummaryGridSuccess, (state, { ledgerSummaryList }) => ({ ...state, ledgerSummaryGrid: ledgerSummaryList })),

  on(claimantActions.GetLedgerEntryValidationDataSuccess, (state, { ledgerEntryValidationData }) => ({ ...state, ledgerEntryValidationData })),

  on(claimantActions.GetLedgerEntryInfoSuccess, (state, { ledgerEntryInfo }) => ({ ...state, ledgerEntryInfo, error: null })),
  on(claimantActions.ClearLedgerEntryInfo, state => ({
    ...state,
    ledgerEntryInfo: null,
    paymentInstructions: {
      items: null,
      percentageIsValid: null,
      defaultPaymentInstructionIsValid: null,
      amountIsValid: null,
      emailIsValid: null,
      isFilled: null,
      amount: null,
      payees: null,
      paymentType: null,
      bankAccountsByEntity: null,
      addressesByEntity: null,
      decimalsCount: null,
    },
    paymentTrackingTotalCount: null,
  })),

  on(claimantActions.GetLedgerFormulaModesSuccess, (state, { formulaModes }) => ({ ...state, formulaModes })),

  on(claimantActions.DeleteLedgerRequest, (state, { }) => ({ ...state, error: null })),
  on(claimantActions.DeleteLedgerRequestSuccess, (state, { }) => ({ ...state, error: null })),
  on(claimantActions.DeleteLedgerRequestError, (state, { requestError }) => ({ ...state, error: requestError })),

  // Additional info for tooltips
  on(claimantActions.GetClaimantDashboardOverviewAdditionalInfo, (state, { productCategoryId }) => ({
    ...state,
    claimantDashboardOverviewAdditionalInfo: {
      ...state.claimantDashboardOverviewAdditionalInfo,
      [productCategoryId]: null,
    },
  })),

  on(claimantActions.GetClaimantDashboardOverviewAdditionalInfoSuccess, (state, { productCategoryId, items }) => ({
    ...state,
    claimantDashboardOverviewAdditionalInfo: {
      ...state.claimantDashboardOverviewAdditionalInfo,
      [productCategoryId]: items,
    },
    error: null,
  })),

  on(claimantActions.ResetClaimantDashboardOverviewAdditionalInfo, state => ({ ...state, claimantDashboardOverviewAdditionalInfo: {} })),

  // probate
  on(claimantActions.GetProductDetails, (state, { productCategory }) => ({
    ...state,
    productDetails: {
      ...state.productDetails,
      isLoaded: false,
      items: {
        ...items,
        [productCategory]: null,
      },
    },
  })),
  on(claimantActions.GetProductDetailsSuccess, (state, { data, productCategory }) => ({
    ...state,
    productDetails: {
      ...state.productDetails,
      isLoaded: true,
      items: {
        ...items,
        [productCategory]: data,
      },
    },
    error: null,
  })),

  // Claimant Counts
  on(claimantActions.GetClaimantCounts, state => ({ ...state, claimantCounts: null })),
  on(claimantActions.GetClaimantCountsSuccess, (state, { claimantCounts }) => ({ ...state, claimantCounts })),

  // Claimant Workflow
  on(claimantActions.GetClaimantWorkflow, state => ({ ...state, clientWorkflow: null })),
  on(claimantActions.GetClaimantWorkflowSuccess, (state, { clientWorkflow }) => ({ ...state, clientWorkflow, error: null })),

  // Header
  on(claimantActions.UpdateHeader, (state, { headerElements }) => ({ ...state, headerElements })),

  // SpecialDesignationsBar
  on(claimantActions.ToggleSpecialDesignationsBar, (state, { showSpecialDesignationsBar }) => ({ ...state, showSpecialDesignationsBar })),

  // data source
  on(claimantActions.GetDataSource, state => ({
    ...state,
    dataSource: {
      ...state.dataSource,
      isLoaded: false,
      items: null,
    },
  })),
  on(
    claimantActions.GetDataSourceSuccess,
    (state, { dataSource, productCategory }) => ({
      ...state,
      dataSource: {
        ...state.dataSource,
        isLoaded: true,
        items: {
          ...items,
          [productCategory]: dataSource,
        },
      },
    }),
  ),

  on(claimantActions.GenerateDocumentsComplete, (state, { data }) => ({ ...state, docId: data.id })),
  on(claimantActions.ToggleClaimantSummaryBar, (state, { isExpanded }) => ({ ...state, isExpanded })),
  on(claimantActions.GetClaimantIdentifiersSuccess, (state, { items }) => {
    const clientIdRow = {
      createdDate: state.item?.createdDate,
      dataSource: 'LPM',
      entityId: state.item?.id,
      entityType: 'Claimants',
      externalIdentifierType: { id: 0, name: 'Client ID', description: '' },
      identifier: state.item?.id,
      organization: { name: 'ARCHER' },
    } as ClaimantIdentifier;

    const newItems = [clientIdRow, ...items];

    return { ...state, identifiers: newItems, error: null };
  }),

  on(claimantActions.GetElectionForm, state => ({ ...state, electionForm: null })),
  on(claimantActions.GetElectionFormSuccess, (state, { electionForm }) => ({ ...state, electionForm, error: null })),
  on(claimantActions.CreateOrUpdateElectionFormSuccess, (state, { electionForm }) => ({ ...state, electionForm, error: null })),
  on(claimantActions.GetElectionFormListSuccess, (state, { electionFormList }) => ({ ...state, electionFormList })),
  on(claimantActions.GetElectionFormList, (state, { agGridParams }) => ({ ...state, electionFormGridParams: agGridParams })),
  on(claimantActions.ClearElectionForm, state => ({ ...state, electionForm: null, availableDisbursementGroupsForElectionForm: [] })),
  on(claimantActions.GetLedgerVariancesSuccess, (state, { ledgerVariances }) => ({ ...state, error: null, ledgerVariances })),
  on(claimantActions.ClearLedgerVariances, state => ({ ...state, ledgerVariances: null })),

  on(claimantActions.InitializePaymentInstructions, (state, { paymentType, ledgerEntry, decimalsCount }) => initializePaymentInstructionReducer(state, paymentType, ledgerEntry, decimalsCount)),
  on(claimantActions.DeletePaymentInstruction, (state, { id, paymentType }) => deletePaymentInstructionReducer(state, id, paymentType)),
  on(claimantActions.DeletePaymentInstructions, state => ({ ...state, ledgerEntryInfo: { ...state.ledgerEntryInfo, enabled: false, paymentInstructions: [], splitTypeId: null } })),
  on(claimantActions.UpdatePaymentInstruction, (state, { paymentInstruction }) => updatePaymentInstructionReducer(state, paymentInstruction)),
  on(claimantActions.UpdatePaymentType, (state, { paymentType }) => ({
    ...state,
    paymentInstructions: {
      ...state.paymentInstructions,
      paymentType,
      amountIsValid: true,
      percentageIsValid: true,
      emailIsValid: true,
      isFilled: false,
      defaultPaymentInstructionIsValid: true,
      items: [new PaymentInstruction(state.ledgerInfo?.id, paymentType === PaymentTypeEnum.Individual ? state.ledgerEntryInfo?.amount : null)],
    },
  })),
  on(claimantActions.AddPaymentInstruction, state => ({
    ...state,
    error: null,
    paymentInstructions: addPaymentInstructionReducer(state),
  })),
  on(claimantActions.GetDefaultPayeesForLedgerEntrySuccess, (state, { payees }) => ({
    ...state,
    error: null,
    paymentInstructions: defaultPaymentInstructionsReducer(state, payees),
  })),
  on(claimantActions.GetPayeesForLedgerEntrySuccess, (state, { payees }) => ({
    ...state,
    error: null,
    paymentInstructions: {
      ...state.paymentInstructions,
      payees,
    },
  })),
  on(claimantActions.GetPaymentsByLedgerEntryId, (state: ClaimantDetailsState, { gridParams }) => ({ ...state, paymentTrackingGridParams: gridParams })),
  on(claimantActions.GetPaymentsByLedgerEntryIdSuccess, (state: ClaimantDetailsState, { totalCount }) => ({ ...state, paymentTrackingTotalCount: totalCount })),

  // Claimant Closing Statements Settings
  on(claimantActions.GetClosingStatementSettingsListSuccess, (state, { payeeItems }) => ({ ...state, error: null, payeeItems })),
  on(claimantActions.UpdateClosingStatementSettingsSuccess, (state, { payeeItems }) => ({ ...state, error: null, payeeItems })),
  on(claimantActions.ResetClosingStatementSettingsList, state => ({
    ...state,
    error: null,
    payeeItems: null,
    closingStatementsSettingsData: {
      closingStatementTemplates: null,
      electronicDeliveryProviders: null,
      addressesByEntity: new Dictionary<string, EntityAddress[]>(),
      emailsByEntity: new Dictionary<string, Email[]>(),
    },
  })),
  on(claimantActions.GetClosingStatementSettingsDataSuccess, (state, { electronicDeliveryProviders, closingStatementTemplates }) => ({
    ...state,
    error: null,
    closingStatementsSettingsData: {
      ...state.closingStatementsSettingsData,
      electronicDeliveryProviders,
      closingStatementTemplates: closingStatementTemplates?.map(item => SelectHelper.toGroupedOption(item, item?.isGlobal ? SelectGroupsEnum.GlobalTemplates : SelectGroupsEnum.ProjectSpecificTemplates)),
    },
  })),
  on(claimantActions.GetClosingStatementSettingsAddressesSuccess, (state, { data }) => ({
    ...state,
    closingStatementsSettingsData: {
      ...state.closingStatementsSettingsData,
      addressesByEntity: getBulkAddressesReducer(state.closingStatementsSettingsData, data),
    },
  })),
  on(claimantActions.GetClosingStatementSettingsEmailsSuccess, (state, { data }) => ({
    ...state,
    closingStatementsSettingsData: {
      ...state.closingStatementsSettingsData,
      emailsByEntity: getBulkEmailsReducer(state.closingStatementsSettingsData, data),
    },
  })),
  on(claimantActions.SetClosingStatementSettings, (state, { payeeItems }) => ({ ...state, payeeItems })),
  on(claimantActions.GetAvailableDisbursementGroupsForElectionFormSuccess, (state, { disbursementGroups }) => ({ ...state, availableDisbursementGroupsForElectionForm: disbursementGroups })),
  on(claimantActions.GetLedgerOverviewListSuccess, (state, { ledgerOverview }) => ({ ...state, ledgerOverview })),
  on(claimantActions.GetLedgerOverviewList, (state, { agGridParams }) => ({ ...state, ledgerOverviewGridParams: agGridParams })),
  on(claimantActions.GetLedgerOverviewTotalSuccess, (state, { ledgerOverviewTotal }) => ({ ...state, ledgerOverviewTotal })),
  on(claimantActions.GetDeficienciesList, (state, { params }) => ({ ...state, deficienciesGridParams: params })),

  // Set Claimant On Hold
  on(claimantActions.PutOrUpdateClaimantHoldSuccess, (state, { clientPaymentHold }) => ({ ...state, clientPaymentHold })),
  on(claimantActions.RemoveClaimantFromHoldSuccess, state => ({ ...state, clientPaymentHold: null })),
  on(claimantActions.HoldPaymentHistoryRequestSuccess, (state, { historyItems, gridParams }) => ({ ...state, pending: false, historyItems, projectGridParams: gridParams })),

  // Probate
  on(claimantActions.GetProbateDetailsByClientId, state => ({ ...state, error: null, probateDetailsItem: null, probateAssignUser: null })),
  on(claimantActions.GetProbateDetailsByClientIdSuccess, (state, { probateDetailsItem }) => ({ ...state, probateDetailsItem })),
  on(claimantActions.CreateOrUpdateProbateDetailsSuccess, (state, { probateDetailsItem }) => ({ ...state, probateDetailsItem })),
  on(claimantActions.UpdateProbatePacketRequestsSuccess, (state, { packetRequests }) => ({ ...state, probateDetailsItem: { ...state.probateDetailsItem, packetRequests } })),
  on(claimantActions.GetProductTypesListSuccess, (state, { types }) => ({ ...state, probateServiceTypes: types })),
  on(claimantActions.GetProbateStagesSuccess, (state, { probateStages }) => ({ ...state, probateStages })),
  on(claimantActions.GetArcherOrgIdSuccess, (state, { archerId }) => ({ ...state, archerId })),
  on(claimantActions.GetUserRequestSuccess, (state, { user }) => ({ ...state, probateAssignUser: user })),
  on(claimantActions.GetDisbursementGroupsListSuccess, (state, { disbursementGroupList }) => ({ ...state, probateDisbursementGroups: disbursementGroupList })),
  on(claimantActions.GetInactiveReasonsSuccess, (state, { inactiveReasons }) => ({ ...state, inactiveReasons })),

  // Project Messaging
  on(claimantActions.GetProjectMessagesByClientIdSuccess, (state, { projectMessages }) => ({ ...state, projectMessages })),
  on(claimantActions.SetProjectMessagesModalStatus, (state, { isOpen }) => ({ ...state, isProjectMessagesModalOpen: isOpen })),

  on(claimantActions.GetClientFullPinComplete, (state, { fullPin }) => ({ ...state, fullClaimantPin: fullPin, isFullPinLoaded: true })),
  on(claimantActions.ResetClientFullPin, state => ({ ...state, isFullPinLoaded: false })),

  on(claimantActions.GetClaimantDeficienciesListSuccess, (state, { deficiencies }) => ({ ...state, claimantDeficiencies: deficiencies })),
  on(claimantActions.GetPendingDeficiencyResolutionsSuccess, (state, { pendingDeficiencies }) => ({ ...state, pendingDeficiencies: pendingDeficiencies })),
);

function getBulkAddressesReducer(state: any, data: AddressesListResponse[]): IDictionary<string, EntityAddress[]> {
  const newAddresses: IDictionary<string, EntityAddress[]> = new Dictionary(state.addressesByEntity.items());
  data.forEach(item => {
    newAddresses.setValue(Address.getAddressId(item.entityPair.entityTypeId, item.entityPair.entityId), item.addresses.map(address => EntityAddress.toModel(address)));
  });
  return newAddresses;
}

function getBulkEmailsReducer(state: any, data: EmailsListResponse[]): IDictionary<string, Email[]> {
  const newEmails: IDictionary<string, Email[]> = new Dictionary(state.emailsByEntity.items());
  data.forEach(item => {
    newEmails.setValue(Email.getEmailId(item.entityPair.entityTypeId, item.entityPair.entityId), item.emails);
  });
  return newEmails;
}

function deletePaymentInstructionReducer(state: ClaimantDetailsState, id: number, paymentType: PaymentTypeEnum): ClaimantDetailsState {
  if (isPaymentInstructionsStateEmpty(state.paymentInstructions)) {
    return state;
  }

  const newState = { ...state, error: null, paymentInstructions: { ...state.paymentInstructions } };
  const paymentInstructionIndex = newState.paymentInstructions.items.findIndex(pi => pi.id === id);

  if (paymentInstructionIndex >= 0) {
    if (paymentType === PaymentTypeEnum.Individual && newState.paymentInstructions.items.length === 1) {
      newState.paymentInstructions.items[paymentInstructionIndex] = new PaymentInstruction(newState.ledgerInfo.id);
    } else {
      newState.paymentInstructions.items = ArrayHelper.removeAtIndex(newState.paymentInstructions.items, paymentInstructionIndex);
    }
  }

  newState.paymentInstructions = validatePaymentInstructions(newState.paymentInstructions);
  return newState;
}

function addPaymentInstructionReducer(state: ClaimantDetailsState): IPaymentInstructionsState {
  let newState = { ...state.paymentInstructions };
  newState.items.push(new PaymentInstruction(state.ledgerInfo.id));
  newState = validatePaymentInstructions(newState);
  return newState;
}

function defaultPaymentInstructionsReducer(state: ClaimantDetailsState, payees: ClaimSettlementLedgerPayee | ClaimSettlementLedgerPayee[]): IPaymentInstructionsState {
  let newState = { ...state.paymentInstructions, items: [], defaultPaymentInstructionIsValid: !!payees };
  if (!payees) {
    return newState;
  }
  const newPayees = Array.isArray(payees) ? payees : [payees];
  newPayees.forEach(payee => {
    const instruction = new PaymentInstruction(state.ledgerInfo?.id);
    instruction.payeeEntityId = payee.id;
    instruction.payeeEntityTypeId = payee.entityType;
    instruction.paymentMethodId = payee.defaultPaymentMethodId;
    instruction.payeeAddressId = payee.primaryAddressId;
    instruction.payeeEmailId = payee.primaryEmailId;
    instruction.payeeBankAccountId = payee.primaryBankAccountId;
    instruction.payeeBankAccountName = payee.bankAccountName;
    instruction.payeeBankAccountNumber = payee.bankAccountNumber;
    instruction.percentage = 1;
    instruction.amount = state.paymentInstructions.amount;
    instruction.statusName = payee.statusName;
    instruction.statusId = payee.statusId;
    instruction.furtherCreditAccount = payee.furtherCreditAccount;
    instruction.qsfOrgId = payee.qsfOrgId;
    instruction.qsfBankAccountId = payee.qsfBankAccountId;
    instruction.transferToSubAccount = payee.transferToSubAccount ?? !!payee.qsfOrgId;
    instruction.transferFFC = payee.transferFFC;
    newState.items.push(instruction);
  });
  newState.payees = newPayees;
  newState = validatePaymentInstructions(newState);
  return newState;
}

function updatePaymentInstructionReducer(state: ClaimantDetailsState, paymentInstruction: Partial<PaymentInstruction>): ClaimantDetailsState {
  if (isPaymentInstructionsStateEmpty(state.paymentInstructions)) {
    return state;
  }
  const newState = { ...state, error: null, paymentInstructions: { ...state.paymentInstructions } };
  const paymentInstructionIndex = newState.paymentInstructions.items.findIndex(pi => pi.id === paymentInstruction.id);
  if (paymentInstructionIndex >= 0) {
    newState.paymentInstructions.items[paymentInstructionIndex] = { ...newState.paymentInstructions.items[paymentInstructionIndex], ...paymentInstruction };
    const payeeStatus = newState.paymentInstructions?.payees?.find(item => item.id === paymentInstruction.payeeEntityId)?.deleted;
    newState.paymentInstructions.items[paymentInstructionIndex].payeeNotExist = payeeStatus;
  }

  newState.paymentInstructions = validatePaymentInstructions(newState.paymentInstructions);
  return newState;
}

function initializePaymentInstructionReducer(
  state: ClaimantDetailsState,
  paymentType: PaymentTypeEnum,
  ledgerEntry: LedgerEntryInfo,
  decimalsCount: number,
): ClaimantDetailsState {
  const paymentInstructions: PaymentInstruction[] = ledgerEntry.paymentInstructions && ledgerEntry.paymentInstructions.length
    ? [...ledgerEntry.paymentInstructions]
    : [new PaymentInstruction(ledgerEntry.id)];

  const newState = {
    ...state,
    error: null,
    paymentInstructions: {
      percentageIsValid: true,
      amountIsValid: true,
      emailIsValid: true,
      defaultPaymentInstructionIsValid: true,
      isFilled: true,
      amount: ledgerEntry.amount,
      items: paymentInstructions,
      payees: null,
      paymentType,
      decimalsCount,
    },
  };

  newState.paymentInstructions = validatePaymentInstructions(newState.paymentInstructions);

  return newState;
}

function validatePaymentInstructions(state: IPaymentInstructionsState): IPaymentInstructionsState {
  if (!state.items || state.items.length === 0) {
    return {
      ...state,
      percentageIsValid: true,
      amountIsValid: true,
      emailIsValid: true,
      defaultPaymentInstructionIsValid: state.paymentType === PaymentTypeEnum.Individual || state.paymentType === PaymentTypeEnum.Split
        ? true
        : state.defaultPaymentInstructionIsValid,
      isFilled: state.items.length > 0 ? PaymentInstructionsValidationHelper.arePaymentsFilled(state.items) : true,
    };
  }

  const validationResult = PaymentInstructionsValidationHelper.validate(state);

  return {
    ...state,
    percentageIsValid: validationResult.isPercentageValid,
    amountIsValid: validationResult.isAmountValid,
    emailIsValid: validationResult.isEmailValid,
    isFilled: validationResult.isFilled,
  };
}

function isPaymentInstructionsStateEmpty(state: IPaymentInstructionsState) {
  return !state || !state.items || state.items.length === 0;
}

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: ClaimantDetailsState | undefined, action: Action) {
  return claimantsReducer(state, action);
}
