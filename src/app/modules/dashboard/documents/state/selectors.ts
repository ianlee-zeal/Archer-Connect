import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as documentsReducer from './reducer';

const featureSelector = createFeatureSelector<documentsReducer.DocumentTypesState>('document_types_feature');

export const actionBar = createSelector(featureSelector, state => state.actionBar);
export const agGridParams = createSelector(featureSelector, state => state.agGridParams);
export const documentType = createSelector(featureSelector, state => state.documentType);
export const productCategories = createSelector(featureSelector, state => state.productCategories);
export const entityTypes = createSelector(featureSelector, state => state.entityTypes);
