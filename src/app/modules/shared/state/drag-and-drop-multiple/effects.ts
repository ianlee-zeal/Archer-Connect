import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as services from '@app/services';
import { DocumentType } from '@app/models/documents/document-type';
import { ToastService } from '@app/services';
import { SearchOptionsHelper } from '@app/helpers';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import * as actions from './actions';

@Injectable()
export class DragDropMultipleEffects {
  constructor(
    private actions$: Actions,
    private documentTypesService: services.DocumentTypesService,
    private toastService: ToastService,
  ) { }

  getDocumentTypesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentTypesList),
    mergeMap(() => this.documentTypesService.search({ ...SearchOptionsHelper.getFilterRequest([SearchOptionsHelper.getBooleanFilter('isActive', FilterTypes.Boolean, 'equals', true)]), startRow: 0, endRow: -1 }).pipe(
      switchMap(response => {
        const allDocumentTypes = response.items.map(item => DocumentType.toModel(item));
        return [
          actions.GetDocumentTypesListComplete({ allDocumentTypes }),
        ];
      }),
      catchError(error => of(actions.GetDocumentTypesListError({ errorMessage: error }))),
    )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(action => {
      this.toastService.showError(action.errorMessage);
    }),
  ), { dispatch: false });
}
