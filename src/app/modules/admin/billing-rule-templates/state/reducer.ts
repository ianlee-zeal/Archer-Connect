import { createReducer, on, Action } from '@ngrx/store';
import { IdValue } from '@app/models';
import { BillingRuleTemplate } from '@app/models/billing-rule/billing-rule-template';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ProductService } from '@app/models/liens/product-service';
import * as actions from './actions';

export interface BillingRuleTemplateState {
  statuses: IdValue[];
  invoicingItems: IdValue[];
  revRecItems: IdValue[];
  revRecMethods: IdValue[];
  services: ProductService[];
  billingRuleTemplate: BillingRuleTemplate;
  gridParams: IServerSideGetRowsParamsExtended;
  feeScopes: IdValue[];
  chartOfAccounts: IdValue[];
}

export const initialState: BillingRuleTemplateState = {
  statuses: null,
  invoicingItems: null,
  revRecItems: null,
  revRecMethods: null,
  services: null,
  billingRuleTemplate: null,
  gridParams: null,
  feeScopes: null,
  chartOfAccounts: null,
};

export const Reducer = createReducer(
  initialState,

  on(actions.Error, (state, { error }) => ({ ...state, error })),

  on(actions.GetBillingRuleTemplateStatusesSuccess, (state, { statuses }) => ({ ...state, statuses })),

  on(actions.SearchInvoicingItemsSuccess, (state, { items }) => ({ ...state, invoicingItems: items })),

  on(actions.SearchRevRecItemsSuccess, (state, { items }) => ({ ...state, revRecItems: items })),

  on(actions.GetRevRecMethodsSuccess, (state, { methods }) => ({ ...state, revRecMethods: methods })),

  on(actions.GetBillingRuleTemplateSuccess, (state, { billingRuleTemplate }) => ({ ...state, billingRuleTemplate })),

  on(actions.CreateBillingRuleTemplateSuccess, (state, { billingRuleTemplate }) => ({ ...state, billingRuleTemplate })),

  on(actions.UpdateBillingRuleTemplateSuccess, (state, { billingRuleTemplate }) => ({ ...state, billingRuleTemplate })),

  on(actions.ClearBillingRuleTemplate, state => ({ ...state, billingRuleTemplate: null })),

  on(actions.SearchBillingRuleTemplates, (state, { gridParams }) => ({ ...state, gridParams })),

  on(actions.GetFeeScopesSuccess, (state, { feeScopes }) => ({ ...state, feeScopes })),

  on(actions.GetChartOfAccountsSuccess, (state, { chartOfAccounts }) => ({ ...state, chartOfAccounts })),
);

export function reducer(state: BillingRuleTemplateState | undefined, action: Action) {
  return Reducer(state, action);
}
