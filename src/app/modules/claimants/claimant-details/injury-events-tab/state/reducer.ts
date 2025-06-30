import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as addressesListActions from './actions';
import { InjuryEvent } from '@app/models/injury-event';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

export interface IInjuryEventsListState {
  error: any;
  injuryEvents: InjuryEvent[];
  agGridParams: IServerSideGetRowsParamsExtended;
  actionBar: ActionHandlersMap;
}

const initialState: IInjuryEventsListState = {
  error: null,
  injuryEvents: null,
  agGridParams: null,
  actionBar: null,
};

const injuryEventsListReducer = createReducer(
  initialState,
  on(addressesListActions.GetInjuryEventsListComplete, (state,
    { injuryEvents, agGridParams }) => ({ ...state, injuryEvents, agGridParams, error: null })),
);


// we have to wrap our reducer like this or it won't compile in prod
export function InjuryEventListReducer(state: IInjuryEventsListState | undefined, action: Action) {
  return injuryEventsListReducer(state, action);
}
