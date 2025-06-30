import { createReducer, combineReducers, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AuditRun } from '@app/models/auditor/audit-run';
import { IdValue } from '@app/models';

import * as fromAuditBatchModal from '@app/modules/auditor/audit-batches/audit-batch-modal/state/reducer';
import * as fromAuditDetails from '@app/modules/auditor/audit-batches/audit-details/state/reducer';
import * as auditBatchesActions from './actions';

export interface AuditBatchesGridState {
  error: string,
  agGridParams: IServerSideGetRowsParamsExtended,
  list: AuditRun[],

  collectorOptions: IdValue[],
}

export const auditBatchesGridState: AuditBatchesGridState = {
  error: undefined,

  agGridParams: null,
  list: [],

  collectorOptions: [],
};

const auditBatchesGridReducer = createReducer(
  auditBatchesGridState,

  on(auditBatchesActions.GetList, state => ({ ...state, error: null, list: null })),
  on(auditBatchesActions.GetListComplete, (state, { auditBatches, agGridParams }) => ({ ...state, list: auditBatches, agGridParams })),
  on(auditBatchesActions.GetListError, (state, { errorMessage }) => ({ ...state, error: errorMessage })),

  on(auditBatchesActions.GetCollectorsSuccess, (state, { collectorOptions }) => ({ ...state, collectorOptions })),

  on(auditBatchesActions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

export interface AuditBatchesState {
  grid: AuditBatchesGridState,
  modal: fromAuditBatchModal.AuditBatchModalState,
  auditDetails: fromAuditDetails.AuditDetailsState
}

export const auditBatchesState: AuditBatchesState = {
  grid: auditBatchesGridState,
  modal: fromAuditBatchModal.auditBatchModalState,
  auditDetails: fromAuditDetails.auditDetailsState,
};

const auditBatchesReducer = combineReducers({
  grid: auditBatchesGridReducer,
  modal: fromAuditBatchModal.reducer,
  auditDetails: fromAuditDetails.reducer,
}, auditBatchesState);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: AuditBatchesState | undefined, action: Action) {
  return auditBatchesReducer(state, action);
}
