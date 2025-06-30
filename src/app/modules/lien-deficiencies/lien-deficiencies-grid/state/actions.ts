import { IntegrationDto } from '@app/models/lien-deficiencies/integrationDto';
import { IntegrationJob } from '@app/models/lien-deficiencies/integration-job';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Status } from '@app/models/status';

export const FEATURE_NAME = '[Lien Deficiencies Grid]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ error: any }>());

export const GetList = createAction(`${FEATURE_NAME} Get List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetListComplete = createAction(`${FEATURE_NAME} Get List Complete`, props<{ lienDeficiencyItems: IntegrationJob[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetListError = createAction(`${FEATURE_NAME} Get List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const StartRun = createAction(`${FEATURE_NAME} Start Run`, props<{ integrationDto: IntegrationDto }>());
export const StartRunSuccess = createAction(`${FEATURE_NAME} Start Run Success`, props<{ integrationDto: IntegrationDto }>());

export const SetStatus = createAction(`${FEATURE_NAME} Set Status`, props<{ status: Status }>());
export const Reset = createAction(`${FEATURE_NAME} Reset`);

export const RefreshLienDeficienciesGrid = createAction(`${FEATURE_NAME} Refresh Grid`);

export const DownloadDocument = createAction(`[${FEATURE_NAME}] Download Document`, props<{ jobId: number }>());
