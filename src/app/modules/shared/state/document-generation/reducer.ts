/* eslint-disable @typescript-eslint/no-use-before-define */
import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { DocumentImport, SaveDocumentGeneratorFilterRequest } from '@app/models/documents';
import { ControllerEndpoints, UploadBulkDocumentStage } from '@app/models/enums';
import { DocumentImportSettings } from '@app/models/documents/configuration-models/document-import-settings';

import { OutputContainerType } from '@app/models/enums/document-generation/output-container-type';
import { DocumentTemplate } from '@app/models/documents/document-generators/document-template';
import { OutputType } from '@app/models/enums/document-generation/output-type';
import { DocumentType } from '@app/models/enums/document-generation/document-type.enum';
import { ClaimSettlementLedgerStages } from '@app/models/enums/claim-settlement-ledger-stages.enum';
import { IDocumentGenerationTemplates } from '@app/models/documents/document-generators';
import { SelectHelper } from '@app/helpers/select.helper';
import { SelectGroupsEnum } from '@app/models/enums/select-groups.enum';
import { SelectOption } from '../../_abstractions/base-select';
import * as actions from './actions';
import { ISearchOptions } from '@app/models/search-options'

export interface SharedDocumentGenerationState {
  name: string;
  documentImport: DocumentImport,
  documentImportSettings: DocumentImportSettings,
  error: any,
  stage: UploadBulkDocumentStage,
  allowedExtensions: string[],
  isValidSelect: boolean,
  isValidConfigure: boolean,
  isValidUpload: boolean,
  entityId: number,
  entityTypeId: number,
  templateTypes: number[],
  controller: ControllerEndpoints,
  gridParams: IServerSideGetRowsParamsExtended;
  searchOptions: ISearchOptions;
  id: number,
  isSingleExportMode: boolean;
  defaultTemplateId: number;
  singleTemplate?: string;
  documentTypes: number[];
  defaultFilterRequests: SaveDocumentGeneratorFilterRequest[];
  entityValidationErrors: string[],
  disable: boolean,
  finishedProcessCallback: () => void,
  stageId: ClaimSettlementLedgerStages,
  data: IDocumentGenerationTemplates,

  currentData: {
    // organization: SelectOption,
    template: DocumentTemplate,

    templateOption: SelectOption,
    outputTypeOption: SelectOption,
    outputFileTypeOption: SelectOption,

    // settings
    watermark: string,
    outputFileNamingConvention: string,
    outputContainerType: OutputContainerType,
    outputFileName: string,
    watermarkSupported: boolean,
  },
  progress: {
    message: string,
    width: number,
    complete: boolean,
    error: boolean
  }
}

const initialState: SharedDocumentGenerationState = {
  name: null,
  documentImport: null,
  documentImportSettings: null,
  error: null,
  stage: null,
  allowedExtensions: [],
  isValidSelect: false,
  isValidConfigure: false,
  isValidUpload: false,
  entityTypeId: null,
  entityId: null,
  templateTypes: [],
  documentTypes: [],
  controller: null,
  gridParams: null,
  searchOptions: null,
  id: null,
  data: {
    templates: [],
    templateOptions: [],
    outputFileTypeOptions: [],
    outputTypeOptions: [],
    allOutputFileTypesOptions: [],
    validOutputTypeOptions: [],
  },
  currentData: null,
  progress: { message: null, width: 0, complete: false, error: false },
  isSingleExportMode: null,
  defaultTemplateId: null,
  singleTemplate: null,
  defaultFilterRequests: [],
  entityValidationErrors: [],
  disable: false,
  finishedProcessCallback: null,
  stageId: null,
};

// main reducer function
const sharedDocumentGenerationReducer = createReducer(
  initialState,
  on(actions.Error, (state, { error }) => ({ ...state, error, file: null, document: null })),

  on(actions.OpenDocumentGenerationModal, (state, { initialModalState }) => ({
    ...initialState,
    name: initialModalState.name,
    controller: initialModalState.controller,
    templateTypes: initialModalState.templateTypes,
    entityTypeId: initialModalState.entityTypeId,
    entityId: initialModalState.entityId,
    allowedExtensions: initialModalState.allowedExtensions,
    documentTypes: initialModalState.documentTypes,
    gridParams: initialModalState.gridParams,
    searchOptions: initialModalState.searchOptions,
    isSingleExportMode: initialModalState.isSingleExportMode,
    defaultTemplateId: initialModalState.defaultTemplateId,
    singleTemplate: initialModalState.singleTemplate,
    defaultFilterRequests: initialModalState.defaultFilterRequests,
    entityValidationErrors: initialModalState.entityValidationErrors,
    disable: initialModalState.disable,
    finishedProcessCallback: initialModalState.finishedProcessCallback ? initialModalState.finishedProcessCallback.bind(this) : null,
    data: {
      ...state.data,
      validOutputTypeOptions: initialModalState.validOutputTypes,
    },
    showWatermark: initialModalState.showWatermark,
    stageId: initialModalState.stageId,
  })),

  on(actions.LoadDefaultData, (state, { outputTypeOptions, allOutputFileTypesOptions }) => ({
    ...state,
    data: {
      ...state.data,
      outputTypeOptions,
      allOutputFileTypesOptions,
    },
    currentData: {
      ...state.currentData,
      outputTypeOption: outputTypeOptions[0],
    },
  })),

  on(actions.LoadDefaultDataComplete, (state, { data }) => ({
    ...state,
    data: {
      ...state.data,
      templates: data.templates,
      templateOptions: data.templates.map(item => SelectHelper.toGroupedOption(item, item?.isGlobal ? SelectGroupsEnum.GlobalTemplates : SelectGroupsEnum.ProjectSpecificTemplates)),
    },

    isValidSelect: !!data.template,
    documentImport: <DocumentImport>{ templateId: data.templates[0].id },
    stage: UploadBulkDocumentStage.Select,
    documentImportSettings: <DocumentImportSettings>{ createDeficiencies: false },

  })),

  on(actions.SetData, (state, { data }) => ({ ...state, currentData: { ...state.currentData, ...data } })),

  on(actions.SetDataOnTemplateChange, (state, { documentTemplate }) => ({
    ...state,
    data: {
      ...state.data,
      outputFileTypeOptions: state.data?.allOutputFileTypesOptions?.filter(fileTypeItem => documentTemplate?.outputFileTypes?.includes(fileTypeItem.id.toString())),
      outputTypeOptions: getOutputTypeOptionsData(state, documentTemplate),
    },
    currentData: getCurrentDataByTemplate(state, documentTemplate),
  })),

  on(actions.UpdateEditableFields, (state, { watermark, outputFileName, outputTypeOption, outputFileTypeOption, outputFileNamingConvention, watermarkSupported }) => ({
    ...state,
    currentData: {
      ...state.currentData,

      outputTypeOption: outputTypeOption != null ? outputTypeOption : state.currentData.outputTypeOption,
      outputFileTypeOption: outputFileTypeOption != null ? outputFileTypeOption : state.currentData.outputFileTypeOption,
      watermark: watermark != null ? watermark : state.currentData.watermark,
      outputFileName: outputFileName != null ? outputFileName : state.currentData.outputFileName,
      outputFileNamingConvention: outputFileNamingConvention != null ? outputFileNamingConvention : state.currentData.outputFileNamingConvention,

      template: {
        ...state.currentData.template,
        watermarkSupported: watermarkSupported != null ? watermarkSupported : state.currentData.watermarkSupported,
      },
    },
  })),

  on(actions.SetIsValidSelect, (state, { isValidSelect }) => ({ ...state, isValidSelect })),
  on(actions.SetIsValidConfigure, (state, { isValidConfigure }) => ({ ...state, isValidConfigure })),
  on(actions.SetIsValidUpload, (state, { isValidUpload }) => ({ ...state, isValidUpload })),

  on(actions.UpdateProgress, (state, { progress }) => ({ ...state, progress })),

  on(actions.SetModalStage, (state, { incr }) => ({ ...state, stage: state.stage + incr })),

  on(actions.SetDocumentImportSettings, (state, { documentImportSettings }) => ({ ...state, documentImportSettings })),

  on(actions.GenerateDocumentsComplete, (state, { data }) => ({ ...state, id: data.id })),

  on(actions.SetIsSingleExportMode, (state, { isSingleExportMode }) => ({ ...state, isSingleExportMode })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedDocumentGenerationReducer(state: SharedDocumentGenerationState | undefined, action: Action) {
  return sharedDocumentGenerationReducer(state, action);
}

export function getCurrentDataByTemplate(state: any, documentTemplate: DocumentTemplate): any {
  const templateOption = state.data.templateOptions?.filter(i => i.id == documentTemplate.id)[0];
  const outputTypeOption = state.data.outputTypeOptions[0];
  const outputFileTypeOption = state.data?.allOutputFileTypesOptions[0];

  return {
    ...state.currentData,
    template: {
      ...documentTemplate,
      outputFileNameSupported: state.isSingleExportMode ? documentTemplate.outputFileNameSupported : state.isSingleExportMode,
      watermarkSupported: (state.data.outputTypeOptions != null && documentTemplate != null && documentTemplate.outputType != null) ? (outputTypeOption == OutputType.Draft) : false,
    },

    templateOption,
    outputTypeOption,
    outputFileTypeOption,

    watermark: state.data.templates?.filter(i => i.id == documentTemplate.id)[0].watermark,
    outputFileNamingConvention: state.data.templates?.filter(i => i.id == documentTemplate.id)[0].outputFileNamingConvention,
    outputContainerType: state.data.templates?.filter(i => i.id == documentTemplate.id)[0].outputContainerType,
  };
}

function getOutputTypeOptionsData(state: any, documentTemplate: DocumentTemplate): SelectOption[] {
  const options = state.data.outputTypeOptions?.filter(x => x.id === OutputType.Draft);
  if (documentTemplate.documentTypeId === DocumentType.ClosingStatement && options.length > 0 && state.stageId !== ClaimSettlementLedgerStages.CSReady) {
    return options;
  }
  return state.data.outputTypeOptions;
}
