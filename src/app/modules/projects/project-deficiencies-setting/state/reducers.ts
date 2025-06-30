import { Action, combineReducers } from '@ngrx/store';

import * as fromConfig from '../project-deficiencies-details/state/reducers';
import * as fromTemplates from '../project-deficiencies-grid/state/reducers';

export interface DeficienciesSettingState {
  config: fromConfig.DeficienciesTemplateDetailsState,
  templates: fromTemplates.DeficiencySettingsTemplatesState,
}

export const initialState: DeficienciesSettingState = {
  config: fromConfig.deficienciesConfigState,
  templates: fromTemplates.deficienciesSettingsTemplatesState,
};

const Reducer = combineReducers({
  config: fromConfig.reducer,
  templates: fromTemplates.reducer,
}, initialState);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: DeficienciesSettingState | undefined, action: Action): DeficienciesSettingState {
  return Reducer(state, action);
}
