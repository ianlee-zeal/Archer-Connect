import { ControllerEndpoints } from '@app/models/enums';
import { ISearchOptions } from '@app/models/search-options';
import { SaveDocumentGeneratorFilterRequest } from './save-document-generator-filter-request';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export class InitialModalState {
  name: string;
  controller: ControllerEndpoints;
  templateTypes: number[];
  entityTypeId: number;
  entityId?: number;
  documentTypes: number[];
  allowedExtensions?: string[];
  gridParams?: IServerSideGetRowsParamsExtended;
  searchOptions?: ISearchOptions;
  isSingleExportMode?: boolean;
  defaultTemplateId?: number;
  singleTemplate?: string;
  defaultFilterRequests?: SaveDocumentGeneratorFilterRequest[];
  validOutputTypes?: number[];
  showWatermark?: boolean;
  disable?: boolean;
  entityValidationErrors?: string[] = [];
  finishedProcessCallback?: () => void;
  stageId?: number;

  public static toModel(item: any): InitialModalState {
    if (item) {
      return {
        name: item.name,
        controller: item.controller,
        defaultFilterRequests: item.defaultFilterRequests,
        entityTypeId: item.entityTypeId,
        entityId: item.entityId,
        templateTypes: item.templateTypes,
        documentTypes: item.documentTypes,
        allowedExtensions: item.allowedExtensions,
        defaultTemplateId: item.defaultTemplateId,
        singleTemplate: item.singleTemplate,
        gridParams: item.gridParams,
        searchOptions: item.searchOptions,
        isSingleExportMode: item.isSingleExportMode,
        validOutputTypes: item.validOutputTypes,
        disable: item.disable,
        entityValidationErrors: item.entityValidationErrors,
        finishedProcessCallback: item.finishedProcessCallback,
        stageId: item.stageId,
      };
    }
  }
}
