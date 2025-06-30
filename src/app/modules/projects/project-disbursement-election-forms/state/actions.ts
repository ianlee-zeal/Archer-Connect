import { ElectionForm } from '@app/models/election-form';
import { IExportRequest } from '@app/models/export-request';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export const Error = createAction('[Election Forms] Election Forms Error', props<{ errorMessage: string }>());
export const GetElectionFormsGrid = createAction('[Election Forms List] Get Election Forms Grid', props<{ agGridParams: IServerSideGetRowsParamsExtended, projectId: number }>());
export const GetElectionFormsGridComplete = createAction('[Election Forms List] Get Election Forms Grid Complete', props<{ electionFormsGrid: ElectionForm[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const ExportElectionForms = createAction('[Election Forms List] Export Election Forms', props<{ exportRequest: IExportRequest }>());
