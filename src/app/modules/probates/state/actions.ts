import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ColumnExport, IdValue, ProbateDetails } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { SaveAdvancedSearchVisibilityFor, SaveSearchParamsFor } from '@app/modules/shared/state/advanced-search/actions';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

const featureName = '[Probates]';

export const Error = createAction(`${featureName} Error Message`, props<{ error: string }>());

export const GetProbatesList = createAction(`${featureName} Get Probates List`, props<{ probatesGridParams: IServerSideGetRowsParamsExtended }>());
export const GetProbatesListSuccess = createAction(`${featureName} Get Probates List Success`, props<{ probates: ProbateDetails[], probatesGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const DownloadProbates = createAction(`[${featureName}] Download Probates`, props<{
  searchOptions: IServerSideGetRowsRequestExtended,
  columns: ColumnExport[],
  channelName: string,
}>());
export const DownloadProbatesComplete = createAction(`[${featureName}] Download Probates Complete`, props<{ channel: string }>());
export const DownloadProbatesDocument = createAction(`[${featureName}] Download Probates Document`, props<{ id: number }>());

export const EnqueueGenerateFirmUpdate = createAction(`[${featureName}] Enqueue Generate Firm Update`, props<{
  columns: ColumnExport[],
  channelName: string,
  projectId: number,
}>());

export const EnqueueGenerateFirmUpdateSuccess = createAction(`[${featureName}] Enqueue Generate Firm Update Success`, props<{ channel: string }>());

export const ExportPendingPacketRequests = createAction(`[${featureName}] Export Pending Packet Requests`, props<{
  columns: ColumnExport[],
  channelName: string,
  statusesIds: number[],
}>());

export const ExportPendingPacketRequestsSuccess = createAction(`[${featureName}] Export Pending Packet Requests Success`, props<{ channel: string }>());

export const SaveSearchParams = SaveSearchParamsFor(featureName);
export const SaveAdvancedSearchVisibility = SaveAdvancedSearchVisibilityFor(featureName);
export const UpdateProbatesListActionBar = createAction(`[${featureName}] Update Probates List Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GoToProbateDetails = createAction(`[${featureName}] Go To Probate Details`, props<{ clientId: number }>());
export const GoToProbatesListPage = createAction(`[${featureName}] Go To Probates List Page Details`);

export const GetProjectsWithProbates = createAction(`${featureName} Get Projects With Probates`, props<{ searchTerm: string }>());
export const GetProjectsWithProbatesSuccess = createAction(`${featureName} Get Projects With Probates Success`, props<{ projectsWithProbates: SelectOption[] }>());
export const GetProjectsCodesWithProbates = createAction(`${featureName} Get Projects Codes With Probates`, props<{ searchTerm: string }>());
export const GetProjectsCodesWithProbatesSuccess = createAction(`${featureName} Get Projects Codes With Probates Success`, props<{ projectsCodesWithProbates: SelectOption[] }>());

export const GetPacketRequestsStages = createAction(`${featureName} Get Packet Requests Stages`);
export const GetPacketRequestsStagesSuccess = createAction(`${featureName} Get Packet Requests Stages Success`, props<{ packetRequestsStages: IdValue[] }>());
