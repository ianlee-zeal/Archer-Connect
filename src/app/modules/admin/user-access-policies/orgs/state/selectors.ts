import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ArrayHelper } from '@app/helpers/array.helper';
import * as fromAdminR from '../../../state/reducer';

const feature = createFeatureSelector<fromAdminR.AdminState>('admin_feature');

const userAccessPoliciesOrgs = createSelector(feature, state => state.user_access_policies_orgs);
const commonFeature = createSelector(userAccessPoliciesOrgs, state => state.common);
const userAccessPoliciesOrgTypes = createSelector(commonFeature, state => state.orgTypes);

// org types selectors
const orgId = createSelector(commonFeature, state => state.id);
const bankAccounts = createSelector(commonFeature, state => state.bankAccounts);
const bankAccountsList = createSelector(commonFeature, state => state.bankAccountsList);
const searchOrganizationNames = createSelector(commonFeature, state => state.organizationNames);
const projectsList = createSelector(commonFeature, state => state.projectsList);
const defaultPaymentAddress = createSelector(commonFeature, state => state.defaultPaymentAddress);
const orgPreviousUrl = createSelector(commonFeature, state => state.orgPreviousUrl);
const initiallySelectedOrgTypes = createSelector(userAccessPoliciesOrgTypes, state => state.initiallySelected);
const selectedOrgTypes = createSelector(userAccessPoliciesOrgTypes, state => state.selected);
const actionBar = createSelector(commonFeature, state => state.actionBar);
const orgTypesIsDirty = createSelector(userAccessPoliciesOrgTypes, state => {
  if (!state.types) {
    return false;
  }

  return !ArrayHelper.areArraysEqual(
    [].concat(state.initiallySelected).sort(),
    [].concat(state.selected).sort(),
  );
});

export const orgTypesSelectors = {
  orgId,
  bankAccounts,
  bankAccountsList,
  projectsList,
  defaultPaymentAddress,
  orgPreviousUrl,
  initiallySelected: initiallySelectedOrgTypes,
  selected: selectedOrgTypes,
  isDirty: orgTypesIsDirty,
  searchOrganizationNames,
  actionBar: actionBar,
};
