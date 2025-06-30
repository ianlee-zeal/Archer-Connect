import { EntityTypeEnum } from '@app/models/enums';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SharedModuleState, FEATURE_NAME } from '../shared.state';
import { SharedSavedSearchState } from './reducer';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const savedSearchSelector = createSelector(sharedFeature, state => state.savedSearch);

export const savedSearchSelectors = {
  entireState: savedSearchSelector,
  savedSearchListByEntityType: createSelector(savedSearchSelector, state => state.savedSearchListByEntityType),
  savedSearchList: createSelector(savedSearchSelector, state => (state.showSavedSearchListByEntityType ? state.savedSearchListByEntityType : state.savedSearchList)),
  isCurrentSearchEdited: createSelector(savedSearchSelector, state => state.isCurrentSearchEdited),
  orgUsersOptions: createSelector(savedSearchSelector, state => state.orgUsersOptions),
  agGridParams: createSelector(savedSearchSelector, state => state.agGridParams),
  removedSearches: createSelector(savedSearchSelector, state => state.removedSearches),
  currentSearchByEntityType: (props: { entityType: EntityTypeEnum }) => createSelector(
    savedSearchSelector,
    (state: SharedSavedSearchState) => state.currentSearchByEntityType.getValue(props.entityType) ?? null,
  ),
};
