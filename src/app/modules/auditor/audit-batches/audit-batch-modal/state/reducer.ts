import { createReducer, on, Action } from '@ngrx/store';

import { IdValue } from '@app/models/idValue';
import { AuditBatchStage } from '@app/models/enums';
import { AuditDocImportTemplate } from '@app/models/auditor/audit-doc-import-template';
import { AuditRun } from '@app/models/auditor/audit-run';
import { Document } from '@app/models/documents';

import { PreviewStatus } from '@app/models/auditor/preview-status.enum';
import * as actions from './actions';

export interface AuditBatchModalState {
  error: string;
  isClosingDisabled: boolean;
  stage: AuditBatchStage,

  previewStatus: PreviewStatus,
  isFailed: boolean;

  auditRun: AuditRun,

  dropdownValues: {
    collectors: IdValue[],
    templates: AuditDocImportTemplate[],
  }
}

export const auditBatchModalState: AuditBatchModalState = {
  error: null,
  isClosingDisabled: false,
  stage: AuditBatchStage.Template,

  previewStatus: PreviewStatus.None,
  isFailed: false,
  auditRun: AuditRun.toModel({ runSettings: JSON.stringify({ DuplicateDetectionEnable: true }) }),

  dropdownValues: {
    collectors: null,
    templates: null,
  },
};

const Reducer = createReducer(
  auditBatchModalState,

  on(actions.Error, (state, { error }) => ({ ...state, error, isClosingDisabled: false })),

  on(actions.GetDropdownValuesSuccess, (state, { collectors, templates }) => ({
    ...state,
    dropdownValues: { ...state.dropdownValues, collectors, templates },
  })),

  on(actions.SetTemplate, (state, { template }) => ({
    ...state,
    auditRun: {
      ...state.auditRun,
      auditDocImportTemplate: {
        ...state.auditRun?.auditDocImportTemplate,
        documentImportTemplateId: template?.documentImportTemplateId,
        id: template?.id,
      },
    },
  })),

  on(actions.SetSettings, (state, { settings }) => ({
    ...state,
    auditRun: {
      ...state.auditRun,
      runSettings: JSON.stringify(settings),
    },
  })),

  on(actions.SetModalStage, (state, { incr }) => ({ ...state, stage: state.stage + incr })),

  on(actions.SetSelectedFile, (state, { selectedFile }) => ({
    ...state,
    error: null,
    auditRun: {
      ...state.auditRun,
      existedFileId: null,
      inputDocument: new Document({ fileContent: selectedFile }),
    },
  })),

  on(actions.ResetOnErrorState, state => ({
    ...state,
    auditRun: {
      ...state.auditRun,
      id: state.auditRun.isPreview ? null : state.auditRun.id,
      inputDocument: null,
    },
    previewStatus: PreviewStatus.None,
  })),

  on(actions.ResetAuditBatchModalState, state => ({
    ...state,
    auditRun: AuditRun.toModel({ runSettings: JSON.stringify({ DuplicateDetectionEnable: true }) }),
    error: null,
    stage: AuditBatchStage.Template,
    previewStatus: PreviewStatus.None,
    isClosingDisabled: false,
  })),

  on(actions.StartPreview, state => ({
    ...state,
    previewStatus: PreviewStatus.Start,
    isClosingDisabled: true,
  })),

  on(actions.CreateAuditRunSuccess, (state, { auditRun }) => ({
    ...state,
    previewStatus: PreviewStatus.Validating,
    auditRun: {
      ...auditRun,
      inputDocument: new Document({ fileContent: state.auditRun.inputDocument.fileContent }),
    },
  })),

  on(actions.ValidateAuditDocumentSuccess, (state, { documentImport }) => ({
    ...state,
    auditRun: {
      ...state.auditRun,
      inputDocument: Document.toModel({ ...documentImport.importDoc, fileContent: state.auditRun.inputDocument.fileContent }),
    },
  })),

  on(actions.RunPreview, state => ({
    ...state,
    previewStatus: PreviewStatus.Running,
  })),

  on(actions.RunAuditorSuccess, (state, { auditRun }) => ({
    ...state,
    auditRun: auditRun || state.auditRun,
    isClosingDisabled: false,
  })),

  on(actions.SubmitApproveRequest, state => ({
    ...state,
    stage: AuditBatchStage.Results,
    previewStatus: PreviewStatus.Approve,
    auditRun: {
      ...state.auditRun,
      resultDocument: new Document({ id: 0 }),
    },
  })),

  on(actions.ShowAuditResults, (state, { auditRun }) => ({
    ...state,
    stage: auditRun.isPreview ? AuditBatchStage.Review : AuditBatchStage.Results,
    previewStatus: PreviewStatus.None,
    auditRun,
  })),

  on(actions.ShowAuditFailed, (state, { auditRun }) => ({
    ...state,
    stage: AuditBatchStage.Upload,
    previewStatus: PreviewStatus.None,
    auditRun: {
      ...auditRun,
      id: null
    },
    isFailed: true
  })),

  on(actions.ShowAuditResultsSuccess, (state, { auditRun, counts }) => ({
    ...state,
    stage: auditRun.isPreview ? AuditBatchStage.Review : AuditBatchStage.Results,
    previewStatus: PreviewStatus.None,
    auditRun: {
      ...state.auditRun,
      counts,
    },
  })),

  on(actions.StartRerun, state => ({
    ...state,
    auditRun: {
      ...state.auditRun,
      id: null,
      existedFileId: state.auditRun.inputDocument.fileContent?.size ? null : state.auditRun.inputDocument.id,
      inputDocument: new Document({
        filePath: state.auditRun.inputDocument.filePath,
        fileContent: state.auditRun.inputDocument.fileContent?.size
          ? state.auditRun.inputDocument.fileContent
          : { name: state.auditRun.inputDocument.fileName } as File,
      }),
    },
    stage: AuditBatchStage.Upload,
    previewStatus: PreviewStatus.None,
  })),
);

export function reducer(state: AuditBatchModalState | undefined, action: Action) {
  return Reducer(state, action);
}
