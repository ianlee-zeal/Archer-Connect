import { createReducer, Action, on } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import * as actions from './actions';
import { DocumentType } from '../../../../models/documents/document-type';

export interface DocumentTypesState {
  error: any,
  pending: boolean,
  actionBar: ActionHandlersMap;
  agGridParams: IServerSideGetRowsParamsExtended,
  documentType: DocumentType,
  documentTypes: DocumentType[],
  productCategories: SelectOption[];
  entityTypes: SelectOption[]
}

const documentTypesInitialState: DocumentTypesState = {

  error: null,
  pending: false,
  actionBar: null,
  agGridParams: null,
  documentType: null,
  documentTypes: null,
  productCategories: null,
  entityTypes: null,
};

const documentTypesReducer = createReducer(
  documentTypesInitialState,
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

  on(actions.GetDocumentTypesList, (state, { agGridParams }) => ({ ...state, pending: true, error: null, documentTypes: null, agGridParams })),
  on(actions.GetDocumentTypesListComplete, (state, { documentTypes }) => ({ ...state, pending: false, documentTypes })),
  on(actions.GetDocumentTypeByIdComplete, (state, { documentType }) => ({ ...state, documentType })),

  on(actions.GetProductCategoriesRequest, state => ({ ...state, productCategories: null })),
  on(actions.GetProductCategoriesComplete, (state, { productCategories }) => ({ ...state, productCategories })),

  on(actions.GetEntityTypesRequest, state => ({ ...state, entityTypes: null })),
  on(actions.GetEntityTypesComplete, (state, { entityTypes }) => ({ ...state, entityTypes })),
);

export function DocumentTypesReducer(state: DocumentTypesState | undefined, action: Action) {
  return documentTypesReducer(state, action);
}
