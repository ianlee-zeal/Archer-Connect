import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { createReducer, combineReducers, on, Action } from '@ngrx/store';

import * as clientsListActions from './actions';
import { ActionHandlersMap } from '../../action-bar/action-handlers-map';

import * as fromAdvancedSearch from '../advanced-search/reducer';

export interface ListState {
  error: any,
  pending: any,
  agGridParams: IServerSideGetRowsParamsExtended,
  actionBar: ActionHandlersMap,
}

export interface UserListSearchParams {
  roleId: number;
  searchTerm: string;
}

const initialListState: ListState = {
  error: null,
  pending: false,
  agGridParams: null,
  actionBar: null,
};

const listReducer = createReducer(
  initialListState,
  on(clientsListActions.GetAGClients, state => ({ ...state, pending: true, error: null })),

  on(clientsListActions.GetAGClientsComplete, (state, { params }) => ({ ...state, agGridParams: params })),

  on(clientsListActions.UpdateClientsListActionBar, (state, { actionBar }) => ({ ...state, actionBar:  { ...actionBar } })),
);

function ListReducer(state: ListState | undefined, action: Action) {
  return listReducer(state, action);
}

export interface ClientsListState {
  list: ListState,
  advancedSearch: fromAdvancedSearch.AdvancedSearchState,
}

const initialState: ClientsListState = {
  list: initialListState,
  advancedSearch: fromAdvancedSearch.initialState,
};

export const clientsListReducer = combineReducers({
  list: ListReducer,
  advancedSearch: fromAdvancedSearch.AdvancedSearchReducerFor(clientsListActions.FEATURE_NAME),
}, initialState);

export function ClientsListReducer(state: ClientsListState | undefined, action: Action) {
  return clientsListReducer(state, action);
}
