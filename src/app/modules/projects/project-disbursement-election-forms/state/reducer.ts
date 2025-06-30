import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { ElectionForm } from '@app/models/election-form';
import * as electionFormsActions from './actions';

export interface ElectionFormsState {
  agGridParams: IServerSideGetRowsParamsExtended,
  electionFormsGrid: ElectionForm[],
}

export const electionFormsInitialState: ElectionFormsState = {
  agGridParams: null,
  electionFormsGrid: null,
};

// main reducer function
export const electionFormsReducer = createReducer(
  electionFormsInitialState,
  on(electionFormsActions.GetElectionFormsGrid, state => ({ ...state, error: null })),
  on(electionFormsActions.GetElectionFormsGridComplete, (state, { electionFormsGrid, agGridParams }) => ({ ...state, electionFormsGrid, agGridParams })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function mainReducer(state: ElectionFormsState | undefined, action: Action) {
  return electionFormsReducer(state, action);
}
