/* eslint-disable @typescript-eslint/no-use-before-define */
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Action, combineReducers, createReducer, on } from '@ngrx/store';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

import { BatchActionReviewOptions } from '@app/models/batch-action/batch-action-review-options';
import { CopySpecialPaymentInstructionData } from '@app/models/payment-queue/copy-special-payment-instruction-data';
import { LienPaymentStageValidationResult } from '@app/models/payment-queue/validation-results';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/reducer';
import * as actions from './actions';
import { BankAccount, Org } from '@app/models';

export interface PaymentQueueState {
  common: PaymentQueueCommonState;
  advancedSearch: fromAdvancedSearch.AdvancedSearchState,
}

export interface PaymentQueueCommonState {
  gridParams: IServerSideGetRowsParamsExtended;
  actionBar: ActionHandlersMap;
  error: string;
  lienPaymentStageValidationResult: LienPaymentStageValidationResult[];
  paymentInstructions: CopySpecialPaymentInstructionData[];
  batchActionDeficienciesReview: BatchActionReviewOptions;
  bankAccounts: BankAccount[];
  item: Org,
  id: number,
}

const initialCasesCommonState: PaymentQueueCommonState = {
  gridParams: null,
  actionBar: null,
  error: null,
  lienPaymentStageValidationResult: null,
  paymentInstructions: null,
  batchActionDeficienciesReview: null,
  bankAccounts: null,
  item: null,
  id: null,
};

export const paymentQueueInitialState: PaymentQueueState = {
  common: initialCasesCommonState,
  advancedSearch: fromAdvancedSearch.initialState,
};

const paymentQueueCommonReducer = createReducer(
  initialCasesCommonState,

  on(actions.Error, (state: PaymentQueueCommonState, { error }: { error: string }) => ({ ...state, error })),

  on(actions.UpdateActionBar, (state: PaymentQueueCommonState, { actionBar }) => ({ ...state, actionBar })),

  on(actions.GetPaymentQueueList, (state: PaymentQueueCommonState) => ({ ...state, pending: true, error: null })),
  on(actions.GetPaymentQueueListComplete, (state: PaymentQueueCommonState, { agGridParams }) => ({ ...state, pending: false, gridParams: agGridParams })),
  on(actions.GetPaymentQueueListError, (state: PaymentQueueCommonState, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),
  on(actions.GetCopySpecialPaymentInstructions, (state: PaymentQueueCommonState) => ({ ...state, pending: true, error: null })),
  on(actions.GetCopySpecialPaymentInstructionsSuccess, (state: PaymentQueueCommonState, { paymentInstructions }) => ({ ... state, paymentInstructions: paymentInstructions })),
  on(actions.ResetCopySpecialPaymentInstructions, (state: PaymentQueueCommonState) => ({ ... state, paymentInstructions: null})),

  on(actions.ResetGetBatchActionLienPaymentStageValidationResult, (state: PaymentQueueCommonState) => ({ ...state, lienPaymentStageValidationResult: null })),

  on(actions.ResetCopySpecialPaymentInstructionsValidationResult, (state: PaymentQueueCommonState) => ({ ...state, lienPaymentStageValidationResult: null })),
  on(actions.InvoiceArcherFeesDeficienciesSummarySuccess, (state, { batchActionDeficienciesReview }) => ({ ...state, batchActionDeficienciesReview })),

  on(actions.ClearOrgBankAccountsList, (state: PaymentQueueCommonState) => ({ ...state, bankAccounts: null, pending: false })),
  on(actions.GetOrg, (state: PaymentQueueCommonState, { id }) => ({ ...state, id, item: null, error: null, pending: true })),
  on(actions.GetOrgComplete, (state: PaymentQueueCommonState, { data }) => ({ ...state, item: data, pending: false })),
);

function PaymentQueueCommonReducer(state: PaymentQueueCommonState | undefined, action: Action): PaymentQueueCommonState {
  return paymentQueueCommonReducer(state, action);
}

export const paymentQueueReducer = combineReducers({
  common: PaymentQueueCommonReducer,
  advancedSearch: fromAdvancedSearch.AdvancedSearchReducerFor(actions.featureName),
}, paymentQueueInitialState);

// we have to wrap our reducer like this or it won't compile in prod
export function paymentQueueReducerWrapper(state: PaymentQueueState | undefined, action: Action): PaymentQueueState {
  return paymentQueueReducer(state, action);
}
