import { BankAccountSettings } from '../../../../models/bank-account-settings';
import { createReducer, on, Action } from '@ngrx/store';
import { BankAccount } from '@app/models/bank-account';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { PaymentPreferencesItem } from '@app/models';
import * as actions from './actions';

export interface BankAccountsState {
  index: BankAccount[],
  item: BankAccount,
  paymentPreference: PaymentPreferencesItem,
  isAccountNumberLoaded: boolean,
  isFfcAccountLoaded: boolean,
  itemDetailsHeader: BankAccount,
  params: IServerSideGetRowsParamsExtended,
  bankAccountSettings: BankAccountSettings | null;

  error: any,
  searchParams: {
    searchTerm: string,
  },
  actionBar: any,
  headerTitle: string;
}

export const bankAccountsInitialState: BankAccountsState = {
  index: null,
  item: null,
  paymentPreference: null,
  itemDetailsHeader: null,
  isAccountNumberLoaded: false,
  isFfcAccountLoaded: false,
  params: null,
  error: null,
  searchParams: { searchTerm: null },
  actionBar: null,
  headerTitle: null,
  bankAccountSettings: new BankAccountSettings({
    allowedFileExtensions: [],
    maxW9FileSizeInBytes: 0,
    w9FileRequired: false
  }),
};

export const Reducer = createReducer(
  bankAccountsInitialState,

  on(actions.GetBankAccounts, state => ({ ...state, index: bankAccountsInitialState.index, error: null })),

  on(actions.Error, (state, { error }) => ({ ...state, error , bankAccountSettings: null})),

  on(actions.GetBankAccountDetails, state => ({ ...state, error: null, item: null, itemDetailsHeader: null })),

  on(actions.GetBankAccountDetailsComplete, (state, { bankAccount }) => ({ ...state, item: bankAccount, itemDetailsHeader: bankAccount })),

  on(actions.UpdateBankAccount, (state, { bankAccount }) => ({ ...state, item: bankAccount })),

  on(actions.SaveBankAccount, state => ({ ...state })),

  on(actions.SaveBankAccountSuccess, (state, { bankAccount }) => ({ ...state, item: bankAccount, itemDetailsHeader: bankAccount })),

  on(actions.CreateBankAccount, state => ({ ...state })),

  on(actions.CreateBankAccountComplete, (state, { bankAccount }) => ({
    ...state,
    item: bankAccount,
  })),

  on(actions.GetAccountNumber, state => ({ ...state, isAccountNumberLoaded: false })),
  on(actions.GetAccountNumberComplete, (state, { accountNumber }) => ({ ...state, item: { ...state.item, accountNumber }, isAccountNumberLoaded: true })),
  on(actions.ResetIsAccountNumberLoaded, state => ({ ...state, isAccountNumberLoaded: false })),
  on(actions.GetFfcAccount, state => ({ ...state, isFfcAccountLoaded: false })),
  on(actions.GetFfcAccountSuccess, (state, { ffcAccount }) => ({ ...state, item: { ...state.item, ffcAccount }, isFfcAccountLoaded: true })),

  on(actions.CreatePaymentPreferenceComplete, (state, { paymentPreference }) => ({ ...state, paymentPreference })),
  on(actions.UpdatePaymentPreferenceComplete, (state, { paymentPreference }) => ({ ...state, paymentPreference })),

  on(actions.UpdateBankAccountsActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(actions.UpdateHeaderTitle, (state, { headerTitle }) => ({ ...state, headerTitle })),

  on(actions.GetBankAccountSettingsSuccess, (state, { settings }) => ({ ...state, bankAccountSettings: settings })),
);

export function reducer(state: BankAccountsState | undefined, action: Action) {
  return Reducer(state, action);
}
