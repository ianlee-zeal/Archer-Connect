import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const dropDownsValuesInitialSelector = createSelector(sharedFeature, state => state.dropDownsValues);

export const dropDownsValuesSelectors = {
  entireState: dropDownsValuesInitialSelector,
  timeZones: createSelector(dropDownsValuesInitialSelector, state => state.timeZones),
  defaultGlobalSearchTypes: createSelector(dropDownsValuesInitialSelector, state => state.defaultGlobalSearchTypes),
  ledgerAccounts: createSelector(dropDownsValuesInitialSelector, state => state.ledgerAccounts),
  ledgerAccountGroups: createSelector(dropDownsValuesInitialSelector, state => state.ledgerAccountGroups),
  stages: createSelector(dropDownsValuesInitialSelector, state => state.stages),
  statuses: createSelector(dropDownsValuesInitialSelector, state => state.statuses),
  lienTypes: createSelector(dropDownsValuesInitialSelector, state => state.lienTypes),
  planTypes: createSelector(dropDownsValuesInitialSelector, state => state.planTypes),
  coaGroupNumbers: createSelector(dropDownsValuesInitialSelector, state => state.coaGroupNumbers),
  coaNumbers: createSelector(dropDownsValuesInitialSelector, state => state.coaNumbers),
};
