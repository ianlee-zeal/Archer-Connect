import { createReducer, Action, combineReducers, on } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DocumentIntakeItem } from '@app/models';
import * as actions from './actions';

export interface DocumentIntakeState {
  common: DocumentIntakeCommonState,
}

interface DocumentIntakeCommonState {
  error: string,
  pending: boolean,
  agGridParams: IServerSideGetRowsParamsExtended,
  actionBar: ActionHandlersMap;
  documentIntakes: DocumentIntakeItem[],
}

const personCommonInitialState: DocumentIntakeCommonState = {
  error: null,
  pending: false,
  agGridParams: null,
  actionBar: null,
  documentIntakes: null,
};

export const initialState: DocumentIntakeState = { common: personCommonInitialState };

const documentIntakeCommonReducer = createReducer(
  personCommonInitialState,
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(actions.GetDocumentIntakeListRequest, (state, { agGridParams }) => ({ ...state, pending: true, error: null, agGridParams })),
  on(actions.GetDocumentIntakeListSuccess, (state, { documentIntakes }) => ({ ...state, pending: false, documentIntakes })),
  on(actions.GetDocumentIntakeListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),
);

function DocumentIntakeCommonReducer(state: DocumentIntakeCommonState | undefined, action: Action) {
  return documentIntakeCommonReducer(state, action);
}

const documentIntakeReducer = combineReducers({ common: DocumentIntakeCommonReducer }, initialState);

// we have to wrap our reducer like this or it won't compile in prod
export function DocumentIntakeReducer(state: DocumentIntakeState | undefined, action: Action) {
  return documentIntakeReducer(state, action);
}
