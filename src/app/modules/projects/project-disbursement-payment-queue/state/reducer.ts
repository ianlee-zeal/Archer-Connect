import { PaymentQueue } from '@app/models/payment-queue';
import { Action, combineReducers, createReducer, on } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/reducer';
import { PaymentQueueCounts } from '@app/models/payment-queue-counts';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import * as paymentQueueActions from './actions';

export interface PaymentQueueState {
  common: PaymentQueueCommonState;
  advancedSearch: fromAdvancedSearch.AdvancedSearchState,
}

export interface PaymentQueueCommonState {
  agGridParams: IServerSideGetRowsParamsExtended,
  paymentQueueGrid: PaymentQueue[],
  paymentQueueCounts: PaymentQueueCounts,
  lienPaymentStages: SelectOption[],
  coaGroupNumbers: SelectOption[]
  coaNumbers: SelectOption[]
  ledgerEntryStatuses: SelectOption[],
  lienStatuses: SelectOption[],
  bankruptcyStatuses: SelectOption[],
  bankruptcyStages: SelectOption[],
  activeLienPaymentStages: SelectOption[],
  selectedPaymentQueueGrid: PaymentQueue[],
  authorizedGridParams: IServerSideGetRowsParamsExtended,
  unAuthorizedGridParams: IServerSideGetRowsParamsExtended,
  selectedAuthorizedPaymentQueueGrid: PaymentQueue[],
  selectedUnauthorizedPaymentQueueGrid: PaymentQueue[],
  authorizedResultGridParams: IServerSideGetRowsParamsExtended,
  selectedAuthorizedPaymentQueueResultGrid: PaymentQueue[],
}

export const paymentQueueCommonInitialState: PaymentQueueCommonState = {
  agGridParams: null,
  paymentQueueGrid: null,
  paymentQueueCounts: null,
  lienPaymentStages: null,
  coaGroupNumbers: null,
  coaNumbers: null,
  ledgerEntryStatuses: null,
  lienStatuses: null,
  bankruptcyStatuses: null,
  bankruptcyStages: null,
  activeLienPaymentStages: null,
  selectedPaymentQueueGrid: null,
  authorizedGridParams: null,
  selectedAuthorizedPaymentQueueGrid: null,
  unAuthorizedGridParams:null,
  selectedUnauthorizedPaymentQueueGrid: null,
  authorizedResultGridParams: null,
  selectedAuthorizedPaymentQueueResultGrid: null,
};

export const paymentQueueInitialState: PaymentQueueState = {
  common: paymentQueueCommonInitialState,
  advancedSearch: fromAdvancedSearch.initialState,
};

export const paymentQueueCommonReducer = createReducer(
  paymentQueueCommonInitialState,
  on(paymentQueueActions.GetPaymentQueueGrid, state => ({ ...state, error: null })),
  on(paymentQueueActions.GetPaymentQueueGridComplete, (state, { paymentQueueGrid, agGridParams }) => ({ ...state, paymentQueueGrid, agGridParams })),
  on(paymentQueueActions.GetLienPaymentStagesSuccess, (state, { stages }) => ({ ...state, lienPaymentStages: stages })),
  on(paymentQueueActions.GetPaymentQueueCountsComplete, (state, { paymentQueueCounts }) => ({ ...state, paymentQueueCounts })),
  on(paymentQueueActions.GetChartOfAccountGroupNumbersComplete, (state, { coaGroupNumbers }) => ({ ...state, coaGroupNumbers })),
  on(paymentQueueActions.GetChartOfAccountNumbersComplete, (state, { coaNumbers }) => ({ ...state, coaNumbers })),
  on(paymentQueueActions.GetLedgerEntryStatusesComplete, (state, { ledgerEntryStatuses }) => ({ ...state, ledgerEntryStatuses })),
  on(paymentQueueActions.GetLienStatusesSuccess, (state: PaymentQueueCommonState, { statuses }) => ({ ...state, lienStatuses: statuses })),
  on(paymentQueueActions.GetBankruptcyStatusesSuccess, (state: PaymentQueueCommonState, { options }) => ({ ...state, bankruptcyStatuses: options })),
  on(paymentQueueActions.GetBankruptcyStagesSuccess, (state: PaymentQueueCommonState, { options }) => ({ ...state, bankruptcyStages: options })),

  on(paymentQueueActions.GetSelectedPaymentQueueGrid, state => ({ ...state, selectedPaymentQueueGrid: null, error: null })),
  on(paymentQueueActions.GetSelectedPaymentQueueGridComplete, (state, { paymentQueueGrid }) => ({ ...state, selectedPaymentQueueGrid: paymentQueueGrid })),
  on(paymentQueueActions.GetActiveLienPaymentStagesSuccess, (state, { stages }) => ({ ...state, activeLienPaymentStages: stages })),
  on(paymentQueueActions.ValidateAuthorizeLedgerEntriesRequestSuccess, (state, { batchAction }) => ({ ...state, batchAction })),
  on(paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersGrid, state => ({ ...state, selectedAuthorizedPaymentQueueGrid: null, authorizedGridParams:null, error: null })),
  on(paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersGridComplete, (state, { paymentQueueGrid, agGridParams }) => ({ ...state, selectedAuthorizedPaymentQueueGrid: paymentQueueGrid, authorizedGridParams: agGridParams })),
  on(paymentQueueActions.GetSelectedPaymentQueueUnauthorizedLedgersGrid, state => ({ ...state, selectedUnauthorizedPaymentQueueGrid: null,unAuthorizedGridParams:null, error: null })),
  on(paymentQueueActions.GetSelectedPaymentQueueUnauthorizedLedgersGridComplete, (state, { paymentQueueGrid, agGridParams }) => ({ ...state, selectedUnauthorizedPaymentQueueGrid: paymentQueueGrid,unAuthorizedGridParams: agGridParams })),
  on(paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersResultGrid, state => ({ ...state, selectedAuthorizedPaymentQueueResultGrid: null, authorizedResultGridParams:null, error: null })),
  on(paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersResultGridComplete, (state, { paymentQueueGrid, agGridParams }) => ({ ...state, selectedAuthorizedPaymentQueueResultGrid: paymentQueueGrid,authorizedResultGridParams: agGridParams })),
);

function PaymentQueueCommonReducer(state: PaymentQueueCommonState | undefined, action: Action) {
  return paymentQueueCommonReducer(state, action);
}

export const paymentQueueReducer = combineReducers({
  common: PaymentQueueCommonReducer,
  advancedSearch: fromAdvancedSearch.AdvancedSearchReducerFor(paymentQueueActions.FEATURE_NAME),
}, paymentQueueInitialState);

// we have to wrap our reducer like this or it won't compile in prod
export function mainReducer(state: PaymentQueueState | undefined, action: Action) {
  return paymentQueueReducer(state, action);
}
