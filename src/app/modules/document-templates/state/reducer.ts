/* eslint-disable @typescript-eslint/no-use-before-define */
import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { DocumentTemplate } from '@app/models/documents/document-generators/document-template';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { IdValue } from '@app/models';
import * as enums from '../../../models/enums';
import { Dictionary, IDictionary } from '../../../models/utils/dictionary';

import * as actions from './actions';
import { TestCSGenerationRequest } from '@app/models/docusign-sender/test-cs-generation-request';
import {DocuSignCSResponse} from '@app/models/docusign-sender/docusign-cs-response';
import { EmailDefaults } from '@app/models/docusign-sender/email-defaults';

export interface DocumentTemplatesState {
  documentTemplates: DocumentTemplate[];
  gridParams: IServerSideGetRowsParamsExtended;
  actionBar: ActionHandlersMap;
  documentTypes: DocumentType[];
  documentStatuses: IdValue[];
  documentTypesDropdownValues: IDictionary<enums.DocumentType, IdValue[]>;
  allDocumentStatuses: IdValue[];
  docusignResponse: DocuSignCSResponse;
  docusignTemplateDefaults: EmailDefaults;
  error: string;
}

const initialCasesCommonState: DocumentTemplatesState = {
  documentTemplates: [],
  gridParams: null,
  actionBar: null,
  documentTypes: null,
  documentStatuses: null,
  allDocumentStatuses: null,
  documentTypesDropdownValues: null,
  docusignResponse: null,
  docusignTemplateDefaults: null,
  error: null,
};

const documentTemplatesReducer = createReducer(
  initialCasesCommonState,
  on(
    actions.GetDocumentTemplatesSuccess,
    (state: DocumentTemplatesState, { documentTemplates, gridParams }: { documentTemplates: DocumentTemplate[], gridParams: IServerSideGetRowsParamsExtended }) => ({ ...state, error: null, documentTemplates, gridParams }),
  ),
  on(
    actions.GetDocumentTypesForTemplatesSuccess,
    (state: DocumentTemplatesState, { documentTypes }: { documentTypes: DocumentType[] }) => ({ ...state, error: null, documentTypes }),
  ),
  on(actions.GetDocumentStatusesForDocumentType, (state: DocumentTemplatesState) => ({ ...state, error: null, documentStatuses: null })),
  on(actions.GetDocumentStatusesForDocumentTypeSuccess, (state: DocumentTemplatesState, { documentStatuses }: { documentStatuses: IdValue[] }) => ({ ...state, error: null, documentStatuses })),
  on(
    actions.GetDocumentStatusesSuccess,
    (state: DocumentTemplatesState, { allDocumentStatuses }: { allDocumentStatuses: IdValue[] }) => ({ ...state, error: null, documentStatuses: allDocumentStatuses, allDocumentStatuses }),
  ),
  on(
    actions.GetDocumentTemplatesDropdownValuesSuccess,
    (state: DocumentTemplatesState, { documentType, items }: { documentType: enums.DocumentType, items: IdValue[] }) => documentTemplatesDropdownValuesReducer(state, documentType, items),
  ),
  on(
    actions.GetDocuSignIntegrationTemplatesDropdownValuesSuccess,
    (state: DocumentTemplatesState, { documentType, items }: { documentType: enums.DocumentType, items: IdValue[] }) => documentTemplatesDropdownValuesReducer(state, documentType, items),
  ),
  on(
    actions.TestDITFile,
    (state: DocumentTemplatesState, { templateId, request }: { templateId: number, request: TestCSGenerationRequest}) => ({ ...state, error: null, templateId, request}),
  ),
  on(
    actions.TestDITFileSuccess,
    (state: DocumentTemplatesState, { docusignResponse }: { docusignResponse: DocuSignCSResponse}) => ({ ...state, error: null, docusignResponse}),
  ),
  on(
    actions.TestDITFileFromCreate,
    (state: DocumentTemplatesState, { request }: { request: TestCSGenerationRequest}) => ({ ...state, error: null, request}),
  ),
  on(
    actions.TestDITFileFromCreateSuccess,
    (state: DocumentTemplatesState, { docusignResponse }: { docusignResponse: DocuSignCSResponse}) => ({ ...state, error: null, docusignResponse}),
  ),
  on(
    actions.GetDocuSignTemplateDefaults,
    (state: DocumentTemplatesState, { }: { }) => ({ ...state, error: null}),
  ),
  on(
    actions.GetDocuSignTemplateDefaultsSuccess,
    (state: DocumentTemplatesState, { docusignTemplateDefaults }: { docusignTemplateDefaults: EmailDefaults}) => ({ ...state, error: null, docusignTemplateDefaults}),
  ),
  on(actions.UpdateDocumentTemplatesActionBar, (state: DocumentTemplatesState, { actionBar }: { actionBar: ActionHandlersMap }) => ({ ...state, actionBar })),
  on(actions.Error, (state: DocumentTemplatesState, { error }: { error: string }) => ({ ...state, error })),
);

function documentTemplatesDropdownValuesReducer(state: DocumentTemplatesState, documentType: enums.DocumentType, items: IdValue[]): DocumentTemplatesState {
  const newDropDownValues = new Dictionary<enums.DocumentType, IdValue[]>(state.documentTypesDropdownValues ? state.documentTypesDropdownValues.items() : []);
  newDropDownValues.setValue(documentType, items);
  return { ...state, documentTypesDropdownValues: newDropDownValues };
}

// we have to wrap our reducer like this or it won't compile in prod
export function documentTemplatesReducerWrapper(state: DocumentTemplatesState | undefined, action: Action): DocumentTemplatesState {
  return documentTemplatesReducer(state, action);
}
