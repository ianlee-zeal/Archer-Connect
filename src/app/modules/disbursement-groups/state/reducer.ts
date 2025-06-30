import { createReducer, on, Action } from '@ngrx/store';

import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import * as actions from './actions';

export interface DisbursementGroupsState {
  disbursementGroupTypes: SelectOption[],
  disbursementGroupStages: SelectOption[],
  deficiencySettingsTemplates: DeficiencySettingsTemplate[],
}

const initialProjectsCommonState: DisbursementGroupsState = {
  disbursementGroupTypes: [],
  disbursementGroupStages: [],
  deficiencySettingsTemplates: [],
};

const disbursementGroupsReducer = createReducer(
  initialProjectsCommonState,
  on(actions.GetDisbursementGroupTypesSuccess, (state: DisbursementGroupsState, { types } : { types: SelectOption[] }) => ({ ...state, disbursementGroupTypes: types })),
  on(actions.GetDisbursementGroupStagesSuccess, (state: DisbursementGroupsState, { stages }: { stages: SelectOption[] }) => ({ ...state, disbursementGroupStages: stages })),
  on(actions.GetDeficiencySettingsTemplatesSuccess, (state: DisbursementGroupsState, { templates }: { templates: DeficiencySettingsTemplate[] }) => ({ ...state, deficiencySettingsTemplates: templates })),
  on(actions.ResetDisbursementGroupTypes, (state: DisbursementGroupsState) => ({ ...state, disbursementGroupTypes: [] })),
  on(actions.ResetDisbursementGroupStages, (state: DisbursementGroupsState) => ({ ...state, disbursementGroupStages: [] })),
  on(actions.ResetDeficiencySettingsTemplates, (state: DisbursementGroupsState) => ({ ...state, deficiencySettingsTemplates: [] })),

  on(actions.Error, (state: DisbursementGroupsState, { error }: { error: String }) => ({ ...state, error })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function DisbursementGroupsReducerReducer(state: DisbursementGroupsState | undefined, action: Action): DisbursementGroupsState {
  return disbursementGroupsReducer(state, action);
}
