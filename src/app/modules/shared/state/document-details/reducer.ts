import { createReducer, on, Action } from '@ngrx/store';

import { Document } from '@app/models/documents/document';
import * as documentDetailsActions from './actions';

import { ActionHandlersMap } from '../../action-bar/action-handlers-map';

export interface SharedDocumentDetailsState {
  error: any,
  pending: boolean,
  document: Document,
  documentDetailsHeader: Document,
  file: File,
  isDocumentValid: boolean,
  actionBar: ActionHandlersMap,
  onCancelAction: () => void,
}

const initialState: SharedDocumentDetailsState = {
  error: null,
  pending: false,
  document: null,
  documentDetailsHeader: null,
  file: null,
  isDocumentValid: false,
  actionBar: null,
  onCancelAction: null,
};

// main reducer function
const sharedDocumentDetailsReducer = createReducer(
  initialState,
  on(documentDetailsActions.DocumentDetailsError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(documentDetailsActions.SaveUpdatedDocument, state => ({ ...state, pending: true })),
  on(documentDetailsActions.SaveUpdatedDocumentComplete, (state, { updatedDocument }) => ({ ...state, pending: false, document: updatedDocument, documentDetailsHeader: updatedDocument })),

  on(documentDetailsActions.DeleteDocument, state => ({ ...state, pending: true })),
  on(documentDetailsActions.DeleteDocumentComplete, state => ({ ...state, pending: false })),

  on(documentDetailsActions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(documentDetailsActions.SetOnCancelAction, (state, { onCancelAction }) => ({ ...state, onCancelAction })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedDocumentDetailsReducer(state: SharedDocumentDetailsState | undefined, action: Action) {
  return sharedDocumentDetailsReducer(state, action);
}
