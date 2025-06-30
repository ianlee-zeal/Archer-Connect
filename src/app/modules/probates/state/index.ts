import * as fromProbates from './reducer';
import * as fromRoot from '../../../state';

export interface AppState extends fromRoot.AppState {
  probates_feature: fromProbates.ProbatesState
}
