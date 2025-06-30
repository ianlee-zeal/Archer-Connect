
import * as fromRoot from '@app/state';
import * as reducers from './reducer'

export interface AppState extends fromRoot.AppState {
  widget: reducers.CallWidgetState
}
