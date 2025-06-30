import * as fromRoot from '@app/state';
import { CallCenterState } from './reducer';

export interface AppState extends fromRoot.AppState {
  callCenterFeature: CallCenterState
}

export const FEATURE_NAME = 'call_center_feature';
