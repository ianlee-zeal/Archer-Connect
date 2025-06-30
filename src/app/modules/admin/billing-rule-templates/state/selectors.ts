import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromBrt from './reducer';
import { featureName } from './actions';

const billingRuleTemplates = createFeatureSelector<fromBrt.BillingRuleTemplateState>(featureName);

export const statuses = createSelector(billingRuleTemplates, state => state.statuses);
export const invoicingItems = createSelector(billingRuleTemplates, state => state.invoicingItems);
export const revRecItems = createSelector(billingRuleTemplates, state => state.revRecItems);
export const revRecMethods = createSelector(billingRuleTemplates, state => state.revRecMethods);
export const services = createSelector(billingRuleTemplates, state => state.services);
export const billingRuleTemplate = createSelector(billingRuleTemplates, state => state.billingRuleTemplate);
export const gridParams = createSelector(billingRuleTemplates, state => state.gridParams);
export const feeScopes = createSelector(billingRuleTemplates, state => state.feeScopes);
export const chartOfAccounts = createSelector(billingRuleTemplates, state => state.chartOfAccounts);
