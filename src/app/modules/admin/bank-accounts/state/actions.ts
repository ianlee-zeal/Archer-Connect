import { createAction, props } from '@ngrx/store';

import { BankAccount } from '@app/models/bank-account';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { PaymentPreferencesItem } from '@app/models';
import { ApiErrorResponse } from '@app/models/api-error-response';
import { BankAccountSettings } from '@app/models/bank-account-settings';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

const featureName = '[Bank-Accounts]';

export const GetBankAccounts = createAction(`${featureName} Get Bank Accounts`, props<{ params: any }>());
export const GetBankAccountsComplete = createAction(`${featureName} Get Bank Accounts Complete`, props<{ items: BankAccount[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const Error = createAction(`${featureName} API Error`, props<{ error: any }>());
export const GetBankAccountDetails = createAction(`${featureName} Get Bank Account`, props<{ accountId: number }>());
export const GetBankAccountDetailsComplete = createAction(`${featureName} Get Bank Account Details Complete`, props<{ bankAccount: BankAccount }>());
export const UpdateBankAccount = createAction(`${featureName} Update Bank Account Details`, props<{ bankAccount: BankAccount }>());

export const SaveBankAccount = createAction(`${featureName} Save Bank Accounts`, props<{
  bankAccount: BankAccount,
  isUpdateAccountNumber: boolean,
  isUpdateFfcAccount: boolean,
  isUpdateACHABARoutingNumber: boolean,
  w9File: File
}>());
export const SaveBankAccountSuccess = createAction(`${featureName} Save Bank Accounts Complete`, props<{ bankAccount: BankAccount }>());
export const SaveBankAccountError = createAction(`${featureName} Save Bank Account Error`, props<{ error: ApiErrorResponse }>());

export const SaveBankAccountField = createAction(`${featureName} Save Bank Account Field`, props<{ accountId: number, fieldName: string, value: string }>());
export const SaveIndividualFieldSuccess = createAction(`${featureName} Save Individual Field Success`, props<{fieldName: string}>());
export const SaveIndividualFieldError = createAction(`${featureName} Save Individual Field Error`, props < { fieldName: string, error: any }>());

export const CreateBankAccount = createAction(`${featureName} Create Bank Account`, props<{ bankAccount: BankAccount, w9File: File }>());
export const CreateBankAccountComplete = createAction(`${featureName} Create Bank Account Complete`, props<{ bankAccount: BankAccount }>());
export const CreateBankAccountError = createAction(`${featureName} Create New Bank Account Error`, props<{ error: ApiErrorResponse }>());

export const ApproveBankAccount = createAction(`${featureName} Approve Bank Account`);
export const ApproveBankAccountComplete = createAction(`${featureName} Approve Bank Account Complete`);

export const RejectBankAccount = createAction(`${featureName} Reject Bank Account`);
export const RejectBankAccountComplete = createAction(`${featureName} Reject Bank Account Complete`);

export const GetAccountNumber = createAction(`${featureName} Get Bank Account Number`, props<{ accountId: number }>());
export const GetAccountNumberComplete = createAction(`${featureName} Get Bank Account Number Complete`, props<{ accountNumber: string }>());
export const GetFfcAccount = createAction(`${featureName} Get Fcc Account`, props<{ accountId: number }>());
export const GetFfcAccountSuccess = createAction(`${featureName} Get Fcc Account Success`, props<{ ffcAccount: string }>());
export const ResetIsAccountNumberLoaded = createAction(`${featureName} Reset Is Account Number Loaded`);

export const CreatePaymentPreference = createAction(`${featureName} Create Payment Preference`, props<{ paymentPreference: PaymentPreferencesItem }>());
export const CreatePaymentPreferenceComplete = createAction(`${featureName} Create Payment Preference Complete`, props<{ paymentPreference: PaymentPreferencesItem }>());

export const UpdatePaymentPreference = createAction(`${featureName} Update Payment Preference`, props<{ paymentPreference: PaymentPreferencesItem }>());
export const UpdatePaymentPreferenceComplete = createAction(`${featureName} Update Payment Preference Complete`, props<{ paymentPreference: PaymentPreferencesItem }>());

export const UpdateBankAccountsActionBar = createAction(`${featureName} Update BankAccounts Action Bar`, props<{ actionBar: ActionHandlersMap }>());
export const UpdateHeaderTitle = createAction(`${featureName} Update Header Title`, props<{ headerTitle: string }>());

export const GetBankAccountSettings = createAction(`${featureName} Request W9 File Settings`, props<{ orgId: number }>());
export const GetBankAccountSettingsSuccess = createAction(`${featureName} Get W9 File Settings Success`, props<{ settings: BankAccountSettings }>());