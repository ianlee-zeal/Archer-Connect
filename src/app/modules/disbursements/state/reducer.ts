import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { PaymentGridRecordLight, PaymentRequestDetails, PaymentRequestSummary, PaymentRequestTotalInfo } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as actions from './actions';
import { TransferRequestTotalInfo } from '@app/models'
import { TransferRequestDetails } from '@app/models'
import { TransferRequestSummary } from '@app/models'

export interface IPaymentRequestDetailsCounts {
  voidedItems: number;
  otherItems: number;
}

export interface DisbursementState {
  error: string,
  actionBar: ActionHandlersMap,
  agGridParams: IServerSideGetRowsParamsExtended,
  disbursements: PaymentRequestSummary[],
  transferRequests: TransferRequestSummary[],

  stopPaymentRequestList: PaymentGridRecordLight[],
  stopPaymentRequestGridParams: IServerSideGetRowsParamsExtended,

  paymentRequestDetails: PaymentRequestDetails[];
  paymentRequestDetailsGridParams: IServerSideGetRowsParamsExtended;
  paymentRequestTotal: PaymentRequestTotalInfo;

  transferRequestDetails: TransferRequestDetails[];
  transferRequestDetailsGridParams: IServerSideGetRowsParamsExtended;
  transferRequestTotal: TransferRequestTotalInfo;

  paymentRequestDetailsCounts: IPaymentRequestDetailsCounts;
  transferRequestDetailsCounts: IPaymentRequestDetailsCounts;
}

const settlementCommonInitialState: DisbursementState = {
  error: null,
  agGridParams: null,
  actionBar: null,
  disbursements: null,
  stopPaymentRequestList: null,
  stopPaymentRequestGridParams: null,
  paymentRequestDetails: null,
  paymentRequestDetailsGridParams: null,
  paymentRequestTotal: null,
  paymentRequestDetailsCounts: null,
  transferRequestDetails: null,
  transferRequestDetailsGridParams: null,
  transferRequestTotal: null,
  transferRequests: null,
  transferRequestDetailsCounts: null,
};

const disbursementsReducer = createReducer(
  settlementCommonInitialState,
  on(actions.Error, (state, { errorMessage }) => ({ ...state, errorMessage })),
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

  on(actions.GetStopPaymentRequestList, (state, { agGridParams }) => ({ ...state, stopPaymentRequestGridParams: agGridParams })),
  on(actions.GetStopPaymentRequestListComplete, (state, { stopPaymentRequestList }) => ({ ...state, error: null, stopPaymentRequestList })),

  on(actions.GetDisbursementsList, state => ({ ...state, pending: true, error: null, disbursements: null })),
  on(actions.GetDisbursementsListComplete, (state, { disbursements, agGridParams }) => ({ ...state, pending: false, disbursements, agGridParams })),
  on(actions.GetDisbursementsListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(actions.GetPaymentRequestDetailsComplete, (state, { paymentRequestDetails, agGridParams }) => ({ ...state, paymentRequestDetails, paymentRequestDetailsGridParams: agGridParams })),
  on(actions.GetPaymentRequestTotalComplete, (state, { paymentRequestTotal }) => ({ ...state, paymentRequestTotal })),
  on(actions.GetPaymentRequestVoidCountsComplete, (state, { voidedItems, otherItems }) => ({ ...state, paymentRequestDetailsCounts: { voidedItems, otherItems } })),
  on(actions.ResetPaymentRequestVoidCounts, (state, {  }) => ({ ...state, paymentRequestDetailsCounts: null })),

  on(actions.GetTransferRequestsList, state => ({ ...state, pending: true, error: null, transferRequests: null })),
  on(actions.GetTransferRequestsListComplete, (state, { transferRequests, agGridParams }) => ({ ...state, pending: false, transferRequests, agGridParams })),
  on(actions.GetTransferRequestsListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(actions.GetTransferRequestTotalComplete, (state, { transferRequestTotal }) => ({ ...state, transferRequestTotal })),

  on(actions.GetTransferRequestVoidCountsComplete, (state, { voidedItems, otherItems }) => ({ ...state, transferRequestDetailsCounts: { voidedItems, otherItems } })),
  on(actions.ResetTransferRequestVoidCounts, (state, {  }) => ({ ...state, transferRequestDetailsCounts: null })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function DisbursementsReducer(state: DisbursementState | undefined, action: Action) {
  return disbursementsReducer(state, action);
}
