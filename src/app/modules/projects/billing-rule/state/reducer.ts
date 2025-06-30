import { createReducer, on, Action } from '@ngrx/store';
import { IdValue, Org, InjuryCategory } from '@app/models';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ProductService } from '@app/models/liens/product-service';
import { BillingRule } from '@app/models/billing-rule/billing-rule';
import { BillingRuleTemplate } from '@app/models/billing-rule/billing-rule-template';
import * as actions from './actions';

export interface BillingRuleState {
  feeScopes: IdValue[];
  revRecMethods: IdValue[];
  services: ProductService[];
  billingRule: BillingRule;
  gridParams: IServerSideGetRowsParamsExtended;
  billingRuleTemplates: BillingRuleTemplate[];
  projectQsfOrg: Org;
  orgs: Org[];
  injuryCategories: InjuryCategory[];
  feeCapsGridParams: IServerSideGetRowsParamsExtended;
  chartOfAccounts: IdValue[];
}

export const initialState: BillingRuleState = {
  feeScopes: [],
  revRecMethods: [],
  services: [],
  billingRule: null,
  gridParams: null,
  billingRuleTemplates: [],
  projectQsfOrg: null,
  orgs: [],
  injuryCategories: [],
  feeCapsGridParams: null,
  chartOfAccounts: [],
};

export const Reducer = createReducer(
  initialState,
  on(actions.Error, (state, { error }) => ({ ...state, error })),
  on(actions.GetFeeScopesSuccess, (state, { feeScopes }) => ({ ...state, feeScopes })),
  on(actions.GetRevRecMethodsSuccess, (state, { methods }) => ({ ...state, revRecMethods: methods })),
  on(actions.GetBillingRuleSuccess, (state, { billingRule }) => ({ ...state, billingRule })),
  on(actions.ClearBillingRule, state => ({ ...state, billingRule: null })),
  on(actions.SearchBillingRules, (state, { gridParams }) => ({ ...state, gridParams })),
  on(actions.SearchBillingRuleTemplatesSuccess, (state, { billingRuleTemplates }) => ({ ...state, billingRuleTemplates })),
  on(actions.SearchOrgsSuccess, (state, { orgs }) => ({ ...state, orgs })),
  on(actions.SearchInjuryCategoriesSuccess, (state, { injuryCategories }) => ({ ...state, injuryCategories })),
  on(actions.SearchFeeCaps, (state, { feeCapsGridParams }) => ({ ...state, feeCapsGridParams })),
  on(actions.GetProjectQsfOrgSuccess, (state, { projectQsfOrg }) => ({ ...state, projectQsfOrg })),
  on(actions.GetChartOfAccountsSuccess, (state, { chartOfAccounts }) => ({ ...state, chartOfAccounts })),
);

export function reducer(state: BillingRuleState | undefined, action: Action) {
  return Reducer(state, action);
}
