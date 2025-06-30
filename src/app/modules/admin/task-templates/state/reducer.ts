import { TaskTemplate } from '@app/models/task-templates/task-template';
import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as actions from './actions';

export interface TaskTemplatesState {
  gridParams: IServerSideGetRowsParamsExtended;
  templateDetails: TaskTemplate
}

export const initialState: TaskTemplatesState = { gridParams: null, templateDetails: null };

export const Reducer = createReducer(
  initialState,
  on(actions.Error, (state, { error }) => ({ ...state, error })),
  on(actions.GetTaskTemplatesList, (state, { gridParams }) => ({ ...state, gridParams })),
  on(actions.CreateTemplateComplete, (state, { templateDetails }) => ({ ...state, templateDetails })),
  on(actions.UpdateTemplateComplete, (state, { templateDetails }) => ({ ...state, templateDetails })),
  on(actions.GetTemplateDetailsComplete, (state, { templateDetails }) => ({ ...state, templateDetails })),
);

export function reducer(state: TaskTemplatesState | undefined, action: Action) {
  return Reducer(state, action);
}
