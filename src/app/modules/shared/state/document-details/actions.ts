import { createAction, props } from '@ngrx/store';

import { Document } from '@app/models/documents/document';
import { ActionHandlersMap } from '../../action-bar/action-handlers-map';

export const DocumentDetailsError = createAction('[Shared Document Details] API Error', props<{ errorMessage: string }>());
export const UpdateActionBar = createAction('[Shared Document Details] Update Action Bar', props<{ actionBar: ActionHandlersMap }>());
export const SetOnCancelAction = createAction('[Shared Document Details] Set OnCancel Action', props<{ onCancelAction:() => void }>());

export const SaveUpdatedDocument = createAction('[Shared Document Details] Save Updated Document', props<{ document: Document, file: File, onDocumentUpdated:(document: Document) => void }>());
export const SaveUpdatedDocumentComplete = createAction('[Shared Document Details] Save Updated Document Complete', props<{ updatedDocument: Document, onDocumentUpdated:(document: Document) => void }>());

export const DeleteDocument = createAction('[Shared Document Details] Delete Document', props<{ documentId: number, onDocumentDeleted:() => void }>());
export const DeleteDocumentComplete = createAction('[Shared Document Details] Delete Document Complete', props<{ onDocumentDeleted:() => void }>());

export const RedirectToDocumentsList = createAction('[Shared Document Details] Redirect to Documents List', props<{ callback: any }>());
