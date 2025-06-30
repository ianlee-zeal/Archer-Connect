import { DocumentGeneratorType } from '@app/models/enums';
import { SharedDocumentGenerationState } from '@app/modules/shared/state/document-generation/reducer';
import { Recurrence } from './recurrence';
import { SaveDocumentGeneratorFilterRequest } from './save-document-generator-filter-request';

export class SaveDocumentGeneratorRequest {
  id: number;
  name: string;
  generatorType?: DocumentGeneratorType;
  entityTypeId: number;
  entityId: number;
  outputType: number;
  jobScheduleChronExpression: string;
  jobExternalId: string;
  outputFileType: number;
  outputContainerType: number;
  outputFileNamingConvention: string;
  outputSaveChildDocs: string;
  recurrence: Recurrence;
  useIndividualTemplates: boolean = false;
  templateIds: number[] = [];
  templateFilters: SaveDocumentGeneratorFilterRequest[] = [];
  watermark: string;
  outputFileName: string;
  channelName: string;

  constructor(model?: SaveDocumentGeneratorRequest) {
    Object.assign(this, model);
  }

  public static toModel(item: any): SaveDocumentGeneratorRequest {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      generatorType: item.generatorType,
      entityTypeId: item.entityTypeId,
      entityId: item.entityId,
      outputType: item.outputType,
      jobScheduleChronExpression: item.jobScheduleChronExpression,
      jobExternalId: item.jobExternalId,
      outputFileType: item.outputFileType,
      outputContainerType: item.outputContainerType,
      outputFileNamingConvention: item.outputFileNamingConvention,
      outputSaveChildDocs: item.outputSaveChildDocs,
      recurrence: item.recurrence,
      useIndividualTemplates: !!item.useIndividualTemplates,
      templateIds: item.templateIds,
      templateFilters: item.templateFilters,
      watermark: item.watermark, // settings
      outputFileName: item.outputFileName, // settings
      channelName: item.channelName,
    };
  }

  // eslint-disable-next-line max-len
  public static toDocumentGeneratorRequestDto(entityId: number, entityTypeId: number, templateFilters: SaveDocumentGeneratorFilterRequest[], templateIds: number[], watermark: string, outputFileName: string, outputFileType?: number, channelName?: string, useIndividualTemplates?: boolean): SaveDocumentGeneratorRequest {
    return {
      id: null,
      name: 'I am a placeholder',
      generatorType: null,
      entityId,
      entityTypeId,
      outputType: null,
      jobScheduleChronExpression: null,
      jobExternalId: null,
      outputFileType,
      outputContainerType: null,
      outputFileNamingConvention: null,
      outputSaveChildDocs: null,
      recurrence: null,
      useIndividualTemplates: !!useIndividualTemplates,
      templateIds,
      templateFilters,
      watermark, // settings
      outputFileName, // settings
      channelName,
    };
  }

  public static toSaveDocumentGeneratorRequestDto(channelName: string, state: SharedDocumentGenerationState): SaveDocumentGeneratorRequest {
    const templateIds: number[] = [];
    templateIds.push(<number>state.currentData.template.id);
    const templateFilters: SaveDocumentGeneratorFilterRequest[] = [];

    // required filters (entity id & search options)
    templateFilters.push(SaveDocumentGeneratorFilterRequest.toDto(
      state.entityTypeId, state.entityId ? state.entityId : -1,
    ));
    templateFilters.push(SaveDocumentGeneratorFilterRequest.toDto(
      state.entityTypeId, -1, state.gridParams?.request ?? state.searchOptions,
    ));

    // optional filters
    state.defaultFilterRequests?.forEach(element => {
      templateFilters.push(SaveDocumentGeneratorFilterRequest.toDto(element.entityTypeId, element.entityId, element.searchOptions));
    });

    // Advance Export Settings
    const watermark: string = state.currentData.watermark;
    const outputFileName: string = state.currentData.outputFileName;
    const outputType:number = +state.currentData.outputTypeOption?.id;
    const outputFileType:number = +state?.currentData?.outputFileTypeOption?.id;
    const outputFileNamingConvention: string = state.currentData.outputFileNamingConvention;
    const outputContainerType: number = state.currentData.outputContainerType;

    const returnObj = {
      id: null,
      name: state.name,
      generatorType: null,
      entityTypeId: state.entityTypeId,
      entityId: state.entityId,
      outputType,
      jobScheduleChronExpression: null,
      jobExternalId: null,
      outputFileType,
      outputContainerType,
      outputFileNamingConvention,
      outputSaveChildDocs: null,
      recurrence: null,
      useIndividualTemplates: null,
      templateIds,
      templateFilters,
      watermark,
      outputFileName,
      channelName,
    };

    return returnObj;
  }
}
