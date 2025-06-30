import { createReducer, Action, on } from '@ngrx/store';
import * as actions from './actions';
import { DocumentType } from '../../../../models/documents/document-type';

export interface DragDropMultipleState {
  error: any,
  allDocumentTypes: DocumentType[],
}

const dragDropMultipleInitialState: DragDropMultipleState = {
  error: null,
  allDocumentTypes: null,
};

const dragDropMultipleReducer = createReducer(
  dragDropMultipleInitialState,

  on(actions.GetDocumentTypesList, state => ({ ...state, error: null, allDocumentTypes: null })),
  on(actions.GetDocumentTypesListComplete, (state, { allDocumentTypes }) => ({ ...state, allDocumentTypes })),

);

export function DragDropMultipleReducer(state: DragDropMultipleState | undefined, action: Action) {
  return dragDropMultipleReducer(state, action);
}
