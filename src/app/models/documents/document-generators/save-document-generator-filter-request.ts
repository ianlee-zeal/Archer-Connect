import { ISearchOptions } from '@app/models/search-options';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export class SaveDocumentGeneratorFilterRequest {
  entityTypeId: number;
  entityId: number;
  searchOptions: IServerSideGetRowsRequestExtended | ISearchOptions;

  constructor(model?: SaveDocumentGeneratorFilterRequest) {
    Object.assign(this, model);
  }

  public static toModel(item: any): SaveDocumentGeneratorFilterRequest {
    return {
      entityTypeId: item.entityTypeId,
      entityId: item.entityId,
      searchOptions: item.gridParams.request,
    };
  }

  public static toDto(entityTypeId: number, entityId: number, searchOptions?: IServerSideGetRowsRequestExtended): SaveDocumentGeneratorFilterRequest {
    return {
      entityTypeId,
      entityId,
      searchOptions,
    };
  }
}
