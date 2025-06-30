import { QSFLienSweepStatus } from '@app/models/enums/qsf-lien-sweep-status.enum';
import { IExportRequest } from '@app/models/export-request';
import { QSFSweepBatch } from '@app/models/qsf-sweep/qsf-sweep-batch';
import { QSFSweepBatchResult } from '@app/models/qsf-sweep/qsf-sweep-batch-result';
import { QSFSweepCommitChangesRequest } from '@app/models/qsf-sweep/qsf-sweep-commit-changes-request';
import { QSFSweepCommitChangesResponse } from '@app/models/qsf-sweep/qsf-sweep-commit-changes-response';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

const featureName = '[QSF Sweep]';

export const Error = createAction(`${featureName} Error`, props<{ errorMessage: string }>());

export const OpenRunQsfSweepModal = createAction(`${featureName} Open Run QSF Sweep Modal`, props<{ caseId: number, claimantsCount: number, onSave?:Function }>());

export const SetQsfSweepStatus = createAction(`${featureName} Set Sweep Status`, props<{ isQsfSweepInProgress: boolean }>());

export const RunQsfSweep = createAction(`${featureName} Run QSF Sweep`, props<{ caseId: number }>());
export const RunQsfSweepComplete = createAction(`${featureName} Run QSF Sweep Complete`, props<{ channelName: string, statusId: QSFLienSweepStatus }>());

export const CheckCaseSweepStatus = createAction(`${featureName} Check QSF Sweep status`, props<{ caseId: number }>());
export const CheckCaseSweepStatusComplete = createAction(`${featureName} Check QSF Sweep Complete`, props<{ data: QSFSweepBatch }>());

export const GetQsfSweepBatchByIdRequest = createAction(`${featureName} Get Qsf Sweep Batch By Id Request`, props<{ batchId: number }>());
export const GetQsfSweepBatchByIdSuccess = createAction(`${featureName} Get Qsf Sweep Batch By Id Success`, props<{ data: QSFSweepBatch }>());

export const GetQsfSweepBatchListRequest = createAction(`${featureName} Get Qsf Sweep Batch List Request`, props<{ gridParams: IServerSideGetRowsParamsExtended }>());
export const GetQsfSweepBatchListSuccess = createAction(`${featureName} Get Qsf Sweep Batch List Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, batches: QSFSweepBatch[], totalRecords: number }>());

export const GetQsfSweepBatchResultListRequest = createAction(`${featureName} Get Qsf Sweep Batch Result List Request`, props<{ batchId: number, gridParams: IServerSideGetRowsParamsExtended }>());
export const GetQsfSweepBatchResultListSuccess = createAction(`${featureName} Get Qsf Sweep Batch Result List Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, results: QSFSweepBatchResult[], totalRecords: number }>());

export const QsfSweepCommitChangesRequest = createAction(`${featureName} Qsf Sweep Commit Changes Request`, props<{ batchId: number, request: QSFSweepCommitChangesRequest }>());
export const QsfSweepCommitChangesSuccess = createAction(`${featureName} Qsf Sweep Commit Changes Success`, props<{ qsfCommitChangesResponse: QSFSweepCommitChangesResponse }>());
export const ResetQsfSweepCommitChanges = createAction(`${featureName} Reset Qsf Sweep Commit Changes`);

export const QsfSweepValidateCommitChangesRequest = createAction(`${featureName} Qsf Sweep Validate Commit Changes Request`, props<{ batchId: number, request: QSFSweepCommitChangesRequest }>());
export const QsfSweepValidateCommitChangesSuccess = createAction(`${featureName} Qsf Sweep Validate Commit Changes Success`, props<{ qsfCommitChangesResponse: QSFSweepCommitChangesResponse }>());

export const DownloadQSFSweepResultList = createAction(`${featureName} Download QSF Sweep Batch List`, props<{ batchId: number, exportRequest : IExportRequest }>());
export const DownloadQSFSweepResultListComplete = createAction(`[${featureName}] Download SF Sweep Batch Complete`, props<{ channel: string }>());

export const DownloadDocument = createAction(`${featureName} Download Document`, props<{ id: number }>());
export const DownloadDocumentComplete = createAction(`${featureName} Download Document Complete`);
export const DownloadDocumentError = createAction(`${featureName} Download Document Error`);

export const GotoResultDetailsPage = createAction(`${featureName} Goto Result Details Page`, props<{ batchId: number }>());
