import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromDocumentIntake from './reducer';

const featureSelector = createFeatureSelector<fromDocumentIntake.DocumentIntakeState>('document_intake_feature');

const common = createSelector(featureSelector, state => state.common);

export const error = createSelector(common, state => state.error);
export const actionBar = createSelector(common, state => state.actionBar);
export const agGridParams = createSelector(common, state => state.agGridParams);
