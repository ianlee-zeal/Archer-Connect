import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import * as services from '@app/services';
import { DocumentType } from '@app/models/documents/document-type';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ToastService } from '@app/services';
import * as actions from './actions';
import * as selectors from './selectors';
import { DocumentTypesState } from './reducer';
import { RefreshDocumentTypesList } from './actions';

@Injectable()
export class DocumentsEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<DocumentTypesState>,
    private documentTypesService: services.DocumentTypesService,
    private productCategoriesService: services.ProductCategoriesService,
    private entityTypesService: services.EntityTypesService,
    private toastService: ToastService,
  ) { }


  getDocumentTypesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentTypesList),
    mergeMap(action => this.documentTypesService.search(action.agGridParams.request).pipe(
      switchMap(response => {
        const documentTypes = response.items.map(item => DocumentType.toModel(item));
        return [
          actions.GetDocumentTypesListComplete({
            documentTypes,
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          }),
        ];
      }),
      catchError(error => of(actions.GetDocumentTypesListError({ errorMessage: error, agGridParams: action.agGridParams }))),
    )),
  ));


  GetDocumentTypeById$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentTypeById),
    mergeMap(
      action => this.documentTypesService.getDocumentTypeById(action.id).pipe(
        switchMap(response => {
          const documentType = DocumentType.toModel(response);
          return [
            actions.GetDocumentTypeByIdComplete({ documentType }),
          ];
        }),
      ),
    ),
  ));


  getProductCategoryDropdown$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProductCategoriesRequest),
    mergeMap(() => this.productCategoriesService.getDropdownProductCategories().pipe(
      switchMap((productCategories: SelectOption[]) => [
        actions.GetProductCategoriesComplete({ productCategories }),
      ]),
      catchError(errorMessage => of(actions.Error({ errorMessage }))),
    )),
  ));


  getEntityTypesRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetEntityTypesRequest),
    mergeMap(() => this.entityTypesService.getDocumentTypes().pipe(
      switchMap((entityTypes: SelectOption[]) => [
        actions.GetEntityTypesComplete({ entityTypes }),
      ]),
      catchError(errorMessage => of(actions.Error({ errorMessage }))),
    )),
  ));


  createDocumentType$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateDocumentType),
    mergeMap(action => this.documentTypesService.post(action.documentType).pipe(
      switchMap(() => [
        RefreshDocumentTypesList(),
        actions.CreateDocumentTypeComplete(),
      ]),
      catchError(({ error }) => of(actions.Error({ errorMessage: error }))),
    )),
  ));


  updateDocumentType$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateDocumentType),
    mergeMap(action => this.documentTypesService.put(action.documentType).pipe(
      switchMap(() => [
        actions.RefreshDocumentTypesList(),
        actions.UpdateDocumentTypeComplete(),
      ]),
      catchError(({ error }) => of(actions.Error({ errorMessage: error }))),
    )),
  ));


  refreshAddressesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshDocumentTypesList),
    withLatestFrom(this.store$.select(selectors.agGridParams)),
    switchMap(([, agGridParams]) => [
      actions.GetDocumentTypesList({ agGridParams }),
      actions.RefreshDocumentTypesComplete(),
    ]),
  ));


  updateDocumentTypeComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateDocumentTypeComplete),
    tap(() => { this.toastService.showSuccess('Document type successfully updated'); }),
  ), { dispatch: false });


  saveAddressComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateDocumentTypeComplete),
    tap(() => this.toastService.showSuccess('Document type successfully created')),
  ), { dispatch: false });


  getDocumentTypesListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentTypesListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.documentTypes, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });


  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(action => {
      this.toastService.showError(action.errorMessage);
    }),
  ), { dispatch: false });
}
