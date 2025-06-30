import { createAction, props } from '@ngrx/store';
import { IdValue } from '@app/models';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AuditDocImportTemplate } from '@app/models/auditor/audit-doc-import-template';
import { RunAuditorCommand } from '@app/models/auditor/run-auditor-command';
import { DocumentImport } from '@app/models/documents';
import { AuditRun } from '@app/models/auditor/audit-run';
import { AuditRunCreation } from '@app/models/auditor/audit-run-creation';

import { FileImportReviewTabs } from '@app/models/enums';
import { AuditResultCounts } from '@app/models/auditor/audit-result-counts';
import { AuditValidationResults } from '@app/models/auditor/audit-validation-results';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export const FEATURE_NAME = '[Audit Batch Modal]';

export const Error = createAction(`${FEATURE_NAME} Error`, props<{ error: any }>());

export const GetDropdownValues = createAction(`${FEATURE_NAME} Get Dropdown Values`, props<{ searchOptions: IServerSideGetRowsRequestExtended }>());
export const GetDropdownValuesSuccess = createAction(`${FEATURE_NAME} Get Dropdown Values Success`, props<{ collectors: IdValue[], templates: AuditDocImportTemplate[] }>());

export const SetTemplate = createAction(`${FEATURE_NAME} Set Template`, props<{ template: AuditDocImportTemplate }>());
export const SetSettings = createAction(`${FEATURE_NAME} Set Settings`, props<{ settings: any }>());

export const SetSelectedFile = createAction(`${FEATURE_NAME} Set Selected File`, props<{ selectedFile: File }>());

export const SetModalStage = createAction(`${FEATURE_NAME} Set Modal Stage`, props<{ incr: number }>());

export const StartPreview = createAction(`${FEATURE_NAME} Start Preview`);
export const RunPreview = createAction(`${FEATURE_NAME} Run Preview`);

export const CreateAuditRun = createAction(`${FEATURE_NAME} Create Audit Run`, props<{ auditRunCreation: AuditRunCreation }>());
export const CreateAuditRunSuccess = createAction(`${FEATURE_NAME} Create Audit Run Success`, props<{ auditRun: AuditRun }>());

export const ValidateAuditDocument = createAction(`${FEATURE_NAME} Validate Audit Document`, props<{ file: File, documentImport: DocumentImport }>());
export const ValidateAuditDocumentSuccess = createAction(`${FEATURE_NAME} Validate Audit Document Success`, props<{ documentImport: DocumentImport }>());

export const ResetOnErrorState = createAction(`${FEATURE_NAME} Reset on Error`);

export const ResetAuditBatchModalState = createAction(`${FEATURE_NAME} Reset Audit Batch Modal State`);

export const RunAuditor = createAction(`${FEATURE_NAME} Run Auditor`, props<{ runAuditorCommand: RunAuditorCommand, approve: boolean }>());
export const RunAuditorSuccess = createAction(`${FEATURE_NAME} Run Auditor Success`, props<{ auditRun: AuditRun }>());

export const GetAuditValidationResults = createAction(`${FEATURE_NAME} Get Audit Validation Results`, props<{ tab: FileImportReviewTabs, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetAuditValidationResultsSuccess = createAction(`${FEATURE_NAME} Get Audit Validation Results Success`, props<{
  agGridParams: IServerSideGetRowsParamsExtended,
  tab: FileImportReviewTabs,
  auditValidationResults: AuditValidationResults,
  totalRecordsCount: number
}>());

export const SubmitApproveRequest = createAction(`${FEATURE_NAME} Audit Batch Approve Request`);

export const ShowAuditResults = createAction(`${FEATURE_NAME} Show Audit Results`, props<{ auditRun: AuditRun }>());
export const ShowAuditFailed = createAction(`${FEATURE_NAME} Show Audit Failed`, props<{ auditRun: AuditRun }>());
export const ShowAuditResultsSuccess = createAction(`${FEATURE_NAME} Show Audit Results Success`, props<{ auditRun: AuditRun, counts: AuditResultCounts }>());

export const RefreshAuditRunGrid = createAction(`${FEATURE_NAME} Refresh Audit Run Grid`);
export const StartRerun = createAction(`${FEATURE_NAME} Start Rerun`);
