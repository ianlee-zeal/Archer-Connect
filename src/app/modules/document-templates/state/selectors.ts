/* eslint-disable implicit-arrow-linebreak */
import { DocumentType } from '@app/models/enums';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DocumentTemplatesState } from './reducer';

const documentTemplatesFeature = createFeatureSelector<DocumentTemplatesState>('document-templates_feature');
const selectFeature = createSelector(documentTemplatesFeature, state => state);

export const documentTemplates = createSelector(selectFeature, state => state.documentTemplates);
export const gridParams = createSelector(selectFeature, state => state.gridParams);
export const actionBar = createSelector(selectFeature, state => state.actionBar);

export const documentTypes = createSelector(selectFeature, state => state.documentTypes);
export const documentStatuses = createSelector(selectFeature, state => state.documentStatuses);
export const allDocumentStatuses = createSelector(selectFeature, state => state.allDocumentStatuses);

export const selectDocusignResponse = createSelector(
  selectFeature,
  (state: DocumentTemplatesState) => state.docusignResponse
);

export const getDocusignDefaults = createSelector(
  selectFeature,
  (state: DocumentTemplatesState) => state.docusignTemplateDefaults
);

export const documentTemplatesDropdownValues = (documentType: DocumentType) =>
  createSelector(selectFeature, state => (state.documentTypesDropdownValues ? state.documentTypesDropdownValues.getValue(documentType) : null));