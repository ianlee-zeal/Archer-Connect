import { createAction, props } from '@ngrx/store';

import { Note, NoteDto } from '@app/models/note';
import { NotesListSearchParams } from './state';

export const Error = createAction('[Shared Notes List] Notes API Error', props<{ error: string }>());

export const GetNotesList = createAction('[Shared Notes List] Get Notes List', props<{ searchParams: NotesListSearchParams }>());
export const GetNotesListComplete = createAction('[Shared Notes List] Get Notes List Complete', props<{ notes: Note[], totalCount: number, keepUnsaved?: boolean }>());
export const GetNotesListError = createAction('[Shared Notes List] Get Notes List Error', props<{ error: string }>());
export const RefreshNotesList = createAction('[Shared Notes List] Refresh Notes List');

export const CreateNewNote = createAction('[Shared Notes List] Create New Note', props<{ note: Note }>());
export const CreateNewNoteSilently = createAction('[Shared Notes List] Create New Note Silently', props<{ note: NoteDto }>());
export const CreateNewNoteComplete = createAction('[Shared Notes List] Create New Note Complete');
export const CreateNewNoteError = createAction('[Shared Notes List] Create New Note Error', props<{ error: string }>());

export const UpdateNote = createAction('[Shared Notes List] Update Note', props<{ note: Note }>());
export const UpdateNoteComplete = createAction('[Shared Notes List] Update Note Complete');
export const UpdateNoteError = createAction('[Shared Notes List] Update Note Error', props<{ error: string }>());

export const AddNewNote = createAction('[Shared Notes List] Add New Note', props<{ note: Note }>());
export const EditExistingNote = createAction('[Shared Notes List] Edit Existing Note', props<{ note: Note }>());
export const CloseEditMode = createAction('[Shared Notes List] Close Edit Mode');
export const UpdateEditableNote = createAction('[Shared Notes List] Update Editable Note', props<{ note: Note }>());
export const SaveEditableNote = createAction('[Shared Notes List] Save Editable Note');
export const SaveEditableNoteError = createAction('[Shared Notes List] Save Editable Note Error', props<{ error: string }>());
export const NoteHasChanges = createAction('[Shared Notes List] Note Has Changes', props<{ hasChanges: boolean }>());

export const DeleteNote = createAction('[Shared Notes List] Delete Note', props<{ id: number, entityTypeId: number }>());
export const DeleteNoteRequest = createAction('[Shared Notes List] Delete Selected Notes Request', props<{ id: number, entityTypeId: number }>());
export const DeleteNoteRequestComplete = createAction('[Shared Notes List] Delete Selected Notes Request Complete');

export const ExpandAllNotes = createAction('[Shared Notes List] Expand All Notes', props<{ expand: boolean }>());
