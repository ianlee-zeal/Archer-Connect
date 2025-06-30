import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { DocumentType } from '@app/models/documents/document-type';
import { ProductCategoryDto } from '@app/models/product-workflow/product-category-dto';
import * as documentsListActions from './actions';
import { SelectOption } from '../../_abstractions/base-select';

export interface SharedDocumentsListState {
  error: any,
  pending: boolean,
  agGridParams: IServerSideGetRowsParamsExtended,
  searchParams: documentsListActions.DocumentsListSearchParams,
  documentTypes: DocumentType[],
  documentTypesByCategoryId: DocumentType[],
  productCategories: ProductCategoryDto[],
  documents: any[]
  entityTypes: SelectOption[]
}

const initialState: SharedDocumentsListState = {
  error: null,
  pending: false,
  agGridParams: null,
  searchParams: {
    entityId: null,
    entityTypeId: null,
    entityTypeIdToFilterDocTypes: null,
    documentTypeId: null,
    productCategoryId: null,
    searchTerm: null,
  },
  documentTypes: null,
  documentTypesByCategoryId: null,
  productCategories: [],
  documents: null,
  entityTypes: null,
};

// main reducer function
const sharedDocumentsListReducer = createReducer(
  initialState,
  on(documentsListActions.DocumentsListError, (state, { errorMessage }) => ({ ...state, error: errorMessage })),

  on(documentsListActions.GetDocumentsList, (state, { agGridParams }) => ({ ...state, pending: true, error: null, documents: null, agGridParams })),
  on(documentsListActions.GetDocumentsListComplete, (state, { documents }) => ({ ...state, pending: false, documents })),
  on(documentsListActions.GetDocumentsListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),
  on(documentsListActions.UpdateDocumentsListSearch, (state, { search }) => ({ ...state, searchParams: Object.assign(state.searchParams, search) })),

  on(documentsListActions.GetProductCategoriesRequest, state => ({ ...state, productCategories: null })),
  on(documentsListActions.GetProductCategoriesSuccess, (state, { productCategories }) => ({ ...state, productCategories })),

  on(documentsListActions.GetDocumentTypeByCategoryIdRequest, state => ({ ...state, documentTypesByCategoryId: null })),
  on(documentsListActions.GetDocumentTypeByCategoryIdSuccess, (state, { documentTypesByCategoryId }) => ({ ...state, documentTypesByCategoryId })),

  on(documentsListActions.GetDocumentTypesByEntityId, state => ({ ...state, documentTypes: null })),
  on(documentsListActions.GetDocumentTypesByEntityIdComplete, (state, { documentTypes }) => ({ ...state, documentTypes })),

  on(documentsListActions.GetEntityTypesRequest, state => ({ ...state, entityTypes: null })),
  on(documentsListActions.GetEntityTypesComplete, (state, { entityTypes }) => ({ ...state, entityTypes })),

  on(documentsListActions.ClearDocumentGridParams, state => ({
    ...state,
    agGridParams: null,
    searchParams: {
      entityId: null,
      entityTypeId: null,
      entityTypeIdToFilterDocTypes: null,
      documentTypeId: null,
      productCategoryId: null,
      searchTerm: null,
    },
  })),
  on(documentsListActions.ClearDocuments, state => ({ ...state, documents: null })),

  on(documentsListActions.SaveAddedDocuments, (state, { documents }) => ({ ...state, documents })),

);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedDocumentsListReducer(state: SharedDocumentsListState | undefined, action: Action) {
  return sharedDocumentsListReducer(state, action);
}
