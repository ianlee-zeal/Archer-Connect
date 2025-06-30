import { createAction, props } from '@ngrx/store';

import { DocumentImportSettings } from '@app/models/documents/configuration-models/document-import-settings';
import { DocumentTemplate } from '@app/models/documents/document-generators/document-template';
import { InitialModalState } from '@app/models/documents/document-generators';
import { SelectOption } from '../../_abstractions/base-select';

const featureName = '[Shared Document Generation Modal]';

export const OpenDocumentGenerationModal = createAction(`${featureName} Open Modal`, props<{ initialModalState: InitialModalState }>());

export const LoadDefaultData = createAction(`${featureName} Load Dropdown Data`, props<{ outputTypeOptions: SelectOption[], allOutputFileTypesOptions: SelectOption[] }>());
export const LoadDefaultDataComplete = createAction(`${featureName} Load Dropdown Data Complete`, props<{ data: any }>());

export const GenerateDocuments = createAction(`${featureName} Generate Documents`, props<{ channelName: string }>());
export const GenerateDocumentsComplete = createAction(`${featureName} Generate Documents Complete`, props<{ data: any }>());

export const DownloadResults = createAction(`${featureName} Download Results`);
export const DownloadResultsComplete = createAction(`${featureName} Download Results Complete`);

export const Error = createAction(`${featureName} Document Error`, props<{ error: any }>());

export const UpdateProgress = createAction(`${featureName} Update Progress`, props<{ progress: any }>());

export const SetModalStage = createAction(`${featureName} Set Modal Stage`, props<{ incr: number }>());
export const SetDocumentImportSettings = createAction(`${featureName} Set Document Import Settings`, props<{ documentImportSettings: DocumentImportSettings }>());
export const SetData = createAction(`${featureName} Set Data`, props<{ data: any }>());
export const SetIsValidSelect = createAction(`${featureName} Set Is Valid Select`, props<{ isValidSelect: boolean }>());
export const SetIsValidConfigure = createAction(`${featureName} Set Is Valid Configure`, props<{ isValidConfigure: boolean }>());
export const SetIsValidUpload = createAction(`${featureName} Set Is Valid Upload`, props<{ isValidUpload: boolean }>());

export const UpdateEditableFields = createAction(`${featureName} Update Editable Fields`, props<{ watermark?: string, outputFileName?: string, outputTypeOption?: SelectOption, outputFileTypeOption?: SelectOption, outputFileNamingConvention?: string, watermarkSupported?:boolean }>());
export const SetIsSingleExportMode = createAction(`${featureName} Set Is Single Export Mode`, props<{ isSingleExportMode: boolean }>());

export const SetDataOnTemplateChange = createAction(`${featureName} Set Data On Template Change`, props<{ documentTemplate: DocumentTemplate }>());
