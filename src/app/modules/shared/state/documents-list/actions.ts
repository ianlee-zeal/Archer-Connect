import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { Document, DocumentType } from '@app/models/documents';
import { ProductCategoryDto } from '@app/models/product-workflow/product-category-dto';
import { EntityTypeEnum } from '@app/models/enums';
import { SelectOption } from '../../_abstractions/base-select';

export interface DocumentsListSearchParams {
  entityId: number;
  entityTypeId: EntityTypeEnum;
  entityTypeIdToFilterDocTypes: EntityTypeEnum;
  documentTypeId: number;
  productCategoryId: number;
  searchTerm: string;
}

export const DocumentsListError = createAction('[Shared Documents List] API Error', props<{ errorMessage: string }>());

export const GetDocumentsList = createAction('[Shared Documents List] Get Documents List', props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetDocumentsListComplete = createAction('[Shared Documents List] Get Documents List Complete', props<{ documents: Document[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetDocumentsListError = createAction('[Shared Documents List] Get Documents List Error', props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());
export const RefreshDocumentsList = createAction('[Shared Documents List] Refresh Documents List');
export const UpdateDocumentsListSearch = createAction('[Shared Documents List] Update Documents List Search', props<{ search: any }>());

export const GetProductCategoriesRequest = createAction('[Shared Documents List] Get Product Categories By Entity Id', props<{ entityTypeId: EntityTypeEnum }>());
export const GetProductCategoriesSuccess = createAction('[Shared Documents List] Get Product Categories By Entity Id Success', props<{ productCategories: ProductCategoryDto[] }>());

export const GetDocumentTypeByCategoryIdRequest = createAction('[Shared Documents List] Get Document Types By Category Id', props<{ productCategoryId: number, entityTypeId: EntityTypeEnum }>());
export const GetDocumentTypeByCategoryIdSuccess = createAction('[Shared Documents List] Get Document Types By Category Id Success', props<{ documentTypesByCategoryId: DocumentType[] }>());

export const GetDocumentTypesByEntityId = createAction('[Shared Documents List] Get Document Types By Entity Id', props<{ entityTypeId: EntityTypeEnum, additionalDocumentTypeId?: number }>());
export const GetDocumentTypesByEntityIdComplete = createAction('[Shared Documents List] Get Document Types By Entity Id Complete', props<{ documentTypes: DocumentType[] }>());

export const GetEntityTypesRequest = createAction('[Shared Documents List] Get Entity Types Request Request');
export const GetEntityTypesComplete = createAction('[Shared Documents List] Get Entity Types Complete', props<{ entityTypes: SelectOption[] }>());

export const DeleteDocuments = createAction('[Shared Documents List] Delete Documents', props<{ ids: number[] }>());
export const DeleteDocumentsComplete = createAction('[Shared Documents List] Delete Documents Complete');

export const DownloadDocument = createAction('[Shared Documents List] Download Document', props<{ id: number, fileName?: string }>());
export const DownloadDocumentComplete = createAction('[Shared Documents List] Download Document Complete');

export const DownloadByDocumentLinkId = createAction('[Shared Documents List] Download Document By Document Link', props<{ id: number }>());
export const DownloadByDocumentLinkIdComplete = createAction('[Shared Documents List] Download Document By Document Link Complete');

export const DownloadDocuments = createAction('[Shared Documents List] Download Documents (Zip)', props<{ ids: number[] }>());
export const DownloadDocumentsComplete = createAction('[Shared Documents List] Download Documents (Zip) Complete');
export const DownloadDocumentError = createAction('[Shared Documents List] Download Document (Zip) Error');

export const ClearDocumentGridParams = createAction('[Shared Documents List] Clear Document Grid Params');
export const ClearDocuments = createAction('[Shared Documents List] Clear Documents');

export const SaveAddedDocuments = createAction('[Shared Documents List] Save Added Documents', props<{ documents: Document[] }>());

export const ExportAuditDetails = createAction('[Shared Documents List]  Export Audit Details', props<{ id: number, channelName: string }>());
export const ExportAuditDetailsComplete = createAction('[Shared Documents List]  Export Audit Details Complete', props<{ channel: string }>());
