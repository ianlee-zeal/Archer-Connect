import * as fromAccounting from './reducer';
import * as fromRoot from '../../../state';

export interface AppState extends fromRoot.AppState {
  accounting_feature: fromAccounting.AccountingState
}
