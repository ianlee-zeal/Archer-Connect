import { Note } from '@app/models/note';
import { ISortModel } from '@app/state/root.state';

export interface NotesListSearchParams {
  searchOptions: {
    startRow: number,
    endRow: number,
    sortModel: ISortModel[],
  };
  entityId: number;
  entityTypeIds: number[];
}

export interface SharedNotesListState {
  error: string;
  searchParams: NotesListSearchParams;
  notes: Note[];
  totalCount: number;
  editableNote: Note;
  hasChanges: boolean;
  isAllNotesExpanded: boolean;
}

export const initialState: SharedNotesListState = {
  error: null,
  searchParams: {
    searchOptions: null,
    entityId: null,
    entityTypeIds: null,
  },
  totalCount: null,
  notes: null,
  editableNote: null,
  isAllNotesExpanded: true,
  hasChanges: false,
};
