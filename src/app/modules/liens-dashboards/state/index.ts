import * as fromRoot from '@app/state';
import { LienState } from './reducer';

export interface AppState extends fromRoot.AppState {
  lienFeature: LienState
}

export const FEATURE_NAME = 'leans_feature';
