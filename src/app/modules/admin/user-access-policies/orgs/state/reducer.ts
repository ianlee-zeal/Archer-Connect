import { createReducer, on, Action, combineReducers } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { Org, BankAccount, IdValue } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { PaymentPreferencesItem } from '@app/models/payment-preferences-item';
import * as userAccessPoliciesActions from './actions';
import { OrgTypesState, orgTypesInitialState } from './state';

interface CommonState {
  id: number,
  index: Org[],
  item: Org,
  params: IServerSideGetRowsParamsExtended,
  search: {
    search_term: string
  },
  orgTypes: OrgTypesState,
  bankAccounts: BankAccount[],
  defaultPaymentAddress: IdValue[],
  bankAccountsList: IdValue[],
  projectsList: IdValue[],
  paymentPreferencesItems: PaymentPreferencesItem[],
  actionBar: ActionHandlersMap,
  orgPreviousUrl: string,
  error: any,
  pending: boolean,
  organizationNames: string[],
}

const initialCommonState: CommonState = {
  id: null,
  index: null,
  item: null,
  params: null,
  search: { search_term: null },
  orgTypes: orgTypesInitialState,
  bankAccounts: null,
  bankAccountsList: null,
  defaultPaymentAddress: null,
  projectsList: null,
  paymentPreferencesItems: null,
  actionBar: null,
  orgPreviousUrl: null,
  error: null,
  pending: false,
  organizationNames: null,
};

// main reducer function
const commonReducer = createReducer(
  initialCommonState,

  on(userAccessPoliciesActions.AddOrg, state => ({ ...state, search: { ...state.search, search_term: null } })),

  on(userAccessPoliciesActions.UpdateOrgsSearch, (state, { search }) => ({ ...state, search })),

  on(userAccessPoliciesActions.UpdateOrgsActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

  on(userAccessPoliciesActions.GetOrg, (state, { id }) => ({ ...state, id, item: null, error: null, pending: true })),

  on(userAccessPoliciesActions.GetOrgComplete, (state, { data }) => ({ ...state, item: data, pending: false })),

  on(userAccessPoliciesActions.RefreshOrg, state => ({ ...state, error: null, pending: true })),

  on(userAccessPoliciesActions.RefreshOrgComplete, (state, { data }) => ({ ...state, item: data, pending: false })),

  on(userAccessPoliciesActions.UpdateOrg, (state, { item }) => ({ ...state, item: { ...state.item, ...item }, pending: false })),

  on(userAccessPoliciesActions.UpdatePreviousOrgUrl, (state, { orgPreviousUrl }) => ({ ...state, orgPreviousUrl })),

  on(userAccessPoliciesActions.ResetOrgTypesTab, state => ({ ...state, orgTypes: { ...state.orgTypes, selected: [], initiallySelected: [] } })),
  on(userAccessPoliciesActions.GetOrgTypesGrid, state => ({ ...state, orgTypes: { ...state.orgTypes, types: null } })),
  on(userAccessPoliciesActions.GetOrgTypesGridComplete, (state, { types }) => ({ ...state, orgTypes: { ...state.orgTypes, types } })),
  on(userAccessPoliciesActions.ChangeInitiallySelectedOrgTypes, (state, { selectedIds }) => ({ ...state, orgTypes: { ...state.orgTypes, initiallySelected: selectedIds } })),
  on(userAccessPoliciesActions.ChangeSelectedOrgTypes, (state, { selectedIds }) => ({ ...state, orgTypes: { ...state.orgTypes, selected: selectedIds } })),
  on(userAccessPoliciesActions.GetOrgTypesAssignments, state => ({ ...state, orgTypes: { ...state.orgTypes, initiallySelected: [] } })),
  on(userAccessPoliciesActions.GetOrgTypesAssignmentsComplete, (state, { typeIds }) => ({ ...state, orgTypes: { ...state.orgTypes, initiallySelected: typeIds } })),

  on(userAccessPoliciesActions.GetBankAccounts, state => ({ ...state, bankAccounts: null, error: null, pending: true })),
  on(userAccessPoliciesActions.GetBankAccountsComplete, (state, { accounts }) => ({ ...state, bankAccounts: accounts, pending: false })),
  on(userAccessPoliciesActions.ClearSubQsfBankAccountsList, (state, { }) => ({ ...state, bankAccounts: null, pending: false })),

  on(userAccessPoliciesActions.GetDefaultPaymentAddress, state => ({ ...state, defaultPaymentAddress: null, error: null, pending: true })),
  on(userAccessPoliciesActions.GetDefaultPaymentAddressSuccess, (state, { defaultPaymentAddress }) => ({ ...state, defaultPaymentAddress, pending: false })),

  on(userAccessPoliciesActions.GetPaymentPreferencesList, state => ({ ...state, paymentPreferencesItems: null, error: null, pending: true })),
  on(userAccessPoliciesActions.GetPaymentPreferencesListSuccess, (state, { paymentPreferencesItems, gridParams }) => ({ ...state, pending: false, paymentPreferencesItems, params: gridParams })),

  on(userAccessPoliciesActions.GetProjectsRequestComplete, (state, { projectsList }) => ({ ...state, projectsList })),
  on(userAccessPoliciesActions.GetBankAccountsListComplete, (state, { bankAccountsList }) => ({ ...state, bankAccountsList })),
  on(userAccessPoliciesActions.SearchOrganizationsByNameRequestSuccess, (state, { organizationNames }) => ({ ...state, organizationNames })),

  on(userAccessPoliciesActions.UpdateOrgsListActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(userAccessPoliciesActions.UpdateUsersListActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

);

function CommonReducer(state: CommonState | undefined, action: Action) {
  return commonReducer(state, action);
}

export interface UserAccessPoliciesOrgsState {
  common: CommonState,
}

export const userAccessPoliciesOrgsInitialState: UserAccessPoliciesOrgsState = { common: initialCommonState };

const userAccessPoliciesOrgsReducer = combineReducers({ common: CommonReducer }, userAccessPoliciesOrgsInitialState);

// we have to wrap our reducer like this or it won't compile in prod
export function UserAccessPoliciesOrgsReducer(state: UserAccessPoliciesOrgsState | undefined, action: Action) {
  return userAccessPoliciesOrgsReducer(state, action);
}
