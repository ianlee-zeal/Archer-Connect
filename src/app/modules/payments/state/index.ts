import * as fromRoot from '../../../state';
import * as PaymentsReducer from './reducer';

export interface AppState extends fromRoot.AppState {
  payments: PaymentsReducer.PaymentsState
}
