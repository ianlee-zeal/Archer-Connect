import { DeficienciesSettingState } from './reducers';
import * as fromProjects from '../../state';

export const FEATURE_NAME = 'deficiencies-setting_feature';

export interface AppState extends fromProjects.AppState {
  deficienciesSettingFeature: DeficienciesSettingState
}
