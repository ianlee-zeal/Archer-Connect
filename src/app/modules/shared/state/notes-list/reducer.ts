import { createReducer, on, Action } from '@ngrx/store';

import { Note } from '@app/models/note';
import * as notesListActions from './actions';
import { SharedNotesListState, initialState } from './state';

// main reducer function
const sharedNotesListReducer = createReducer(
  initialState,

  on(notesListActions.GetNotesList, (state, { searchParams }) => ({
    ...state,
    searchParams,
    notes: state.notes?.filter(note => !note.id),
    error: null,
  })),
  on(notesListActions.GetNotesListError, (state, { error }) => ({ ...state, error })),
  on(notesListActions.GetNotesListComplete, (state, { notes, totalCount, keepUnsaved }) => ({
    ...state,
    totalCount,
    notes: keepUnsaved
      ? (state.notes || []).filter(note => !note.id).concat(notes)
      : notes,
    error: null
  })),

  on(notesListActions.AddNewNote, (state, { note }) => ({ ...state, notes: [note, ...state.notes], editableNote: note })),
  on(notesListActions.EditExistingNote, (state, { note }) => ({ ...state, editableNote: note })),
  on(notesListActions.CloseEditMode, state => ({ ...state, notes: state.notes?.filter((note: Note) => note.id), editableNote: null })),
  on(notesListActions.UpdateEditableNote, (state, { note }) => ({ ...state, editableNote: note })),
  on(notesListActions.NoteHasChanges, (state, { hasChanges }) => ({ ...state, hasChanges })),

  on(notesListActions.ExpandAllNotes, (state, { expand }) => ({ ...state, isAllNotesExpanded: expand })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedNotesListReducer(state: SharedNotesListState | undefined, action: Action) {
  return sharedNotesListReducer(state, action);
}
