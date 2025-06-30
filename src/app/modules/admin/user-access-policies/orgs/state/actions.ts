import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { createAction, props } from '@ngrx/store';

import * as Models from '@app/models';
import { OrgType } from '@app/models/org-type';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { BankAccount, IdValue } from '@app/models';
import { PaymentPreferencesItem } from '@app/models/payment-preferences-item';
import { ControllerEndpoints } from '@app/models/enums';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { DocumentGeneratorRequest } from '@app/models/documents/document-generators/document-generator-request';
import { UserLoginReportRequest } from '@app/models/users-audit/user-login-report-request';

export const FEATURE_NAME = '[Admin-User-Orgs]';

export const GetOrgsGrid = createAction('[Admin-User-Orgs] Get Organizations Grid', props<{ params: IServerSideGetRowsParamsExtended }>());
export const GetOrgsGridSuccess = createAction('[Admin-User-Orgs] Get Organizations Grid Success', props<{ params: any, agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetOrgsGridError = createAction('[Admin-User-Orgs] Get Organizations Grid Error', props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const GetOrg = createAction('[Admin-User-Orgs] Get Org', props<{ id: number, isSubOrg?: boolean }>());
export const GetOrgComplete = createAction('[Admin-User-Orgs] Get Org Complete', props<{ data: Models.Org }>());

export const GetOrgLoadingStarted = createAction('[Admin-User-Orgs] Get Org Loading Started', props<{ additionalActionNames: string[] }>());

export const RefreshOrg = createAction('[Admin-User-Orgs] Refresh Org');
export const RefreshOrgComplete = createAction('[Admin-User-Orgs] Refresh Org Complete', props<{ data: any }>());
export const UpdateOrgsSearch = createAction('[Admin-Users] Update Organizations List Search', props<{ search: any }>());
export const UpdateOrgsActionBar = createAction('[Admin-Users] Update Organizations Action Bar', props<{ actionBar: ActionHandlersMap }>());
export const AddOrg = createAction('[Admin-User-Orgs] Add Org', props<{ item: Models.Org; callback: Function }>());
export const UpdateOrg = createAction('[Admin-User-Orgs] Update Org', props<{ item: Models.Org }>());
export const SaveOrg = createAction('[Admin-User-Orgs] Save Org', props<{ callback:() => void }>());

export const DeleteOrgs = createAction('[Admin-User-Orgs] Delete Orgs', props<{ ids: number[], callback: Function }>());
export const SaveOrgComplete = createAction('[Admin-User-Orgs] Save Org Complete');
export const DeleteOrgComplete = createAction('[Admin-User-Orgs] Delete Org Complete');
export const GoToOrg = createAction('[Admin-User-Orgs] Goto Org', props<{ id: number, edit?: boolean }>());
export const GoToOrganizationsList = createAction(`${FEATURE_NAME} Goto Organizations List`);
export const GoToSubOrganizationsList = createAction('[Admin-User-Orgs] Goto Sub Organizations List', props<{ id: number }>());
export const GoToOrgDocument = createAction('[Admin-User-Orgs] Goto Org Document', props<{ id: number, docId: number }>());
export const SelectOrgs = createAction('[Admin-User-Orgs] Select Orgs', props<{ Orgs: Models.IdValue[] }>());
export const UpdatePreviousOrgUrl = createAction('[Admin-User-Orgs] Update Previous Org Url', props<{ orgPreviousUrl: string }>());
export const Error = createAction('[Admin-User-Orgs] API Error', props<{ error: any }>());

export const SearchOrganizationsByNameRequest = createAction(`${FEATURE_NAME} Search Organizations Request`, props<{ name: string }>());
export const SearchOrganizationsByNameRequestSuccess = createAction(`${FEATURE_NAME} Search Organizations Success`, props<{ organizationNames: string[] }>());
export const SearchOrganizationsByNameRequestError = createAction(`${FEATURE_NAME} Search Organizations Failed`, props<{ error: string }>());

//
// Org Types
//
export const ResetOrgTypesTab = createAction('[Admin-User-Org-Types] Reset Org Types Tab');
export const GetOrgTypesGrid = createAction('[Admin-User-Org-Types] Get Org Types Grid', props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetOrgTypesGridComplete = createAction('[Admin-User-Org-Types] Get Org Types Grid Complete', props<{ types: OrgType[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetOrgTypesGridError = createAction('[Admin-User-Org-Types] Get Org Types Grid Error', props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());
export const ChangeInitiallySelectedOrgTypes = createAction('[Admin-User-Org-Types] Change Initially Selected Org Types', props<{ selectedIds: number[] }>());
export const ChangeSelectedOrgTypes = createAction('[Admin-User-Org-Types] Change Selected Org Types', props<{ selectedIds: number[] }>());

export const GetOrgTypesAssignments = createAction('[Admin-User-Org-Types] Get Org Types Assignments to Org');
export const GetOrgTypesAssignmentsComplete = createAction('[Admin-User-Org-Types] Get Org Types Assignments to Org Complete', props<{ typeIds: number[] }>());
export const GetOrgTypesAssignmentsError = createAction('[Admin-User-Org-Types] Get Org Types Assignments to Org Error', props<{ errorMessage: string }>());

export const SaveOrgTypeAssignments = createAction('[Admin-User-Org-Types] Save Org Type Assignments');
export const SaveOrgTypeAssignmentsComplete = createAction('[Admin-User-Org-Types] Save Org Type Assignments Complete');
export const SaveOrgTypeAssignmentsError = createAction('[Admin-User-Org-Types] Save Org Type Assignments Error', props<{ errorMessage: string }>());

// Bank Accounts
export const GetBankAccounts = createAction('[Admin-User-Org-Types] Get Bank Accounts');
export const GetBankAccountsComplete = createAction('[Admin-User-Org-Types] Get Bank Accounts Complete', props<{ accounts: BankAccount[] }>());
export const GetBankAccountsError = createAction('[Admin-User-Org-Types] Get Bank Accounts Error', props<{ errorMessage: string }>());
export const GoToOrganizationBankAccounts = createAction('[Admin-User-Access-Policies] Goto Organization Bank Accounts', props<{ organizationId: number }>());
export const SetDefaultBankAccount = createAction('[Admin-User-Orgs] Set Default Bank Account', props<{ orgId: number, bankAccountId: number }>());
export const SetDefaultBankAccountSuccess = createAction('[Admin-User-Orgs] Set Default Bank Account Success');

// Addresses
export const GetDefaultPaymentAddress = createAction('[Admin-User-Orgs] Get Default Address', props<{ orgId: number, entityType: number }>());
export const GetDefaultPaymentAddressSuccess = createAction('[Admin-User-Orgs] Get Default Address Success', props<{ defaultPaymentAddress: IdValue[] }>());

// Payment Preferences
export const GetPaymentPreferencesList = createAction('[Admin-User-Orgs] Get Payment Preferences List', props<{ orgId: number, gridParams: IServerSideGetRowsParamsExtended }>());
export const GetPaymentPreferencesListSuccess = createAction('[Admin-User-Orgs] Get Payment Preferences List Success', props<{ paymentPreferencesItems: PaymentPreferencesItem[], gridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetProjectsRequest = createAction('[Admin-User-Org-Types] Get Projects Request', props<{ orgId: number }>());
export const GetProjectsRequestComplete = createAction('[Admin-User-Org-Types] Get Projects Request Complete', props<{ projectsList: IdValue[] }>());

export const GetBankAccountsList = createAction('[Admin-User-Org-Types] Get Bank Accounts List', props<{ orgId: number }>());
export const GetBankAccountsListComplete = createAction('[Admin-User-Org-Types] Get Bank Accounts List Complete', props<{ bankAccountsList: IdValue[] }>());

export const GetSubQsfBankAccountsList = createAction('[Admin-User-Org-Types] Get Sub QSF Bank Accounts List', props<{ qsfOrgId: number }>());
export const GetSubQsfBankAccountsListComplete = createAction('[Admin-User-Org-Types] Get Sub QSF Bank Accounts List Complete', props<{ bankAccountsList: IdValue[] }>());
export const ClearSubQsfBankAccountsList = createAction('[Admin-User-Org-Types] Clear Sub QSF Bank Accounts List');

export const RefreshPaymentPreferenceList = createAction('[Admin-User-Orgs] Refresh Payment Preference List');

export const GetProjectGridDataRequest = createAction(`[Admin-User-Orgs] Get All Projects Action Request`, props<{ orgId: number, gridParams: IServerSideGetRowsParamsExtended }>());
export const GetProjectGridDataRequestComplete = createAction(`[Admin-User-Orgs] Get All Projects Action Request Complete`, props<{ projects: Models.Project[], gridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

//Export Orgs
export const DownloadOrgs = createAction(`[${FEATURE_NAME}] Download Orgs`, props<{
     agGridParams: IServerSideGetRowsParamsExtended,
     channelName: string,
}>());
export const DownloadOrgsComplete = createAction(`[${FEATURE_NAME}] Download Orgs Complete`, props<{ channel: string }>());
export const DownloadOrgsDocument = createAction(`[${FEATURE_NAME}] Download Orgs Document`, props<{ id: number }>());
export const UpdateOrgsListActionBar = createAction(`[${FEATURE_NAME}] Update Orgs List Action Bar`, props<{ actionBar: ActionHandlersMap }>());

//Export Users
export const DownloadUsers = createAction(`[${FEATURE_NAME}] Export Users Request`);
export const DownloadUsersComplete = createAction(`[${FEATURE_NAME}] Export Users Complete`);
export const DownloadUsersError = createAction(`[${FEATURE_NAME}]Export Users Error`, props<{ errorMessage: string }>());
export const UpdateUsersListActionBar = createAction(`[${FEATURE_NAME}] Update Users List Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GenerateDocuments = createAction(`${FEATURE_NAME} Generate Documents`, props<{ controller: ControllerEndpoints, request: DocumentGeneratorRequest }>());
export const GenerateDocumentsComplete = createAction(`${FEATURE_NAME} Generate Documents Complete`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());
export const DownloadGeneratedDocument = createAction(`${FEATURE_NAME} Download Generated Document`, props<{ generatorId: number }>());
export const DownloadGeneratedDocumentSuccess = createAction(`${FEATURE_NAME} Download Generated Document Success`);

export const GenerateUserLoginReport = createAction(`${FEATURE_NAME} Generate User Login Report`, props<{ request: UserLoginReportRequest }>());
export const GenerateUserLoginReportComplete = createAction(`${FEATURE_NAME} Generate User Login Report Complete`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());