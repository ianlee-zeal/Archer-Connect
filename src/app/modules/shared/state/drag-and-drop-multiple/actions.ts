import { createAction, props } from '@ngrx/store';

const featureName = '[Drag Drop Multiple]';

export const GetDocumentTypesList = createAction(`${featureName} Get Document Types List`);
export const GetDocumentTypesListComplete = createAction(`${featureName} Get Document Types List Complete`, props<{ allDocumentTypes: any[] }>());
export const GetDocumentTypesListError = createAction(`${featureName} Get Document Types List Error`, props<{ errorMessage: string }>());

export const Error = createAction(`${featureName} Error`, props<{ errorMessage: string }>());
