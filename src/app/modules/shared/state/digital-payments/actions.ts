import { IdValue } from '@app/models';
import { IExportRequest } from '@app/models/export-request';
import { createAction, props } from '@ngrx/store';

export const FEATURE_NAME = '[DigitalPayments]';

export const GetDigitalProviderStatusesRequest = createAction(`${FEATURE_NAME} Get Digital Provider Statuses Request`);
export const GetDigitalProviderStatusesSuccess = createAction(`${FEATURE_NAME} Get Digital Provider Statuses Success`, props<{ digitalProviderStatuses: IdValue[] }>());

export const ExportDigitalPayRosterRequest = createAction(`${FEATURE_NAME} Export Digital Pay Roster Request`, props<{ exportRequest: IExportRequest }>());
export const ExportDigitalPayRosterSuccess = createAction(`${FEATURE_NAME} Export Digital Pay Roster Success`, props<{ channel: string }>());

export const DownloadDocument = createAction(`${FEATURE_NAME} Download Document`, props<{ id: number }>());

export const Error = createAction(`${FEATURE_NAME} Error`, props<{ error: any }>());
