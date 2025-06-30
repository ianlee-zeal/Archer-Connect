import { Action, combineReducers } from '@ngrx/store';

import * as bankAccountsReducer from '@app/modules/admin/bank-accounts/state/reducer';
import * as paymentsReducer from '@app/modules/payments/state/reducer';
import * as fromUserAccessPolicies from '../user-access-policies/state/reducer';
import * as fromUserAccessPoliciesOrgs from '../user-access-policies/orgs/state/reducer';
import * as fromPermissions from '../perms/state/reducer';
import * as fromBillingRuleTemplates from '../billing-rule-templates/state/reducer';
import * as fromUploadW9 from '../upload-w9/state/reducer';
import { userAccessPoliciesInitialState, UserAccessPoliciesState } from '../user-access-policies/state/state';

export interface AdminState {
  user_access_policies: UserAccessPoliciesState,
  user_access_policies_orgs: fromUserAccessPoliciesOrgs.UserAccessPoliciesOrgsState,
  bankAccounts: bankAccountsReducer.BankAccountsState,
  permissions: fromPermissions.PermissionState,
  payments: paymentsReducer.PaymentsState,
  billingRuleTemplates: fromBillingRuleTemplates.BillingRuleTemplateState,
  uploadw9: fromUploadW9.UploadW9State,
}

const initialState: AdminState = {
  user_access_policies: userAccessPoliciesInitialState,
  user_access_policies_orgs: fromUserAccessPoliciesOrgs.userAccessPoliciesOrgsInitialState,
  bankAccounts: bankAccountsReducer.bankAccountsInitialState,
  permissions: fromPermissions.permissionsInitialState,
  payments: paymentsReducer.paymentsInitialState,
  billingRuleTemplates: fromBillingRuleTemplates.initialState,
  uploadw9: fromUploadW9.uploadW9InitialState,
};

const Reducer = combineReducers({
  user_access_policies: fromUserAccessPolicies.Reducer,
  user_access_policies_orgs: fromUserAccessPoliciesOrgs.UserAccessPoliciesOrgsReducer,
  bankAccounts: bankAccountsReducer.Reducer,
  permissions: fromPermissions.Reducer,
  payments: paymentsReducer.Reducer,
  billingRuleTemplates: fromBillingRuleTemplates.Reducer,
  uploadw9: fromUploadW9.UploadW9Reducer
}, initialState);

export function reducer(state: AdminState | undefined, action: Action) {
  return Reducer(state, action);
}
