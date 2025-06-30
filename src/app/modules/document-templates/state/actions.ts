import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { DocumentTemplate } from '@app/models/documents/document-generators/document-template';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { IdValue } from '@app/models';
import { CreateOrUpdateTemplateRequest } from '@app/models/documents/document-generators';
import * as enums from '../../../models/enums';
import { TestCSGenerationRequest } from '@app/models/docusign-sender/test-cs-generation-request';
import { DocuSignCSResponse } from '@app/models/docusign-sender/docusign-cs-response';
import { EmailDefaults } from '@app/models/docusign-sender/email-defaults';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

const featureName = '[Document Templates]';
export const Error = createAction(`${featureName} Error Message`, props<{ error: string }>());
export const UpdateDocumentTemplatesActionBar = createAction(`${featureName} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetDocumentTemplates = createAction(`${featureName} Get Document Templates`, props<{ gridParams: IServerSideGetRowsParamsExtended }>());
export const GetDocumentTemplatesSuccess = createAction(`${featureName} Get Document Templates Success`, props<{ documentTemplates: DocumentTemplate[], gridParams: IServerSideGetRowsParamsExtended, totalRecords: number}>());

export const CreateDocumentTemplate = createAction(`${featureName} Create Document Template`, props<{ request: CreateOrUpdateTemplateRequest, gridParams: IServerSideGetRowsParamsExtended }>());
export const UpdateDocumentTemplate = createAction(`${featureName} Update Document Template`, props<{ request: CreateOrUpdateTemplateRequest, gridParams: IServerSideGetRowsParamsExtended }>());
export const CreateOrUpdateTemplateRequestSuccess = createAction(`${featureName} Create Or Update Document Template Success`);
export const CreateOrUpdateTemplateCanceled = createAction(`${featureName} Create/Update Document Template Cancelled`);

export const DeleteDocumentTemplate = createAction(`${featureName} Delete Document Template`, props<{ templateId: number, gridParams: IServerSideGetRowsParamsExtended }>());
export const DeleteDocumentTemplateSuccess = createAction(`${featureName} Delete Document Template Success`);
export const DeleteDocumentTemplateCancelled = createAction(`${featureName} Delete Document Template Cancelled`);

export const TestDITFile = createAction(`${featureName} Test DIT File`, props<{ templateId: number, request: TestCSGenerationRequest, gridParams: IServerSideGetRowsParamsExtended}>());
export const TestDITFileSuccess = createAction(`${featureName} Test DIT File Success`,  props<{docusignResponse: DocuSignCSResponse}>());

export const TestDITFileFromCreate = createAction(`${featureName} Test DIT File from Create`, props<{ request: TestCSGenerationRequest, gridParams: IServerSideGetRowsParamsExtended}>());
export const TestDITFileFromCreateSuccess = createAction(`${featureName} Test DIT File from Creates`,  props<{docusignResponse: DocuSignCSResponse}>());

export const CSGenerateSample = createAction(`${featureName} CS Sample Generation`, props<{ request: TestCSGenerationRequest, templateId: number}>());
export const CSGenerateSampleSuccess = createAction(`${featureName} CS Sample Generation Success`);

export const GetDocuSignTemplateDefaults = createAction(`${featureName} Get Docusign Fields Defaults`);
export const GetDocuSignTemplateDefaultsSuccess = createAction(`${featureName} Get Docusign Fields Defaults Success`, props<{docusignTemplateDefaults: EmailDefaults}>());


export const GetDocumentTypesForTemplates = createAction(`${featureName} Get Document Types For Templates`);
export const GetDocumentTypesForTemplatesSuccess = createAction(`${featureName} Get Document Types For Templates Success`, props<{ documentTypes: DocumentType[] }>());

export const GetDocumentStatusesForDocumentType = createAction(`${featureName} Get Document Statuses For Document Type`, props<{ documentTypeId: number }>());
export const GetDocumentStatusesForDocumentTypeSuccess = createAction(`${featureName} Get Document Statuses For Document Type Success`, props<{ documentStatuses: IdValue[] }>());

export const GetDocumentStatuses = createAction(`${featureName} Get Document Statuses`);
export const GetDocumentStatusesSuccess = createAction(`${featureName} Get Document Statuses Success`, props<{ allDocumentStatuses: IdValue[] }>());
export const GetDocumentTemplatesDropdownValues = createAction(`${featureName} Get Document Templates Dropdown Values`, props<{ filter: string, entityType: enums.EntityTypeEnum, documentType: enums.DocumentType }>());
export const GetDocumentTemplatesDropdownValuesSuccess = createAction(`${featureName} Get Document Templates Dropdown Values Success`, props<{ documentType: enums.DocumentType, items: IdValue[] }>());

export const GetDocuSignIntegrationTemplatesDropdownValues = createAction(`${featureName} Get DocuSign Integration Templates Dropdown Values`, props<{ documentType: enums.DocumentType }>());
export const GetDocuSignIntegrationTemplatesDropdownValuesSuccess = createAction(`${featureName} Get DocuSign Integration Templates Dropdown Values Success`,props<{ documentType: enums.DocumentType, items: IdValue[] }>());

export const SearchDocumentTemplateOptions = createAction(`${featureName} Search Document Template Options`, props<{ params: IServerSideGetRowsRequestExtended, documentType: enums.DocumentType }>());
