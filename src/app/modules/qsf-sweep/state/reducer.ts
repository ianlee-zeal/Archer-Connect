import { QSFLienSweepStatus } from '@app/models/enums/qsf-lien-sweep-status.enum';
import { QSFSweepBatch } from '@app/models/qsf-sweep/qsf-sweep-batch';
import { QSFSweepCommitChangesResponse } from '@app/models/qsf-sweep/qsf-sweep-commit-changes-response';
import { Action, createReducer, on } from '@ngrx/store';
import * as actions from './actions';

export interface QsfSweepState {
  error: string,
  isQsfSweepInProgress: boolean,

  statusData: QSFSweepBatch,
  qsfSweepBatch: QSFSweepBatch,
  qsfCommitChangesResponse: QSFSweepCommitChangesResponse,
  isLoading: boolean,
}

const qsfSweepInitialState: QsfSweepState = {
  error: null,
  isQsfSweepInProgress: false,
  statusData: null,
  qsfSweepBatch: null,
  qsfCommitChangesResponse: null,
  isLoading: false,
};

const qsfSweepReducer = createReducer(
  qsfSweepInitialState,
  on(actions.Error, (state: QsfSweepState, { errorMessage }: { errorMessage: string }) => ({ ...state, errorMessage, isLoading: false })),
  on(actions.SetQsfSweepStatus, (state: QsfSweepState, { isQsfSweepInProgress }: { isQsfSweepInProgress: boolean }) => ({ ...state, isQsfSweepInProgress })),
  on(actions.RunQsfSweepComplete, (state: QsfSweepState, { statusId }: { channelName: string, statusId: QSFLienSweepStatus }) => ({
    ...state,
    isQsfSweepInProgress: (statusId == QSFLienSweepStatus.Created || statusId == QSFLienSweepStatus.Processing),
  })),
  on(actions.CheckCaseSweepStatus, (state: QsfSweepState) => ({ ...state, isLoading: true })),
  on(actions.CheckCaseSweepStatusComplete, (state: QsfSweepState, { data }: { data:QSFSweepBatch }) => ({ ...state, statusData: data, isLoading: false })),
  on(actions.GetQsfSweepBatchByIdRequest, (state: QsfSweepState) => ({ ...state, qsfSweepBatch: null })),
  on(actions.GetQsfSweepBatchByIdSuccess, (state: QsfSweepState, { data }: { data:QSFSweepBatch }) => ({ ...state, qsfSweepBatch: data })),
  on(actions.QsfSweepCommitChangesSuccess, (state: QsfSweepState, { qsfCommitChangesResponse }: { qsfCommitChangesResponse:QSFSweepCommitChangesResponse }) => ({ ...state, qsfCommitChangesResponse })),
  on(actions.ResetQsfSweepCommitChanges, (state: QsfSweepState) => ({ ...state, qsfCommitChangesResponse: null })),
  on(actions.QsfSweepValidateCommitChangesRequest, (state: QsfSweepState) => ({ ...state, isLoading: true })),
  on(actions.QsfSweepValidateCommitChangesSuccess, (state: QsfSweepState, { qsfCommitChangesResponse }: { qsfCommitChangesResponse:QSFSweepCommitChangesResponse }) => ({
    ...state,
    qsfCommitChangesResponse,
    isLoading: false,
  })),
);

export function QsfSweepReducer(state: QsfSweepState | undefined, action: Action): QsfSweepState {
  return qsfSweepReducer(state, action);
}
