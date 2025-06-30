import { createReducer, Action, on } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import * as actions from './actions';

export interface DeficiencySettingsTemplatesState {
  templates: DeficiencySettingsTemplate[];
  gridParams: IServerSideGetRowsParamsExtended;
  error: string;
}

export const deficienciesSettingsTemplatesState: DeficiencySettingsTemplatesState = {
  templates: null,
  gridParams: null,
  error: null,
};

const Reducer = createReducer(
  deficienciesSettingsTemplatesState,
  on(actions.GetDeficienciesTemplatesList, (state: DeficiencySettingsTemplatesState, { params }: { params: IServerSideGetRowsParamsExtended }) => ({ ...state, error: null, gridParams: params })),
  on(actions.GetDeficienciesTemplatesListSuccess, (state: DeficiencySettingsTemplatesState, { templates }: { templates: DeficiencySettingsTemplate[] }) => ({ ...state, error: null, templates })),
);

export function reducer(state: DeficiencySettingsTemplatesState | undefined, action: Action): DeficiencySettingsTemplatesState {
  return Reducer(state, action);
}
