import { SelectHelper } from '@app/helpers/select.helper';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectsState } from '../../state/reducer';

const projectFeature = createFeatureSelector<ProjectsState>('projects_feature');
const billingRuleState = createSelector(projectFeature, state => state.billingRule);

export const feeScopes = createSelector(billingRuleState, state => state.feeScopes);
export const billingRule = createSelector(billingRuleState, state => state.billingRule);
export const gridParams = createSelector(billingRuleState, state => state.gridParams);
export const revRecMethods = createSelector(billingRuleState, state => state.revRecMethods);
export const services = createSelector(billingRuleState, state => state.services);
export const billingRuleTemplates = createSelector(billingRuleState, state => state.billingRuleTemplates);
export const orgs = createSelector(billingRuleState, state => state.orgs);
export const servicesAsOptions = createSelector(billingRuleState, state => state.services?.map(SelectHelper.serviceToKeyValuePair) ?? []);
export const injuryCategories = createSelector(billingRuleState, state => state.injuryCategories);
export const feeCapsGridParams = createSelector(billingRuleState, state => state.feeCapsGridParams);
export const projectQsfOrg = createSelector(billingRuleState, state => state.projectQsfOrg);
export const chartOfAccounts = createSelector(billingRuleState, state => state.chartOfAccounts);
