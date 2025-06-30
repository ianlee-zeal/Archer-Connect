/* eslint-disable @typescript-eslint/no-use-before-define */
import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { DocumentImport, DocumentImportTemplate } from '@app/models/documents';
import { FileImportReviewTabs, UploadBulkDocumentStage, UploadBulkDocumentStageWithoutConfigure } from '@app/models/enums';

import { ValidationResults } from '@app/models/file-imports';
import { IdValue } from '@app/models';
import { DisbursementGroupLight } from '@app/models/disbursement-group-light';
import { IProgressValues } from '@app/models/file-imports/progress-values';
import { IUploadBulkDropdownData } from '@app/models/documents/dropdown-data';
import * as actions from './actions';

interface GridState {
  agGridParams: IServerSideGetRowsParamsExtended,
  validationResults: ValidationResults
}

export interface SharedUploadBulkDocumentState {
  documentImport: DocumentImport,
  updateProgress: boolean,
  error: any,
  previewFileRows: ValidationResults,
  stage: UploadBulkDocumentStage | UploadBulkDocumentStageWithoutConfigure,
  allowedExtensions: string[],
  isValidSelect: boolean,
  isValidGroupSelect: boolean,
  isValidConfigure: boolean,
  isValidUpload: boolean,
  data: IUploadBulkDropdownData,
  selectedTemplate: DocumentImportTemplate,
  isValidationInProgress: boolean,
  isProcessingInProgress: boolean,
  isApproved: boolean,
  reviewGrids: {
    [FileImportReviewTabs.AllRecords]: GridState,
    [FileImportReviewTabs.Errors]: GridState,
    [FileImportReviewTabs.Warnings]: GridState,
    [FileImportReviewTabs.Queued]: GridState
  },
  disbursementGroups: DisbursementGroupLight[],
  projectFirmsOptions: IdValue[],
  progressValues: IProgressValues,
  previewTotalPayment: number,
}

const initialState: SharedUploadBulkDocumentState = {
  documentImport: null,
  updateProgress: false,
  error: null,
  previewFileRows: null,
  stage: null,
  allowedExtensions: null,
  isValidSelect: false,
  isValidGroupSelect: false,
  isValidConfigure: false,
  isValidUpload: false,
  data: null,
  selectedTemplate: null,
  isValidationInProgress: false,
  isProcessingInProgress: false,
  isApproved: false,
  reviewGrids: {
    [FileImportReviewTabs.AllRecords]: null,
    [FileImportReviewTabs.Errors]: null,
    [FileImportReviewTabs.Warnings]: null,
    [FileImportReviewTabs.Queued]: null,
  },
  disbursementGroups: null,
  projectFirmsOptions: [],
  progressValues: {
    progressCurrentCount: 0,
    progressTotalCount: 0,
    progressWidth: '0%',
    progressValue: '0',
    progressLoadedRows: null,
  },
  previewTotalPayment: null,
};

// main reducer function
const sharedUploadBulkDocumentReducer = createReducer(
  initialState,
  on(actions.SubmitBulkDocumentRequest, (state, { documentImport }) => ({ ...state, error: null, documentImport })),
  on(actions.ApproveJobRequest, actions.ApproveDocument, state => ({ ...state, isApproved: true })),
  on(actions.SubmitBulkDocumentSuccess, (state, { documentImport }) => ({ ...state, file: null, documentImport, error: null })),
  on(actions.Error, (state, { error }) => ({ ...state, error, file: null, document: null })),
  on(actions.ResetUploadBulkDocumentState, state => ({
    ...state,
    file: null,
    error: null,
    document: null,
    documentImport: null,
    selectedTemplate: null,
    isValidConfigure: false,
    isValidSelect: false,
    isValidUpload: false,
    data: null,
    previewFileRows: null,
    stage: null,
    isValidationInProgress: false,
    isProcessingInProgress: false,
    isApproved: false,
    reviewGrids: {
      [FileImportReviewTabs.AllRecords]: null,
      [FileImportReviewTabs.Errors]: null,
      [FileImportReviewTabs.Warnings]: null,
      [FileImportReviewTabs.Queued]: null,
    },
  })),
  on(actions.GetDocumentImportByIdSuccess, (state, { documentImport }) => ({ ...state, documentImport })),
  on(actions.SetDocumentImportTemplate, (state, { selectedTemplate }) => ({ ...state, selectedTemplate })),
  on(actions.UpdateProgress, (state, { updateProgress }) => ({ ...state, updateProgress })),
  on(actions.GetDocumentImportPreviewSuccess, (state, { previewFileRows }) => ({ ...state, previewFileRows })),
  on(actions.ResetDocumentImportPreviewRows, state => ({ ...state, previewFileRows: null })),
  on(actions.SetModalStage, (state, { stage }) => ({ ...state, stage })),
  on(actions.SetDocumentImport, (state, { documentImport }) => ({ ...state, documentImport, isValidGroupSelect: false })),
  on(actions.IsValidSelect, (state, { isValidSelect }) => ({ ...state, isValidSelect })),
  on(actions.isValidGroupSelect, (state, { isValidGroupSelect }) => ({ ...state, isValidGroupSelect })),
  on(actions.IsValidConfigure, (state, { isValidConfigure }) => ({ ...state, isValidConfigure })),
  on(actions.IsValidUpload, (state, { isValidUpload }) => ({ ...state, isValidUpload })),
  on(actions.LoadDefaultDataComplete, (state, { data }) => ({
    ...state,
    data: { ...data, templates: data.templates.map(DocumentImportTemplate.toModel), templateCategories: data.templateCategories },
  })),
  on(actions.IsValidationInProgress, (state, { isValidationInProgress }) => ({ ...state, isValidationInProgress })),
  on(actions.IsProcessingInProgress, (state, { isProcessingInProgress }) => ({ ...state, isProcessingInProgress })),
  on(actions.GetDocumentImportsResultSuccess, (
    state,
    { agGridParams, tab, validationResults },
  ) => (
    { ...state, reviewGrids: { ...state.reviewGrids, [tab]: { ...state.reviewGrids[tab], agGridParams, validationResults } } }
  )),
  on(actions.LoadDisbursementGroupsDataComplete, (state, { data }) => ({ ...state, disbursementGroups: data })),
  on(actions.ResetOnErrorUploadBulkDocumentState, state => ({
    ...state,
    documentImport: <DocumentImport>{
      config: state.documentImport.config,
      entityId: state.documentImport.entityId,
      entityTypeId: state.documentImport.entityTypeId,
      templateId: state.documentImport.templateId,
      templateName: state.documentImport.templateName,
    },
    isValidUpload: false,
    isValidationInProgress: false,
    isValidGroupSelect: false,
  })),
  on(actions.GetProjectFirmsOptionsSuccess, (state, { options }) => ({ ...state, projectFirmsOptions: options })),
  on(actions.DocumentImportGetTotalPaymentSuccess, (state, { totalPayment }) => ({ ...state, previewTotalPayment: totalPayment })),

  on(actions.SetProgressValues, (state, { progressValues }) => ({ ...state, progressValues })),
  on(actions.ResetProgressValues, state => ({
    ...state,
    progressValues: {
      progressCurrentCount: 0,
      progressTotalCount: 0,
      progressWidth: '0%',
      progressValue: '0',
      progressLoadedRows: null,
    },
  })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedUploadBulkDocumentReducer(state: SharedUploadBulkDocumentState | undefined, action: Action) {
  return sharedUploadBulkDocumentReducer(state, action);
}
