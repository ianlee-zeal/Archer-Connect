import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const notesListSelector = createSelector(sharedFeature, state => state.notesList);
const notesList = createSelector(notesListSelector, state => state.notes);
const editableNote = createSelector(notesListSelector, state => state.editableNote);
const isEditMode = createSelector(editableNote, state => state !== null);
const isAllNotesExpanded = createSelector(notesListSelector, state => state.isAllNotesExpanded);
const hasChanges = createSelector(notesListSelector, state => state.hasChanges);
const totalCount = createSelector(notesListSelector, state => state.totalCount);

export const notesListSelectors = {
  entireState: notesListSelector,
  searchParams: createSelector(notesListSelector, state => state.searchParams),
  notes: notesList,
  totalCount,
  note: createSelector(notesListSelector, (state, props) => state.find(note => note.id === props.id)),
  isEditMode,
  editableNote,
  isAllNotesExpanded,
  hasChanges,
};
