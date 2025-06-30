import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { mergeMap, switchMap, catchError, tap, withLatestFrom, map } from 'rxjs/operators';

import { Document } from '@app/models/documents/document';
import { DocumentType } from '@app/models/documents/document-type';
import * as services from '@app/services';
import { ProductCategoryDto } from '@app/models/product-workflow/product-category-dto';
import { EntityType } from '@app/models/entity-type';
import { Page } from '@app/models/page';
import { EntityTypeEnum } from '@app/models/enums';
import { AuditorService } from '@app/services';
import * as documentsListActions from './actions';
import { SharedDocumentsListState } from './reducer';
import { documentsListSelectors } from './selectors';
import { DocumentListService } from '../../services/document-list.service';
import { authSelectors } from '@app/modules/auth/state';

@Injectable()
export class DocumentsListEffects {
  constructor(
    private documentsService: services.DocumentsService,
    private documentListService: DocumentListService,
    private productCategoriesService: services.ProductCategoriesService,
    private documentTypesService: services.DocumentTypesService,
    private entityTypesService: services.EntityTypesService,
    private store: Store<SharedDocumentsListState>,
    private actions$: Actions,
    private toaster: services.ToastService,
    private readonly auditorService: AuditorService
  ) { }

  getAGDocumentsList$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.GetDocumentsList),
    withLatestFrom(
      this.store.select(documentsListSelectors.entireState), this.store.select(authSelectors.isCurrentOrgMaster)
    ),
    mergeMap(([action, entireState, isMaster]: [any, SharedDocumentsListState, boolean]) => {
      return this.documentListService.callDocumentListApi(action.agGridParams, entireState, isMaster)
      .pipe(
        switchMap((response: Page<Document>) => [
          documentsListActions.GetDocumentsListComplete({
            documents: response.items.map(Document.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount
          })
        ]),
        catchError(error =>
          of(documentsListActions.GetDocumentsListError({
            errorMessage: error,
            agGridParams: action.agGridParams
          }))
        )
      );
    })
  ));

  refreshDocumentsList$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.RefreshDocumentsList),
    withLatestFrom(this.store.select(documentsListSelectors.entireState)),
    switchMap(([, entireState]) => [
      documentsListActions.GetDocumentsList({ agGridParams: entireState.agGridParams }),
    ]),
  ));

  getAGDocumentsListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.GetDocumentsListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.documents, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getAGDocumentsListError$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.GetDocumentsListError),
    tap(action => {
      console.error(action.errorMessage); // eslint-disable-line no-console
      action.agGridParams.fail();
    }),
  ), { dispatch: false });

  getProductCategoriesDropdownValues$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.GetProductCategoriesRequest),
    mergeMap(() => this.productCategoriesService.getProductCategoryList().pipe(
      switchMap(productCategories => {
        const categories = productCategories.map(ProductCategoryDto.toModel);

        return [
          documentsListActions.GetProductCategoriesSuccess({ productCategories: categories }),
        ];
      }),
      catchError(error => of(documentsListActions.DocumentsListError({ errorMessage: error }))),
    )),
  ));

  getDocumentTypesDropdownValues$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.GetDocumentTypesByEntityId),
    withLatestFrom(this.store.select(documentsListSelectors.entireState)),
    mergeMap(
      ([
        { entityTypeId, additionalDocumentTypeId },
        entireState,
      ]: [
        { entityTypeId: EntityTypeEnum, additionalDocumentTypeId?: number },
        SharedDocumentsListState]) => this.documentTypesService.getDocumentTypesList(entireState.searchParams.entityTypeIdToFilterDocTypes ?? entityTypeId, additionalDocumentTypeId).pipe(
        switchMap((documentTypes: DocumentType[]) => [
          documentsListActions.GetDocumentTypesByEntityIdComplete({ documentTypes: documentTypes.map((documentType: DocumentType) => DocumentType.toModel(documentType)) }),
        ]),
        catchError((error: string) => of(documentsListActions.DocumentsListError({ errorMessage: error }))),
      ),
    ),
  ));

  getDocumentTypesByCategoryIdDropdownValues$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.GetDocumentTypeByCategoryIdRequest),
    mergeMap(({ productCategoryId, entityTypeId }) => this.documentTypesService.getDocumentTypesListByProductCategoryId(productCategoryId, entityTypeId).pipe(
      switchMap(documentTypesByCategoryId => [
        documentsListActions.GetDocumentTypeByCategoryIdSuccess({ documentTypesByCategoryId }),
      ]),
      catchError(error => of(documentsListActions.DocumentsListError({ errorMessage: error }))),
    )),
  ));

  getEntityTypesRequest$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.GetEntityTypesRequest),
    mergeMap(() => this.entityTypesService.getDocumentTypes().pipe(
      switchMap(entityTypes => [
        documentsListActions.GetEntityTypesComplete({ entityTypes: entityTypes.map(e => ({ id: e.id, name: EntityType.getName(e.name) })) }),
      ]),
      catchError(errorMessage => of(documentsListActions.DocumentsListError({ errorMessage }))),
    )),
  ));

  deleteDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.DeleteDocuments),
    mergeMap(action => this.documentsService.deleteDocuments(action.ids).pipe(
      switchMap(() => [
        documentsListActions.DeleteDocumentsComplete(),
        documentsListActions.RefreshDocumentsList(),
      ]),
      catchError(error => of(documentsListActions.DocumentsListError({ errorMessage: error }))),
    )),
  ));

  deleteDocumentsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.DeleteDocumentsComplete),
    tap(() => {
      this.toaster.showSuccess('Document was deleted');
    }),
  ), { dispatch: false });

  downloadDocument$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.DownloadDocument),
    mergeMap(action => this.documentsService.downloadDocument(action.id, action.fileName).pipe(
      switchMap(() => [
        documentsListActions.DownloadDocumentComplete(),
      ]),
      catchError(() => of(documentsListActions.DownloadDocumentError())),
    )),
  ));

  downloadDocumentByDocumentLinkId$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.DownloadByDocumentLinkId),
    mergeMap(action => this.documentsService.downloadByDocumentLinkId(action.id).pipe(
      switchMap(() => [
        documentsListActions.DownloadByDocumentLinkIdComplete(),
      ]),
      catchError(() => of(documentsListActions.DownloadDocumentError())),
    )),
  ));

  downloadDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.DownloadDocuments),
    mergeMap(action => this.documentsService.downloadDocuments(action.ids).pipe(
      switchMap(() => [
        documentsListActions.DownloadDocumentsComplete(),
      ]),
      catchError(() => of(documentsListActions.DownloadDocumentError())),
    )),
  ));

  exportAuditDetails$ = createEffect(() => this.actions$.pipe(
    ofType(documentsListActions.ExportAuditDetails),
    mergeMap(action => this.auditorService.export(action.id, action.channelName).pipe(
      switchMap(data => [documentsListActions.ExportAuditDetailsComplete({ channel: data })]),
      catchError(() => of(documentsListActions.DownloadDocumentError())),
    )),
  ));

  downloadDocumentError$ = createEffect(() => this.actions$.pipe(
    ofType(
      documentsListActions.DownloadDocumentError,
    ),
    map(() => [this.toaster.showWarning('File was not found')]),
  ), { dispatch: false });
}
