import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { createReducer, on, Action, combineReducers } from '@ngrx/store';

import { Payment } from '@app/models/payment';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/reducer';
import { IdValue } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { StopPaymentRequest } from '@app/models/stop-payment-request';
import { CheckVerificationGrid } from '@app/models/check-verification/check-verification-grid';
import { CheckVerification } from '@app/models/check-verification/check-verification';
import * as paymentsActions from './actions';

export interface PaymentsState {
  common: PaymentsCommonState,
  advancedSearch: fromAdvancedSearch.AdvancedSearchState,
}

interface PaymentsCommonState {
  index: Payment[],
  subOrganizations: IdValue[],
  bankAccounts: IdValue[],
  item: Payment,
  stopPaymentRequest: StopPaymentRequest,
  stopPaymentRequestData: {
    addressTypes: IdValue[],
    statuses: IdValue[],
    resendReasons: IdValue[],
    resendReasonSpecifications: IdValue[],
  },
  params: IServerSideGetRowsParamsExtended,
  error: any,
  actionBar: ActionHandlersMap,
  checkVerification: CheckVerification,
  checkVerificationCount: number,
  checkVerificationGridParams: IServerSideGetRowsParamsExtended,
  checkVerificationList: CheckVerificationGrid[],
}

const paymentsCommonInitialState: PaymentsCommonState = {
  index: null,
  subOrganizations: null,
  bankAccounts: null,
  item: null,
  stopPaymentRequest: null,
  stopPaymentRequestData: {
    addressTypes: null,
    statuses: null,
    resendReasons: null,
    resendReasonSpecifications: null,
  },
  params: null,
  error: null,
  actionBar: null,
  checkVerification: null,
  checkVerificationCount: null,
  checkVerificationGridParams: null,
  checkVerificationList: null,
};

export const paymentsInitialState: PaymentsState = {
  common: paymentsCommonInitialState,
  advancedSearch: fromAdvancedSearch.initialState,
};

const paymentsCommonReducer = createReducer(
  paymentsCommonInitialState,

  on(paymentsActions.GetPayments, state => ({ ...state, index: paymentsCommonInitialState.index, error: null })),
  on(paymentsActions.GetPaymentsComplete, (state, { params }) => ({ ...state, params })),
  on(paymentsActions.GetPaymentItemDetails, state => ({ ...state, index: paymentsCommonInitialState.index, error: null })),
  on(paymentsActions.GetPaymentItemDetailsComplete, (state, { params }) => ({ ...state, params })),
  on(paymentsActions.Error, (state, { error }) => ({ ...state, error })),
  on(paymentsActions.GetPaymentDetails, state => ({ ...state, error: null, item: null })),
  on(paymentsActions.GetPaymentDetailsComplete, (state, { payment }) => ({ ...state, item: payment, checkVerificationCount: payment.checkVerifications?.length })),

  on(paymentsActions.GetSubOrganizations, state => ({ ...state, subOrganizations: null })),
  on(paymentsActions.GetSubOrganizationsComplete, (state, { subOrganizations }) => ({ ...state, subOrganizations })),

  on(paymentsActions.GetOrgBankAccounts, state => ({ ...state, bankAccounts: null })),
  on(paymentsActions.GetOrgBankAccountsComplete, (state, { bankAccounts }) => ({ ...state, bankAccounts })),
  on(paymentsActions.ClearOrgBankAccounts, state => ({ ...state, bankAccounts: null })),
  on(paymentsActions.GetPaymentsComplete, (state, { params }) => ({ ...state, params })),

  on(paymentsActions.GetStopPaymentDetails, state => ({ ...state, error: null, stopPaymentRequest: null })),
  on(paymentsActions.GetStopPaymentDetailsComplete, (state, { stopPaymentRequest }) => ({ ...state, stopPaymentRequest })),

  on(paymentsActions.GetStopPaymentDropdownValuesComplete, (state, { addressTypes, statuses, resendReasons, resendReasonSpecifications }) => ({
    ...state,
    stopPaymentRequestData: { addressTypes, statuses, resendReasons, resendReasonSpecifications },
  })),

  on(paymentsActions.ResetStopPaymentRequest, state => ({ ...state, error: null, stopPaymentRequestList: null, stopPaymentRequest: null, totalCountsStopPaymentRequestList: null })),
  on(paymentsActions.ResetPaymentDetails, state => ({ ...state, error: null, item: null })),

  on(paymentsActions.UpdatePaymentsSearchListActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

  on(paymentsActions.GetCheckVerificationDetails, state => ({ ...state, error: null, checkVerification: null })),
  on(paymentsActions.GetCheckVerificationDetailsComplete, (state, { checkVerification }) => ({ ...state, checkVerification })),

  on(paymentsActions.GetCheckVerificationList, (state, { agGridParams }) => ({ ...state, checkVerificationGridParams: agGridParams })),
  on(paymentsActions.GetCheckVerificationListComplete, (state, { checkVerificationList }) => ({ ...state, error: null, checkVerificationList })),

  on(paymentsActions.ResetCheckVerification, state => ({ ...state, error: null, checkVerification: null })),
);

function PaymentsCommonReducer(state: PaymentsCommonState | undefined, action: Action) {
  return paymentsCommonReducer(state, action);
}

const reducer = combineReducers({
  common: PaymentsCommonReducer,
  advancedSearch: fromAdvancedSearch.AdvancedSearchReducerFor(paymentsActions.FEATURE_NAME),
}, paymentsInitialState);

// we have to wrap our reducer like this or it won't compile in prod
export function Reducer(state: PaymentsState | undefined, action: Action) {
  return reducer(state, action);
}
