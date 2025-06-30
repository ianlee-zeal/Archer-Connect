import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorkflowCommandFilterTypesEnum } from '@app/models/enums/workflow-command-filter-types.enum';
import * as fromWorkflowCommands from './reducer';
import { featureName } from './actions';

const workflowCommands = createFeatureSelector<fromWorkflowCommands.WorkflowCommandsState>(featureName);

export const gridParams = createSelector(workflowCommands, (state:fromWorkflowCommands.WorkflowCommandsState) => state.gridParams);
export const workflowCommandDetails = createSelector(workflowCommands, (state:fromWorkflowCommands.WorkflowCommandsState) => state.workflowCommandDetails);
export const workflowCommandFilters = createSelector(
  workflowCommands,
  (state: fromWorkflowCommands.WorkflowCommandsState, props: { filterType: WorkflowCommandFilterTypesEnum }) => state.workflowCommandFilters.get(props.filterType) ?? [],
);
