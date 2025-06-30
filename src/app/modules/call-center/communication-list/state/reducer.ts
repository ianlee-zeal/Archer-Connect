import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { EntityTypeEnum } from '@app/models/enums';
import * as actions from './actions';
import { ActionHandlersMap } from '../../../shared/action-bar/action-handlers-map';

export interface CommunicationListState {
  error: string,
  pending: boolean,
  entityId: number | null,
  entityType: EntityTypeEnum | null,
  agGridParams: IServerSideGetRowsParamsExtended | null,
  actionBar: ActionHandlersMap,
  communications: any,
}

export const communicationListState: CommunicationListState = {
  error: null,
  pending: false,
  entityId: null,
  entityType: null,
  agGridParams: null,
  actionBar: null,
  communications: null,
};

const Reducer = createReducer(
  communicationListState,
  on(actions.GetCommunicationListRequest, (state, { payload }) => ({
    ...state,
    pending: true,
    error: null,
    entityId: payload.entityId,
    entityType: payload.entityType,
    agGridParams: payload.agGridParams,
  })),

  on(actions.GetCommunicationListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(actions.GetCommunicationListSuccess, (state, { communications }) => ({ ...state, communications, error: null })),

  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
);

export function reducer(state: CommunicationListState | undefined, action: Action) {
  return Reducer(state, action);
}
