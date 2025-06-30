import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { WorkflowCommand } from '@app/models/workflow-command';
import { WorkflowCommandFilterTypesEnum } from '@app/models/enums/workflow-command-filter-types.enum';
import { IdValue } from '@app/models';
import * as actions from './actions';

export interface WorkflowCommandsState {
  gridParams: IServerSideGetRowsParamsExtended;
  workflowCommandDetails: WorkflowCommand;
  workflowCommandFilters: Map<WorkflowCommandFilterTypesEnum, IdValue[]>;
}

export const initialState: WorkflowCommandsState = {
  gridParams: null,
  workflowCommandDetails: null,
  workflowCommandFilters: new Map<WorkflowCommandFilterTypesEnum, IdValue[]>() };

function getNewFilters(state: WorkflowCommandsState, filterType: WorkflowCommandFilterTypesEnum, options: IdValue[]): Map<WorkflowCommandFilterTypesEnum, IdValue[]> {
  const newOptions: Map<WorkflowCommandFilterTypesEnum, IdValue[]> = state.workflowCommandFilters.set(filterType, options);
  return newOptions;
}

export const Reducer = createReducer(
  initialState,
  on(actions.Error, (state: WorkflowCommandsState, { error }: { error: string }) => (
    { ...state, error })),
  on(actions.GetWorkflowCommandsList, (state: WorkflowCommandsState, { gridParams }: { gridParams: IServerSideGetRowsParamsExtended }) => (
    { ...state, gridParams })),
  on(actions.UpdateWorkflowCommand, (state: WorkflowCommandsState, { workflowCommandDetails }: { workflowCommandDetails: WorkflowCommand }) => (
    { ...state, workflowCommandDetails })),
  on(actions.GetWorkflowCommandDetailsComplete, (state: WorkflowCommandsState, { workflowCommandDetails }: { workflowCommandDetails: WorkflowCommand }) => (
    { ...state, workflowCommandDetails })),
  on(actions.GetWorkflowCommandsFiltersComplete, (state: WorkflowCommandsState, { filterType, options } : { filterType: WorkflowCommandFilterTypesEnum, options: IdValue[] }) => ({
    ...state,
    workflowCommandFilters: getNewFilters(state, filterType, options),
  })),
  on(actions.ClearWorkflowCommandDetails, (state: WorkflowCommandsState) => ({ ...state, workflowCommandDetails: null })),
);

export function reducer(state: WorkflowCommandsState | undefined, action: Action): WorkflowCommandsState {
  return Reducer(state, action);
}
