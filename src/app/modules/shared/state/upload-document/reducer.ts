import { createReducer, on, Action } from '@ngrx/store';

import { Document } from '@app/models/documents/document';
import * as UploadDocumentActions from './actions';
import { SelectOption } from '../../_abstractions/base-select';
import { IdValue } from '@app/models';

export interface SharedDocumentUploadState {
  file: File,
  document: Document,
  error: any,

  orgsOptions: SelectOption[],
  orgsOptionsLoading: boolean,
  defaultOrgs: IdValue[],
}

const initialState: SharedDocumentUploadState = {
  file: null,
  document: null,
  error: null,

  orgsOptions: null,
  orgsOptionsLoading: false,
  defaultOrgs: null,
};

// main reducer function
const sharedDocumentUploadReducer = createReducer(
  initialState,

  on(UploadDocumentActions.CreateDocument, (state, { file, document }) => ({
    ...state, error: null, file, document,
  })),
  on(UploadDocumentActions.CreateDocumentComplete, state => ({
    ...state, file: null, document: null, error: null,
  })),
  on(UploadDocumentActions.DocumentError, (state, { error }) => ({
    ...state, error, file: null, document: null,
  })),
  on(UploadDocumentActions.ResetCreateDocumentState, state => ({
    ...state,
    file: null,
    document: null,
    error: null,
    orgsOptionsLoading: false,
    defaultOrgs: null,
    orgsOptions: null,
  })),
  on(UploadDocumentActions.GetOrgsOptionsRequest, state => ({
    ...state, orgsOptionsLoading: true,
  })),
  on(UploadDocumentActions.GetOrgsOptionsError, state => ({
    ...state, orgsOptionsLoading: false,
  })),
  on(UploadDocumentActions.GetOrgsOptionsComplete, (state, { orgsOptions }) => {
    return {
      ...state,
      orgsOptions: [...orgsOptions],
      orgsOptionsLoading: false,
    };
  }),
  on(UploadDocumentActions.LoadDefaultOrgsError, state => ({
    ...state, defaultOrgs: null,
  })),
  on(UploadDocumentActions.LoadDefaultOrgsComplete, (state, { defaultOrgs }) => {
    return {
      ...state,
      defaultOrgs,
    };
  }),
);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedDocumentUploadReducer(state: SharedDocumentUploadState | undefined, action: Action) {
  return sharedDocumentUploadReducer(state, action);
}
