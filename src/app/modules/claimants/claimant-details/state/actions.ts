import { createAction, props } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ClaimantSummary } from '@app/models/claimant-summary';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { OrganizationEntityAccess } from '@app/models/organization-entity-access';
import { ClaimantIdentifier } from '@app/models/claimant-identifiers';
import { ProjectClaimantRequest, LienService, KeyValue, ClientWorkflow, IdValue, ClaimantElection, PaymentInstruction, FormulaSets, EntityAddress, User, TransferOrgs } from '@app/models';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { ClaimantProductDetails } from '@app/models/claimant-product-details';
import { ControllerEndpoints, ProductCategory } from '@app/models/enums';
import { DataSource } from '@app/models/dataSource';
import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { Claimant } from '@app/models/claimant';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { LedgerInfo, NetAllocationDetails, ChartOfAccount } from '@app/models/closing-statement';
import { LedgerSummary } from '@app/models/closing-statement/ledger-summary';
import { LedgerEntryInfo } from '@app/models/closing-statement/ledger-entry-info';
import { LedgerVariance } from '@app/models/closing-statement/ledger-variance';
import { PaymentTypeEnum } from '@app/models/enums/payment-type.enum';
import { AddressesListResponse } from '@app/modules/addresses/address-list/state/actions';
import { ClaimSettlementLedgerPayee } from '@app/models/ledger-settings';
import { PayeeItem } from '@app/models/closing-statement/payee-item';
import { EntityPair } from '@app/modules/shared/_interfaces';
import { DisbursementGroup } from '@app/models/disbursement-group';
import { Deficiency } from '@app/models/deficiency';
import { LedgerOverview } from '@app/models/ledger-overview';
import { LedgerOverviewTotal } from '@app/models/ledger-overview-total';
import { EmailsListResponse } from '@app/models/emails-list-response';
import { LedgerStageWithClaimantCount } from '@app/models/ledger-stage-with-claimant-count';
import { HoldType } from '@app/models/hold-type';
import { ClientPaymentHold, IRemovePaymentFromHoldRequest } from '@app/models/client-payment-hold';
import { ClientPaymentHoldHistory } from '@app/models/client-payment-hold-history';
import { VerifiedAddress } from '@app/models/address';
import { ProbateDetails } from '@app/models/probate-details';
import { PacketRequest } from '@app/models/packet-request';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { IPagerPayload } from '@shared/state/common.actions';
import { ClosingStatementTemplatesListItem } from '@app/models/closing-statement/closing-statement-templates-list-item';
import { ProjectMessage } from '@app/models/projects/project-message';
import { ClaimantCounts } from '@app/models/claimant-counts';
import { AuthorizeLedgersEntriesRequest } from '@app/models/ledger/authorize-ledger-entries-request';
import { ClaimantOverviewProbate } from '@app/models/claimant-overview/claimant-overview-probate';
import { LedgerEntryValidationData } from '@app/models/closing-statement/ledger-entry-validation-data';
import { ClaimantOverview } from '../../../../models/claimant-overview/claimant-overview';
import { ClaimantOverviewBankruptcy } from '@app/models/claimant-overview/claimant-overview-bankruptcy';
import { ClaimantOverviewReleaseAdmin } from '@app/models/claimant-overview/claimant-overview-release-admin';
import { ClaimantDeficiency } from '@app/models/claimant-deficiency';
import { IDeficiencyResolution, IDeficiencyResolutionWithFiles } from '@app/models/claimant-deficiency-resolution';
import { IDeficiencyResolutionFile } from '@app/models/claimant-deficiency-resolution-file';

export interface ILedgerSummaryPagerPayload extends IPagerPayload {
  data: LedgerSummary[];
}

const FEATURE_NAME = '[Claimant]';
export const ShowInfoBar = createAction(`${FEATURE_NAME} Show Info Bar`, props<{ show: boolean }>());

export const Error = createAction(`${FEATURE_NAME} Error`, props<{ error: any }>());
export const ModalError = createAction(`${FEATURE_NAME} API Error`, props<{ error: string }>());

export const GotoCommunicationsList = createAction(`${FEATURE_NAME} Go to Communications List`);
export const GoToCommunicationAttachments = createAction(`${FEATURE_NAME} Go To Communication Attachments`, props<{ communicationId: number }>());

export const GetClaimantRequest = createAction(`${FEATURE_NAME} Get Claimant Request`, props<{ id: number }>());
export const GetClaimantSuccess = createAction(`${FEATURE_NAME} Get Claimant Success`, props<{ data: Claimant }>());
export const GetClaimantLoadingStarted = createAction(`${FEATURE_NAME} Get Claimant Loading Started`, props<{ additionalActionNames: string[] }>());

export const UpdateClaimantsActionBar = createAction(`${FEATURE_NAME} Update Claimants Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetClaimantIdSummaryRequest = createAction(`${FEATURE_NAME} Get Claimant Id Summary Request`, props<{ id: number }>());
export const GetClaimantIdSummarySuccess = createAction(`${FEATURE_NAME} Get Claimant Id Summary Success`, props<{ result: ClaimantSummary }>());

export const GetOrganizationAccessRequest = createAction(`${FEATURE_NAME} Get Organization Access Request`, props<{ agGridParams: IServerSideGetRowsParamsExtended, claimantId: number }>());
export const GetOrganizationAccessCompleted = createAction(`${FEATURE_NAME} Get Organization Access Completed`, props<{ items: OrganizationEntityAccess[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const CreateOrganizationAccessRequest = createAction(`${FEATURE_NAME} Create Organization Access Request`, props<{ item: any }>());
export const CreateOrganizationAccessRequestSuccess = createAction(`${FEATURE_NAME} Create Organization Access Request Success`);

export const UpdateOrganizationAccessRequest = createAction(`${FEATURE_NAME} Update Organization Access Request`, props<{ item: any }>());
export const UpdateOrganizationAccessRequestSuccess = createAction(`${FEATURE_NAME} Update Organization Access Request Success`);

export const DeleteOrganizationAccessRequest = createAction(`${FEATURE_NAME} Delete Organization Access Request`, props<{ id: number }>());
export const DeleteOrganizationAccessRequestSuccess = createAction(`${FEATURE_NAME} Delete Organization Access Request Success`);

export const CloseCreateOrganizationAccessModal = createAction(`${FEATURE_NAME} Close Create Organization Access Modal`);

export const RefreshOrganizationAccessRequest = createAction(`${FEATURE_NAME} Refresh Organization Access Request`);

export const SetClaimantDetailsRequest = createAction(`${FEATURE_NAME} Set Claimant Details Request`, props<{ claimantDetailsRequest: ClaimantDetailsRequest }>());

export const GetClaimantTabsCount = createAction(`${FEATURE_NAME} Get Claimant Tabs Count`, props<{ id: number }>());

export const PutOrUpdateClaimantHold = createAction(`${FEATURE_NAME} Put Or Update Claimant Hold`, props<{ clientPaymentHold: ClientPaymentHold }>());
export const PutOrUpdateClaimantHoldSuccess = createAction(`${FEATURE_NAME} Put Or Update Claimant Hold Success`, props<{ clientPaymentHold: ClientPaymentHold }>());

export const RemoveClaimantFromHold = createAction(`${FEATURE_NAME} Remove Claimant From Hold`, props<{ removeFromHoldData: IRemovePaymentFromHoldRequest }>());
export const RemoveClaimantFromHoldSuccess = createAction(`${FEATURE_NAME} Remove Claimant From Hold Success`);

export const HoldPaymentHistoryRequest = createAction(`${FEATURE_NAME} Hold Payment History Request`, props<{ gridParams: IServerSideGetRowsParamsExtended, clientId: number }>());
export const HoldPaymentHistoryRequestSuccess = createAction(`${FEATURE_NAME} Hold Payment History Request Success`, props<{ historyItems: ClientPaymentHoldHistory[], gridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const DeleteLedgerRequest = createAction(`${FEATURE_NAME} Delete Ledger Request`, props<{ clientId: number, disbursementGroupId: number, preview: boolean }>());
export const DeleteLedgerRequestPreview = createAction(`${FEATURE_NAME} Delete Ledger Request Preview`, props<{ clientId: number, disbursementGroupId: number, preview: boolean }>());
export const DeleteLedgerRequestPreviewSuccess = createAction(`${FEATURE_NAME} Delete Ledger Request Preview Success`);
export const DeleteLedgerRequestSuccess = createAction(`${FEATURE_NAME} Delete Ledger Request Success`);
export const DeleteLedgerRequestError = createAction(`${FEATURE_NAME} Delete Ledger Request Error`, props<{ requestError: string }>());

// Services
export const GetClaimantServices = createAction(`${FEATURE_NAME} Get Claimant Services`, props<{ clientId: number }>());
export const GetClaimantServicesSuccess = createAction(`${FEATURE_NAME} Get Claimant Services Success`, props<{ services: LienService[] }>());

// Projects
export const GetPersonProjects = createAction(`${FEATURE_NAME} Get Person Projects`, props<{ personId: number }>());
export const GetPersonProjectsSuccess = createAction(`${FEATURE_NAME} Get Person Projects Success`, props<{ projects: ProjectClaimantRequest[] }>());

export const GetClaimantDashboardOverview = createAction(`${FEATURE_NAME} Get Claimant Dashboard Overview`, props<{ claimantId: number }>());
export const GetClaimantDashboardOverviewSuccess = createAction(`${FEATURE_NAME} Get Claimant Dashboard Overview Success`, props<{ dashboard: ClaimantOverview }>());

export const GetClaimantOverviewProbateItems = createAction(`${FEATURE_NAME} Get Claimant Overview Probate Items`, props<{ claimantId: number }>());
export const GetClaimantOverviewProbateItemsSuccess = createAction(`${FEATURE_NAME} Get Claimant Overview Probate Items Success`, props<{ probateItems: ClaimantOverviewProbate[] }>());

export const GetClaimantOverviewBankruptcyItems = createAction(`${FEATURE_NAME} Get Claimant Bankruptcy Overview`, props<{ claimantId: number }>());
export const GetClaimantOverviewBankruptcyItemsSuccess = createAction(`${FEATURE_NAME} Get Claimant Bankruptcy Overview Success`, props<{ bankruptcyItems: ClaimantOverviewBankruptcy[] }>());

export const GetClaimantOverviewRelease = createAction(`${FEATURE_NAME} Get Claimant Release Overview`, props<{ claimantId: number }>());
export const GetClaimantOverviewReleaseSuccess = createAction(`${FEATURE_NAME} Get Claimant Release Overview Success`, props<{ release: ClaimantOverviewReleaseAdmin }>());

// Product Workflow
export const GetProductDetails = createAction(`${FEATURE_NAME} Get Product Details`, props<{ productCategory: ProductCategory }>());
export const GetProductDetailsSuccess = createAction(`${FEATURE_NAME} Get Claimant Product Details Success`, props<{ data: ClaimantProductDetails, productCategory: ProductCategory }>());
export const GetClaimantDashboardOverviewAdditionalInfo = createAction(`${FEATURE_NAME} Get Claimant Dashboard Overview Additional Info`, props<{ productCategoryId: number, productCategoryTypeId: number }>());
export const GetClaimantDashboardOverviewAdditionalInfoSuccess = createAction(`${FEATURE_NAME} Get Claimant Dashboard Overview Additional Info Success`, props<{ productCategoryId: number, items: KeyValue[] }>());
export const ResetClaimantDashboardOverviewAdditionalInfo = createAction(`${FEATURE_NAME} Reset Claimant Dashboard Overview Additional Info`);

// Claimant Counts
export const GetClaimantCounts = createAction(`${FEATURE_NAME} Get Claimant Counts`, props<{ clientId: number }>());
export const GetClaimantCountsSuccess = createAction(`${FEATURE_NAME} Get Claimant Counts Success`, props<{ claimantCounts: ClaimantCounts }>());

// Claimant Workflow
export const GetClaimantWorkflow = createAction(`${FEATURE_NAME} Get Claimant Workflow`, props<{ productCategoryId: number, claimantId: number }>());
export const GetClaimantWorkflowSuccess = createAction(`${FEATURE_NAME} Get Claimant Workflow Success`, props<{ clientWorkflow: ClientWorkflow }>());

// Header
export const UpdateHeader = createAction(`${FEATURE_NAME} Update Header`, props<{ headerElements: ContextBarElement[] }>());

// SpecialDesignationsBar

export const ToggleSpecialDesignationsBar = createAction(`${FEATURE_NAME} Toggle Special Designations Bar`, props<{ showSpecialDesignationsBar: boolean }>());

// Claimant Identifier
export const GetClaimantIdentifiersRequest = createAction(`${FEATURE_NAME} Get Claimant Identifiers Request`, props<{ entityId: number, entityTypeId: number }>());
export const GetClaimantIdentifiersSuccess = createAction(`${FEATURE_NAME} Get Claimant Identifiers Success`, props<{ items: ClaimantIdentifier[] }>());

// Data source
export const GetDataSource = createAction(`${FEATURE_NAME} Get Data Source`, props<{ productCategory: ProductCategory }>());
export const GetDataSourceSuccess = createAction(`${FEATURE_NAME} Get Data Source Success`, props<{ dataSource: DataSource, productCategory: ProductCategory }>());

// Ledger
export const GetLedgerInfo = createAction(`${FEATURE_NAME} Get Ledger Info`, props<{ clientId: number, ledgerId: number }>());
export const GetLedgerInfoSuccess = createAction(`${FEATURE_NAME} Get Ledger Info Success`, props<{ ledgerInfo: LedgerInfo }>());
export const RefreshLedgerInfo = createAction(`${FEATURE_NAME} Refresh Ledger Info`, props<{ ledgerId: number }>());

export const GetNetAllocationDetails = createAction(`${FEATURE_NAME} Get Net Allocation Details`, props<{ clientId: number, ledgerInfo: LedgerInfo }>());
export const GetNetAllocationDetailsSuccess = createAction(`${FEATURE_NAME} Get Net Allocation Details Success`, props<{ netAllocationDetails: NetAllocationDetails }>());

export const UpdateLedgerInfo = createAction(`${FEATURE_NAME} Update Ledger Info`, props<{ ledgerId: number, ledgerInfo: LedgerInfo }>());
export const UpdateLedgerInfoSuccess = createAction(`${FEATURE_NAME} Update Ledger Info Success`, props<{ ledgerInfo: LedgerInfo }>());
export const UpdateLedgerInfoError = createAction(`${FEATURE_NAME} Update Ledger Info Error`, props<{ error: any }>());

export const GetLedgerChartOfAccountsRequest = createAction(`${FEATURE_NAME} Get Ledger Chart Of Accounts Request`, props<{ projectId: number }>());
export const GetLedgerChartOfAccountsSuccess = createAction(`${FEATURE_NAME} Get Ledger Chart Of Accounts Success`, props<{ chartOfAccounts: ChartOfAccount[] }>());

export const OpenNetAllocationDetailsModal = createAction(`${FEATURE_NAME} Open Net Allocation Details Modal`);

export const GetLedgerStages = createAction(`${FEATURE_NAME} Get Ledger Stages`);
export const GetLedgerStagesSuccess = createAction(`${FEATURE_NAME} Get Ledger Stages Success`, props<{ ledgerStages: IdValue[] }>());

export const GetLedgerStagesWithClaimantCount = createAction(`${FEATURE_NAME} Get Ledger Stages With Claimant Count`, props<{ projectId: number }>());
export const GetLedgerStagesWithClaimantCountSuccess = createAction(`${FEATURE_NAME} Get Ledger Stages With Claimant Count Success`, props<{ ledgerStagesWithClaimantCount: LedgerStageWithClaimantCount[] }>());

export const GetLedgerSummaryGrid = createAction(`${FEATURE_NAME} Get Ledger Summary Grid`, props<{ clientId: number }>());
export const GetLedgerSummaryGridSuccess = createAction(`${FEATURE_NAME} Get Ledger Summary Grid Success`, props<{ ledgerSummaryList: LedgerSummary[] }>());

export const GetLedgerEntryInfo = createAction(`${FEATURE_NAME} Get Ledger Entry Info`, props<{ id: number }>());
export const GetLedgerEntryInfoSuccess = createAction(`${FEATURE_NAME} Get Ledger Entry Info Success`, props<{ ledgerEntryInfo: LedgerEntryInfo }>());

export const GetPaymentsByLedgerEntryId = createAction(`${FEATURE_NAME} Get Payments By Ledger Entry Id`, props<{ gridParams: IServerSideGetRowsParamsExtended, ledgerEntryId: number }>());
export const GetPaymentsByLedgerEntryIdSuccess = createAction(`${FEATURE_NAME} Get Payments By Ledger Entry Id Success`, props<{ totalCount: number }>());

export const UpdateLedgerEntryInfo = createAction(`${FEATURE_NAME} Update Ledger Entry Info`, props<{ ledgerId: number, ledgerEntryInfo: Partial<LedgerEntryInfo> }>());
export const UpdateLedgerEntryInfoSuccess = createAction(`${FEATURE_NAME} Update Ledger Entry Info Success`);

export const AuthorizeLedgerEntries = createAction(`${FEATURE_NAME} Authorize Ledger Entry`, props<{ ledgerId: number, request: AuthorizeLedgersEntriesRequest }>());

export const GetLedgerEntryValidationData = createAction(`${FEATURE_NAME} Get Ledger Entry Validation Data`, props<{ caseId: number }>());
export const GetLedgerEntryValidationDataSuccess = createAction(`${FEATURE_NAME} Get Ledger Entry Validation Data Success`, props<{ ledgerEntryValidationData: LedgerEntryValidationData }>());

// Current Formula set
export const GetFormulaSet = createAction(`${FEATURE_NAME} Get Formula Set`);
export const GetFromulaSetSuccess = createAction(`${FEATURE_NAME} Get Formula Set Complete`, props<{ formulaSet: FormulaSets }>());

export const GetFormulaSetByProject = createAction(`${FEATURE_NAME} Get Formula Set By Project`, props<{ projectId: number }>());
export const GetFromulaSetByProjectSuccess = createAction(`${FEATURE_NAME} Get Formula Set By Project Complete`, props<{ formulaSet: FormulaSets }>());

export const GetLedgerFormulaModes = createAction(`${FEATURE_NAME} Get Ledger Formula Modes`);
export const GetLedgerFormulaModesSuccess = createAction(`${FEATURE_NAME} Get Ledger Formula Modes Success`, props<{ formulaModes: IdValue[] }>());

export const GetLedgerVariances = createAction(`${FEATURE_NAME} Get Ledger Variances`, props<{ clientId: number, disbursementGroupId?: number }>());
export const GetLedgerVariancesSuccess = createAction(`${FEATURE_NAME} Get Ledger Variances Success`, props<{ ledgerVariances: LedgerVariance[] }>());
export const ClearLedgerVariances = createAction(`${FEATURE_NAME} Clear Ledger Variances`);

export const ClearLedgerEntryInfo = createAction(`${FEATURE_NAME} Clear Ledger Entry Info`);

export const InitializePaymentInstructions = createAction(`${FEATURE_NAME} Initialize Payment Instructions`, props<{ paymentType: PaymentTypeEnum, ledgerEntry: LedgerEntryInfo, decimalsCount: number }>());
export const AddPaymentInstruction = createAction(`${FEATURE_NAME} Add Payment Instruction`, props<{ id: number }>());
export const DeletePaymentInstruction = createAction(`${FEATURE_NAME} Delete Payment Instruction`, props<{ id: number, paymentType: PaymentTypeEnum }>());
export const DeletePaymentInstructions = createAction(`${FEATURE_NAME} Delete Payment Instructions`);

export const UpdatePaymentInstruction = createAction(`${FEATURE_NAME} Update Payment Instruction`, props<{ paymentInstruction: Partial<PaymentInstruction> }>());
export const UpdatePaymentType = createAction(`${FEATURE_NAME} Update Payment Type`, props<{ paymentType: PaymentTypeEnum }>());
export const GetDefaultPayeesForLedgerEntry = createAction(`${FEATURE_NAME} Get Default Payees For Ledger Entry`, props<{ id: number }>());
export const GetDefaultPayeesForLedgerEntrySuccess = createAction(`${FEATURE_NAME} Get Default Payees For Ledger Entry Success`, props<{ payees: ClaimSettlementLedgerPayee }>());
export const GetPayeesForLedgerEntry = createAction(`${FEATURE_NAME} Get Payees For Ledger Entry`, props<{ id: number }>());
export const GetPayeesForLedgerEntrySuccess = createAction(`${FEATURE_NAME} Get Payees For Ledger Entry Success`, props<{ payees: ClaimSettlementLedgerPayee[] }>());
export const GetTransferOrgAndAccountsForClaimant = createAction(`${FEATURE_NAME} Get Transfer orgs and bank accounts for a claimant`, props<{ id: number }>());
export const GetTransferOrgAndAccountsForClaimantSuccess = createAction(`${FEATURE_NAME} Get Transfer orgs and bank accounts for a claimant Success`, props<{ transferOrgs: TransferOrgs }>());
export const GetGlobalTransferOrgAndAccounts = createAction(`${FEATURE_NAME} Get Global Transfer orgs and bank accounts`);
export const GetGlobalTransferOrgAndAccountsSuccess = createAction(`${FEATURE_NAME} Get Global Transfer orgs and bank accounts Success`, props<{ transferOrgs: TransferOrgs }>());


// QSF Types
export const GetProductTypesList = createAction(`${FEATURE_NAME}  Get Product Types List`, props<{ productCategoryId: number }>());
export const GetProductTypesListSuccess = createAction(`${FEATURE_NAME}  Get Product Types List Success`, props<{ types: IdValue[] }>());

export const GetQSFTypes = createAction(`${FEATURE_NAME} Get QSF Types`);
export const GetQSFTypesSuccess = createAction(`${FEATURE_NAME} Get QSF Types Complete`, props<{ qsfTypes: IdValue[] }>());

// Hold Types
export const GetHoldTypes = createAction(`${FEATURE_NAME} Get Hold Types`);
export const GetHoldTypesSuccess = createAction(`${FEATURE_NAME} Get Hold Types Complete`, props<{ holdTypes: HoldType[] }>());

// Generate Closing Statement
export const GenerateDocuments = createAction(`${FEATURE_NAME} Generate Documents`, props<{ controller: ControllerEndpoints, documentGeneratorRequest: SaveDocumentGeneratorRequest, entityTypeId: number, callback: Function }>());
export const GenerateDocumentsComplete = createAction(`${FEATURE_NAME} Generate Documents Complete`, props<{ data: any }>());

export const DownloadResults = createAction(`${FEATURE_NAME} Download Results`);
export const DownloadResultsComplete = createAction(`${FEATURE_NAME} Download Results Complete`);

export const ToggleClaimantSummaryBar = createAction(`${FEATURE_NAME} Toggle Summary Bar`, props<{ isExpanded: boolean }>());

// Election Form
export const GetElectionForm = createAction(`${FEATURE_NAME} Get Election Form`, props<{ id: number }>());
export const GetElectionFormSuccess = createAction(`${FEATURE_NAME} Get Election Form Success`, props<{ electionForm: ClaimantElection }>());
export const ClearElectionForm = createAction(`${FEATURE_NAME} Clear Election Form`);

export const CreateOrUpdateElectionForm = createAction(`${FEATURE_NAME} Create Or Update Election Form`, props<{ electionForm: ClaimantElection, file: File }>());
export const CreateOrUpdateElectionFormSuccess = createAction(`${FEATURE_NAME} Create Or Update Election Form Success`, props<{ electionForm: ClaimantElection, successMessage: string }>());
export const DeleteElectionFormDocument = createAction(`${FEATURE_NAME} Delete Election Form Document`, props<{ documentId: number }>());
export const DeleteElectionFormDocumentSuccess = createAction(`${FEATURE_NAME} Delete Election Form Document Success`);

export const GetElectionFormList = createAction(`${FEATURE_NAME} Get List Election Form`, props<{ clientId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetElectionFormListSuccess = createAction(`${FEATURE_NAME} Get List Election Form Success`, props<{ electionFormList: ClaimantElection[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const RefreshElectionFormList = createAction(`${FEATURE_NAME} Refresh List Election Form`, props<{ clientId: number }>());

export const GoToElectionFormDetailsPage = createAction(`${FEATURE_NAME} Go To Election Form Details Page`, props<{ electionFormId: number }>());
export const DeleteElectionForm = createAction(`${FEATURE_NAME} Delete Election Form`, props<{ electionFormId: number }>());
export const DeleteElectionFormSuccess = createAction(`${FEATURE_NAME} Delete Election Form Complete`);

export const GetAvailableDisbursementGroupsForElectionFormRequest = createAction(`${FEATURE_NAME} Get Available Disbursement Groups For Election Form Request`, props<{ clientId: number, electionFormId: number | null }>());
export const GetAvailableDisbursementGroupsForElectionFormSuccess = createAction(`${FEATURE_NAME} Get Available Disbursement Groups For Election Form Success`, props<{ disbursementGroups: DisbursementGroup[] }>());

export const GotoLedgerDetails = createAction(`${FEATURE_NAME} Go to Ledger Details`, props<{ claimantId: number, ledgerId: number }>());
export const GoToClaimantLedgerSummary = createAction(`${FEATURE_NAME} Go To Claimant Ledger Summary`, props<{ claimantId: number }>());

export interface IClaimantSummaryPagerPayload {
  projectId: number;
  paymentId?: number;
}
export const GoToClaimantSummary = createAction(`${FEATURE_NAME} Go To Claimant Summary`, props<{ projectId: number }>());
export const GoToClaimantSummaryRollup = createAction(`${FEATURE_NAME} Go To Claimant Summary Rollup`, props<{ projectId: number }>());
export const GoToPaymentItemDetails = createAction(`${FEATURE_NAME} Go To Payment Item Details`, props<{ paymentId: number }>());
export const GoToTransferItemDetails = createAction(`${FEATURE_NAME} Go To Transfer Item Details`, props<{ transferId: number }>());

export const VerifyElectionFormAddressRequest = createAction(`${FEATURE_NAME} Verify Election Form Address Request`, props<{ address: EntityAddress, close: Function, entityName: string, returnAddressOnSave?: boolean }>());
export const VerifyElectionFormAddressRequestSuccess = createAction(`${FEATURE_NAME} Verify Election Form Address Success`, props<{ close: Function, address: EntityAddress, verifiedAddress: VerifiedAddress, entityName: string, returnAddressOnSave?: boolean }>());
export const VerifyElectionFormAddressRequestError = createAction(`${FEATURE_NAME} Verify Election Form Address Error`, props<{ error: any }>());

// Claimant Closing Statements Settings
export const GetClosingStatementSettingsList = createAction(`${FEATURE_NAME} Get Closing Statement Settings List`, props<{ ledgerId: number }>());
export const GetClosingStatementSettingsListSuccess = createAction(`${FEATURE_NAME} Get Closing Statement Settings List Success`, props<{ payeeItems: PayeeItem[] }>());
export const GetClosingStatementSettingsDataRequest = createAction(`${FEATURE_NAME} Get Closing Statement Settings Data Request`, props<{ projectId?: number, isProjectAssociated?: boolean }>());
export const GetClosingStatementSettingsDataSuccess = createAction(`${FEATURE_NAME} Get Closing Statement Settings Data Success`, props<{ electronicDeliveryProviders: IdValue[], closingStatementTemplates: ClosingStatementTemplatesListItem[] }>());
export const UpdateClosingStatementSettingsRequest = createAction(`${FEATURE_NAME} Update Closing Statement Settings Request`, props<{ ledgerId: number, documentDeliveries: PayeeItem[] }>());
export const UpdateClosingStatementSettingsSuccess = createAction(`${FEATURE_NAME} Update Closing Statement Settings Success`, props<{ payeeItems: PayeeItem[] }>());
export const SetClosingStatementSettings = createAction(`${FEATURE_NAME} Set Closing Statement Settings`, props<{ payeeItems: PayeeItem[] }>());
export const GetClosingStatementSettingsAddressesRequest = createAction(`${FEATURE_NAME} Get Closing Statement Settings Addresses Request`, props<{ entityPairs: EntityPair[] }>());
export const GetClosingStatementSettingsAddressesSuccess = createAction(`${FEATURE_NAME} Get Closing Statement Settings Addresses Success`, props<{ data: AddressesListResponse[] }>());
// Emails
export const GetClosingStatementSettingsEmailsRequest = createAction(`${FEATURE_NAME} Get Closing Statement Settings Emails Request`, props<{ entityPairs: EntityPair[] }>());
export const GetClosingStatementSettingsEmailsSuccess = createAction(`${FEATURE_NAME} Get Closing Statement Settings Emails Success`, props<{ data: EmailsListResponse[] }>());

export const ResetClosingStatementSettingsList = createAction(`${FEATURE_NAME} Reset Closing Statement Settings List`);

// Deficiencies
export const GetDeficienciesList = createAction(`${FEATURE_NAME} Get Deficiencies List`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const GetDeficienciesListComplete = createAction(`${FEATURE_NAME} Get Deficiencies List Complete`, props<{ deficiencies: Deficiency[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const RefreshDeficienciesList = createAction(`${FEATURE_NAME} Refresh Deficiencies List`);
export const OverrideDeficiency = createAction(`${FEATURE_NAME} Override Deficiency`, props<{ id: number, caseId: number }>());
export const OverrideDeficiencyComplete = createAction(`${FEATURE_NAME} Override Deficiency Complete`);
export const GetPortalDeficienciesCount = createAction(`${FEATURE_NAME} Get Uncured Deficiencies Count`, props<{ clientId: number }>());
export const GetUncuredDeficienciesCountComplete = createAction(`${FEATURE_NAME} Get Uncured Deficiencies Count Complete`, props<{ uncuredDeficienciesCount: number }>());
// Ledger Overview

export const GetLedgerOverviewList = createAction(`${FEATURE_NAME} Get Ledger Overview List`, props<{ clientId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetLedgerOverviewListSuccess = createAction(`${FEATURE_NAME} Get Ledger Overview List Success`, props<{ ledgerOverview: LedgerOverview[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetLedgerOverviewTotal = createAction(`${FEATURE_NAME} Get Ledger Overview Total`, props<{ clientId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetLedgerOverviewTotalSuccess = createAction(`${FEATURE_NAME} Get Ledger Overview Total Success`, props<{ ledgerOverviewTotal: LedgerOverviewTotal }>());

// Probate
export const GetProbateDetailsByClientId = createAction(`${FEATURE_NAME} Get Probate Details By Client Id`, props<{ clientId: number }>());
export const GetProbateDetailsByClientIdSuccess = createAction(`${FEATURE_NAME} Get Probate Details By Client Id Success`, props<{ probateDetailsItem: ProbateDetails }>());
export const GetProbateTabsCount = createAction(`${FEATURE_NAME} Get Probate Tabs Count`, props<{ id: number }>());

export const CreateOrUpdateProbateDetails = createAction(`${FEATURE_NAME} Create Or Update Probate Details`, props<{ probateDetails: ProbateDetails }>());
export const CreateOrUpdateProbateDetailsSuccess = createAction(`${FEATURE_NAME} Create Or Update Probate Details Success`, props<{ probateDetailsItem: ProbateDetails }>());

export const GetProbateStages = createAction(`${FEATURE_NAME} Get Probate Stages`);
export const GetProbateStagesSuccess = createAction(`${FEATURE_NAME} Get Probate Stages Success`, props<{ probateStages: IdValue[] }>());

export const GetArcherOrgId = createAction(`${FEATURE_NAME} Get Archer Org Id`);
export const GetArcherOrgIdSuccess = createAction(`${FEATURE_NAME}  Get Archer Org Id Success`, props<{ archerId: number }>());

export const GetUserRequest = createAction(`${FEATURE_NAME} Get User Request`, props<{ userId: number }>());
export const GetUserRequestSuccess = createAction(`${FEATURE_NAME} Get User Request Success`, props<{ user: User }>());

export const GetDisbursementGroupsList = createAction(`${FEATURE_NAME} Get Disbursement Groups List`, props<{ projectId: number, claimantId: number }>());
export const GetDisbursementGroupsListSuccess = createAction(`${FEATURE_NAME} Get Disbursement Groups List Success`, props<{ disbursementGroupList: SelectOption[] }>());

export const GetInactiveReasons = createAction(`${FEATURE_NAME} Get Inactive Reasons`, props<{ entityTypeId: number }>());
export const GetInactiveReasonsSuccess = createAction(`${FEATURE_NAME} Get Inactive Reasons Success`, props<{ inactiveReasons: IdValue[] }>());

export const GetProjectMessagesByClientId = createAction(`${FEATURE_NAME} Get Project Messages By Client Id`, props<{ clientId: number }>());
export const GetProjectMessagesByClientIdSuccess = createAction(`${FEATURE_NAME} Get Project Messages By Client Id Success`, props<{ projectMessages: ProjectMessage[] }>());
export const SetProjectMessagesModalStatus = createAction(`${FEATURE_NAME} Set Project Messages Modal Open Status`, props<{ isOpen: boolean }>());

// Release Packet Tracking

export const UpdateProbatePacketRequests = createAction(`${FEATURE_NAME} Update Probate's Packet Requests`, props<{ probateId: number, packetRequests: PacketRequest[] }>());
export const UpdateProbatePacketRequestsSuccess = createAction(`${FEATURE_NAME} Update Probate's Packet Requests Success`, props<{ packetRequests: PacketRequest[] }>());


export const GetClientFullPin = createAction(`${FEATURE_NAME} Get Client Full PIN`, props<{ clientId: number }>());
export const GetClientFullPinComplete = createAction(`${FEATURE_NAME} Get Client Full PIN Complete`, props<{ fullPin: string }>());

export const ResetClientFullPin = createAction(`${FEATURE_NAME} Reset Client Full PIN`);

//Generate Final Status Letter
export const GenerateFinalStatusLetter = createAction(`${FEATURE_NAME} Generate Final Status Letter`, props<{ clientId: number, channelName: string }>());
export const GenerateFinalStatusLetterComplete = createAction(`${FEATURE_NAME} Generate Final Status Letter Complete`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());

// Claimant Deficiencies
export const GetClaimantDeficienciesList = createAction(`${FEATURE_NAME} Get Claimant Deficiencies List`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const GetClaimantDeficienciesListSuccess = createAction(`${FEATURE_NAME} Get Claimant Deficiencies List Success`, props<{ deficiencies: ClaimantDeficiency[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const ResolveDeficiencies = createAction(`${FEATURE_NAME} Resolve Deficiencies`, props<{ deficienciesResolution: IDeficiencyResolution[], files?: IDeficiencyResolutionFile[] }>());
export const ResolveDeficienciesSuccess = createAction(`${FEATURE_NAME} Resolve Deficiencies Success`);

export const GetPendingDeficiencyResolutions = createAction(`${FEATURE_NAME} Get Pending Deficiency Resolutions`, props<{ clientId: number }>());
export const GetPendingDeficiencyResolutionsSuccess = createAction(`${FEATURE_NAME} Get Pending Deficiency Resolutions Success`, props<{ pendingDeficiencies: IDeficiencyResolutionWithFiles[] }>());
