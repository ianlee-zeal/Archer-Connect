import { EntityTypeEnum, GridId } from '@app/models/enums';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IGridLocalData, IGridLocalDataMap, IGridSettingsMap, RootState } from './root.state';

export interface AppState {
  root_feature: RootState
}

// State selectors
const selectFeature = createFeatureSelector<RootState>('root_feature');
export const dropdownValues = createSelector(selectFeature, state => state.dropdown_values);

export const menu = createSelector(selectFeature, state => state.menu);
export const error = createSelector(selectFeature, state => state.error);

export const accessPoliciesDropdownValues = createSelector(dropdownValues, state => state.accessPolicies);
export const documentTypesDropdownValues = createSelector(dropdownValues, state => state.documentTypes);
export const documentStatusesDropdownValues = createSelector(dropdownValues, (state, props) => state.documentStatuses.filter(status => status.typeId === props.typeId));
export const documentChannelsDropdownValues = createSelector(dropdownValues, state => state.documentChannels);
export const injuryTypesDropdownValues = createSelector(dropdownValues, state => state.injuryEventTypes);

export const statesDropdownValues = createSelector(dropdownValues, state => state.states);
export const countriesDropdownValues = createSelector(dropdownValues, state => state.countries);
export const addressTypesDropdownValues = createSelector(dropdownValues, state => state.addressTypes);

export const projectTypesDropdownValues = createSelector(dropdownValues, state => state.projectTypesOptions);
export const projectStatusDropdownValues = createSelector(dropdownValues, state => state.projectStatusesOptions);

export const maritalStatusesDropdownValues = createSelector(dropdownValues, state => state.maritalStatuses);
export const genderDropdownValues = createSelector(dropdownValues, state => state.genders);
export const phoneTypesDropdownValues = createSelector(dropdownValues, state => state.phoneTypes);

export const personRelationshipTypeValues = createSelector(dropdownValues, state => state.personRelationshipTypes);
export const personRepresentativeTypesValues = createSelector(dropdownValues, state => state.personRepresentativeTypes);

export const organizationTypeDropdownValues = createSelector(dropdownValues, state => state.organizationTypes);
export const bankAccountTypesDropdownValues = createSelector(dropdownValues, state => state.bankAccountTypes);

export const mailTrackingNumberTypesDropdownValues = createSelector(dropdownValues, state => state.mailTrackingNumberType);

export const clientFinalizedStatuses = createSelector(dropdownValues, state => state.clientFinalizedStatuses);
export const lienPhases = createSelector(dropdownValues, state => state.lienPhases);
export const lienTypeGroups = createSelector(dropdownValues, state => state.lienTypeGroups);

export const entityStatuses = createSelector(selectFeature, state => state.entityStatuses);
export const electionFormStatusOptions = createSelector(dropdownValues, state => state.electionFormStatusOptions);
export const batchPaymentsOptions = createSelector(dropdownValues, state => state.batchPaymentsOptions);
export const frequencyOptions = createSelector(dropdownValues, state => state.frequencyOptions);

const gridSettings = createSelector(selectFeature, state => state.gridSettings);
const gridLocalData = createSelector(selectFeature, state => state.gridLocalData);

export const gridSettingByGridId = (props: { gridId: string }) => createSelector(
  gridSettings,
  (state: IGridSettingsMap) => state[props.gridId],
);
export const gridLocalDataByGridId = (props: { gridId: GridId }) => createSelector(
  gridLocalData,
  (state: IGridLocalDataMap) => state[props.gridId],
);
export const isAllRowSelectedByGridId = (props: { gridId: GridId }) => createSelector(
  gridLocalData,
  (state: IGridLocalDataMap) => state[props.gridId]?.isAllRowSelected,
);
export const isSomeRowSelectedByGridId = (props: { gridId: GridId }) => createSelector(
  gridLocalData,
  state => {
    const data: IGridLocalData = state[props.gridId];
    return !!data?.selectedRecordsIds && [...data.selectedRecordsIds.values()].some(entry => entry);
  },
);
export const getGridStorageData = createSelector(selectFeature, state => state.gridStorageData);

export const loadingInProgress = createSelector(selectFeature, state => (state.loadingInProgress ? state.loadingInProgress.count() > 0 : false));

export const statuses = createSelector(selectFeature, state => state.statusesByEntityType);

export const statusesByEntityType = (props: { entityType: EntityTypeEnum }) => createSelector(
  selectFeature,
  (state: RootState) => state.statusesByEntityType.getValue(props.entityType) ?? [],
);

export const billToOptions = createSelector(dropdownValues, state => state.billToOptions ?? []);
export const quickSearchResults = createSelector(selectFeature, state => state.quickSearchResults);

export const selectBanner = createSelector(selectFeature, state => state.banner);
export const isBannerClosed = createSelector(selectFeature, state => state.isBannerClosed);
