import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FEATURE_NAME, MedicalLiensState } from '../../state/shared.state';

const medicalLiensFeature = createFeatureSelector<MedicalLiensState>(FEATURE_NAME);
const medicalLiensListSelector = createSelector(medicalLiensFeature, state => state.medicalLiensList);
const medicalLiensList = createSelector(medicalLiensListSelector, state => state.medicalLiens);

export const medicalLiensListSelectors = {
  entireState: medicalLiensListSelector,
  medicalLiensList,
  agGridParams: createSelector(medicalLiensListSelector, state => state.agGridParams),
};
