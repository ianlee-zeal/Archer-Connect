import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SelectHelper } from '@app/helpers/select.helper';
import { CallCenterState } from '../../state/reducer';
import { FEATURE_NAME } from '../../state';

const callCenterFeature = createFeatureSelector<CallCenterState>(FEATURE_NAME);
const selectFeature = createSelector(callCenterFeature, state => state.communication);
const communicationRecord = createSelector(selectFeature, state => state.detailsPage.currentCommunicationRecord);

export const communicationSelectors = {
  currentCommunicationRecord: communicationRecord,
  currentCommunicationRelatedDocumentsCount: createSelector(communicationRecord, state => state?.relatedDocumentsCount || 0),
  communicationDirectionsOptions: createSelector(selectFeature, state => SelectHelper.toOptions(state.communicationDirections, option => option.id, option => option.displayName)),
  communicationMethodsOptions: createSelector(selectFeature, state => SelectHelper.toOptions(state.communicationMethods, option => option.id, option => option.displayName)),
  communicationSubjectsOptions: createSelector(selectFeature, state => SelectHelper.toOptions(state.communicationSubjects, option => option.id, option => option.displayName)),
  communicationPartiesOptions: createSelector(selectFeature, state => SelectHelper.toOptions(state.communicationParties, option => option.id, option => option.displayName)),
  communicationResultsOptions: createSelector(selectFeature, state => SelectHelper.toOptions(state.communicationResults, option => option.id, option => option.displayName)),
  communicationLevelsOptions: createSelector(selectFeature, state => state.levels),
  communicationSentimentsOptions: createSelector(selectFeature, state => state.sentiments),
  communicationContactsOptions: createSelector(selectFeature, state => state.contacts),
  canEditCommunication: createSelector(selectFeature, state => state.canEditCommunication),
  attachedEmails: createSelector(selectFeature, state => state.attachedEmails),
  email: createSelector(selectFeature, state => state.email),

  actionBar: createSelector(selectFeature, state => state.actionBar),
};
