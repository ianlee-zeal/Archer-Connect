import * as fromRoot from '../../../../state';
import * as BankAccountsReducer from './reducer';

export interface AppState extends fromRoot.AppState {
  bankAccounts: BankAccountsReducer.BankAccountsState
}
