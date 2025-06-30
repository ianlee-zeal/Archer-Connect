import { IdValue } from '@app/models';
import { WorkflowCommandFilterTypesEnum } from '@app/models/enums/workflow-command-filter-types.enum';
import { WorkflowCommand } from '@app/models/workflow-command';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export const featureName = '[Workflow Commands]';

export const Error = createAction(`${featureName} Error`, props<{ error: any }>());

export const GetWorkflowCommandDetails = createAction(`${featureName} Get Workflow Command Details`, props<{ taskId: number }>());
export const GetWorkflowCommandDetailsComplete = createAction(`${featureName} Get Workflow Command Details Complete`, props<{ workflowCommandDetails: WorkflowCommand }>());

export const UpdateWorkflowCommand = createAction(`${featureName} Update Workflow Command`, props<{ workflowCommandDetails: WorkflowCommand }>());
export const UpdateWorkflowCommandComplete = createAction(`${featureName} Update Workflow Command Complete`, props<{ workflowCommandDetails: WorkflowCommand }>());

export const GetWorkflowCommandsList = createAction(`${featureName} Get Workflow Commands List`, props<{ gridParams: IServerSideGetRowsParamsExtended }>());
export const GetWorkflowCommandsListComplete = createAction(`${featureName} Get Workflow Commands List Complete`);

export const GetWorkflowCommandsFilters = createAction(`${featureName} Get Workflow Commands Filters`, props<{ filterType: WorkflowCommandFilterTypesEnum }>());
export const GetWorkflowCommandsFiltersComplete = createAction(`${featureName} Get Workflow Commands Filters Complete`, props<{ filterType: WorkflowCommandFilterTypesEnum, options: IdValue[] }>());

export const DeleteWorkflowCommand = createAction(`${featureName} Delete Workflow Command`, props<{ id: number }>());
export const DeleteWorkflowCommandComplete = createAction(`${featureName} Delete Workflow Command Complete`);

export const ClearWorkflowCommandDetails = createAction(`${featureName} Clear Workflow Command Details`);
export const GotoWorkflowCommands = createAction(`${featureName} Goto Workflow Commands`);
