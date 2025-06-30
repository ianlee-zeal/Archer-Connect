import { createFeatureSelector, createSelector } from '@ngrx/store';

import { OrgImpersonateState } from './reducer';

const featureSelector = createFeatureSelector<OrgImpersonateState>('org_impersonate_feature');

export const orgsOptions = createSelector(
   featureSelector,
   (state: OrgImpersonateState) => state.orgsOptions,
);

export const orgsOptionsLoading = createSelector(
   featureSelector,
   (state: OrgImpersonateState) => state.orgsOptionsLoading,
);

export const rolesOptions = createSelector(
   featureSelector,
   (state: OrgImpersonateState) => state.rolesOptions,
);

export const rolesOptionsLoading = createSelector(
   featureSelector,
   (state: OrgImpersonateState) => state.orgsOptionsLoading,
);
