import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { mergeMap, switchMap, catchError, tap, map } from 'rxjs/operators';

import { Document } from '@app/models/documents/document';
import { ToastService, DocumentsService } from '@app/services';
import * as documentDetailsActions from './actions';
import * as documentsListActions from '../documents-list/actions';

@Injectable()
export class DocumentDetailsEffects {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly actions$: Actions,
    private readonly toaster: ToastService,
  ) { }

  updateDocumentDetails$ = createEffect(() => this.actions$.pipe(
    ofType(documentDetailsActions.SaveUpdatedDocument),
    mergeMap(action => this.documentsService.updateDocument(Document.toDto(action.document), action.file, true).pipe(
      switchMap(response => [
        documentDetailsActions.SaveUpdatedDocumentComplete({ updatedDocument: Document.toModel(response), onDocumentUpdated: action.onDocumentUpdated }),
      ]),
      catchError(error => of(documentDetailsActions.DocumentDetailsError({ errorMessage: error }))),
    )),
  ));

  updateDocumentSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(documentDetailsActions.SaveUpdatedDocumentComplete),
    tap(action => {
      action.onDocumentUpdated(action.updatedDocument);
      this.toaster.showSuccess('Document was updated');
    }),
  ), { dispatch: false });

  deleteDocument$ = createEffect(() => this.actions$.pipe(
    ofType(documentDetailsActions.DeleteDocument),
    mergeMap(action => this.documentsService.deleteDocument(action.documentId).pipe(
      switchMap(() => [
        documentDetailsActions.DeleteDocumentComplete({ onDocumentDeleted: action.onDocumentDeleted }),
        documentsListActions.RefreshDocumentsList(),
      ]),
      catchError(error => of(documentDetailsActions.DocumentDetailsError({ errorMessage: error }))),
    )),
  ));

  deleteDocumentSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(documentDetailsActions.DeleteDocumentComplete),
    tap(action => {
      action.onDocumentDeleted();
      this.toaster.showSuccess('Document was deleted');
    }),
  ), { dispatch: false });

  redirectToDocumentsList$ = createEffect(() => this.actions$.pipe(
    ofType(documentDetailsActions.RedirectToDocumentsList),
    tap(action => {
      action.callback();
    }),
  ), { dispatch: false });

  error$ = createEffect(() => this.actions$.pipe(
    ofType(
      documentDetailsActions.DocumentDetailsError,
    ),
    map(({ errorMessage }) => [this.toaster.showError(errorMessage)]),
  ), { dispatch: false });
}
