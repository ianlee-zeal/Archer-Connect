import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { withLatestFrom, mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import * as services from '@app/services';
import { Note } from '@app/models/note';
import { MessageService } from '@app/services/message.service';
import { ToastService } from '@app/services';
import * as rootActions from '@app/state/root.actions';
import { notesListSelectors } from './selectors';
import { SharedNotesListState } from './state';
import * as notesListActions from './actions';

@Injectable()
export class NotesListEffects {
  constructor(
    private notesService: services.NotesService,
    private store: Store<SharedNotesListState>,
    private actions$: Actions,
    private messageService: MessageService,
    private toaster: ToastService,
  ) { }

  getNotesList$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.GetNotesList),
    mergeMap(action => this.notesService.getList(action.searchParams).pipe(
      switchMap((response: any) => {
        const notes = response.items.map(item => Note.toModel(item));
        const totalCount: number = response.totalRecordsCount;

        return [notesListActions.GetNotesListComplete({
          notes,
          totalCount,
          keepUnsaved: true,
        }),
        rootActions.LoadingFinished({ actionName: notesListActions.GetNotesList.type }),
        ];
      }),
      catchError(error => of(notesListActions.GetNotesListError({ error }))),
    )),
  ));

  refreshNotesList$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.RefreshNotesList),
    withLatestFrom(this.store.select(notesListSelectors.entireState)),
    switchMap(([, entireState]) => [
      notesListActions.GetNotesList({ searchParams: entireState.searchParams }),
    ]),
  ));

  getNotesListError$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.GetNotesListError),
    tap(action => {
      console.error(action.error); // eslint-disable-line no-console
    }),
  ), { dispatch: false });

  saveNote$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.SaveEditableNote),
    withLatestFrom(this.store.select(notesListSelectors.editableNote)),
    switchMap(([, editableNote]) => {
      const validationError = Note.validate(editableNote);
      if (validationError) {
        return [
          notesListActions.SaveEditableNoteError({ error: validationError }),
        ];
      }
      if (editableNote.id) {
        return [
          notesListActions.UpdateNote({ note: editableNote }),
        ];
      }

      return [
        notesListActions.CreateNewNote({ note: editableNote }),
      ];
    }),
  ));

  saveEditableNoteError$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.SaveEditableNoteError),
    tap(action => this.toaster.showError('Note is not valid', action.error)),
  ), { dispatch: false });

  createNewNote$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.CreateNewNote),
    mergeMap(action => this.notesService.create(Note.toDto(action.note)).pipe(
      switchMap(() => {
        this.toaster.showSuccess('Note successfully added');

        return [
          notesListActions.CreateNewNoteComplete(),
          notesListActions.CloseEditMode(),
          notesListActions.RefreshNotesList(),
        ];
      }),
      catchError(error => of(notesListActions.CreateNewNoteError({ error }))),
    )),
  ));

  createNewNoteSilently$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.CreateNewNoteSilently),
    mergeMap(action => this.notesService.create(action.note).pipe(
      switchMap(() => {
        return [
          notesListActions.CreateNewNoteComplete(),
        ];
      }),
      catchError(error => of(notesListActions.CreateNewNoteError({ error }))),
    )),
  ));

  createNewNoteError$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.CreateNewNoteError),
    tap(action => this.toaster.showError(action.error)),
  ), { dispatch: false });

  updateNote$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.UpdateNote),
    mergeMap(action => this.notesService.update(Note.toDto(action.note)).pipe(
      switchMap(() => {
        this.toaster.showSuccess('Note successfully updated');

        return [
          notesListActions.UpdateNoteComplete(),
          notesListActions.CloseEditMode(),
          notesListActions.RefreshNotesList(),
        ];
      }),
      catchError(error => of(notesListActions.UpdateNoteError({ error }))),
    )),
  ));

  updateNoteError$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.CreateNewNoteError, notesListActions.UpdateNoteError),
    tap(action => this.toaster.showError(action.error)),
  ), { dispatch: false });

  deleteNoteConfirm$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.DeleteNote),
    mergeMap(action => this.messageService.showDeleteConfirmationDialog('Confirm delete', 'Are you sure you want to delete this note?').pipe(
      switchMap(answer => {
        if (!answer) {
          return [];
        }

        return [
          notesListActions.DeleteNoteRequest({ id: action.id, entityTypeId: action.entityTypeId }),
        ];
      }),
    )),
  ));

  deleteNote$ = createEffect((): any => this.actions$.pipe(
    ofType(notesListActions.DeleteNoteRequest),
    mergeMap(action => this.notesService.deleteNote(action.id, action.entityTypeId).pipe(
      switchMap(() => [
        notesListActions.DeleteNoteRequestComplete(),
        notesListActions.RefreshNotesList(),
      ]),
      catchError(error => of(notesListActions.Error({ error }))),
    )),
  ));

  deleteNoteSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(notesListActions.DeleteNoteRequestComplete),
    tap(() => {
      this.toaster.showSuccess('Note was successfully removed');
    }),
  ), { dispatch: false });
}
