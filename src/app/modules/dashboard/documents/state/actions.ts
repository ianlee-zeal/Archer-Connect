import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { EntityDocumentType } from '@app/models/documents/entity-document-type';
import { DocumentType } from '../../../../models/documents/document-type';

const featureName = '[Documents]';

export const UpdateActionBar = createAction(`${featureName} Update Documents Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetDocumentTypesList = createAction(`${featureName} Get Document Types List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetDocumentTypesListComplete = createAction(`${featureName} Get Document Types List Complete`, props<{ documentTypes: any[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetDocumentTypesListError = createAction(`${featureName} Get Document Types List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const GetDocumentTypeById = createAction(`${featureName} Get Document Type By Id`, props<{ id: number }>());
export const GetDocumentTypeByIdComplete = createAction(`${featureName} Get Document Type By Id Complete`, props<{ documentType: DocumentType}>());

export const GetProductCategoriesRequest = createAction(`${featureName} Get Product Categories Request Request`);
export const GetProductCategoriesComplete = createAction(`${featureName} Get Product Categories Complete`, props<{ productCategories: SelectOption[] }>());

export const GetEntityTypesRequest = createAction(`${featureName} Get Entity Types Request Request`);
export const GetEntityTypesComplete = createAction(`${featureName} Get Entity Types Complete`, props<{ entityTypes: SelectOption[] }>());

export const CreateDocumentType = createAction(`${featureName} Creat Document Type`, props<{ documentType: EntityDocumentType }>());
export const CreateDocumentTypeComplete = createAction(`${featureName} Create Document Type Complete`);

export const UpdateDocumentType = createAction(`${featureName} Update Document Type`, props<{ documentType: EntityDocumentType, }>());
export const UpdateDocumentTypeComplete = createAction(`${featureName} Update Document Type Complete`);

export const RefreshDocumentTypesList = createAction(`${featureName} Refresh Document Types List`);
export const RefreshDocumentTypesComplete = createAction(`${featureName} Refresh Document Types List Complete`);

export const Error = createAction(`${featureName} Error`, props<{ errorMessage: string }>());
