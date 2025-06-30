import { createFeatureSelector, createSelector } from '@ngrx/store';

import { FEATURE_NAME } from '../../state';
import { CallCenterState } from '../../state/reducer';
import { SelectHelper } from '@app/helpers/select.helper';

// State selectors
const selectFeature = createFeatureSelector<CallCenterState>(FEATURE_NAME);

export const callInfo = createSelector(selectFeature, state => state.widget.callInfo);
export const callInProgress = createSelector(selectFeature, state => state.widget.callInProgress);
export const saveCallInProgress = createSelector(selectFeature, state => state.widget.saveCallInProgress);

export const communicationDirectionsOptions = createSelector(selectFeature, state =>
    SelectHelper.toOptions(state.widget.communicationDirections, option => option.id, option => option.displayName));

export const communicationSubjectsOptions = createSelector(selectFeature, state =>
    SelectHelper.toOptions(state.widget.communicationSubjects, option => option.id, option => option.displayName));

export const communicationPartiesOptions = createSelector(selectFeature, state =>
    SelectHelper.toOptions(state.widget.communicationParties, option => option.id, option => option.displayName));

export const communicationResultsOptions = createSelector(selectFeature, state =>
    SelectHelper.toOptions(state.widget.communicationResults, option => option.id, option => option.displayName));

export const error = createSelector(selectFeature, state => state.widget.error);
