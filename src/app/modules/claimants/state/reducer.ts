import { createReducer, on, Action } from '@ngrx/store';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { IdValue } from '@app/models';
import * as claimantActions from './actions';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export interface ClaimantsState {
  gridParamsRequest: IServerSideGetRowsRequestExtended,
  actionBar: ActionHandlersMap,
  missingDocsOptions: IdValue[],
  docsToSendOptions: IdValue[],
  allDocuments: IdValue[],
}

const initialState: ClaimantsState = {
  gridParamsRequest: null,
  actionBar: null,
  missingDocsOptions: [],
  docsToSendOptions: [],
  allDocuments: [],
};

// main reducer function
export const claimantsReducer = createReducer(
  initialState,
  on(claimantActions.UpdateClaimantListDataSource, (state, { gridParamsRequest }) => ({ ...state, gridParamsRequest })),
  on(claimantActions.UpdateClaimantsActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

  on(claimantActions.GetAllMissingDocsSuccess, (state, { missingDocsOptions }) => ({ ...state, missingDocsOptions })),
  on(claimantActions.GetAllDocsToSendSuccess, (state, { docsToSendOptions }) => ({ ...state, docsToSendOptions })),
  on(claimantActions.GetDocumentsByProbateIdSuccess, (state, { allDocuments }) => ({ ...state, allDocuments })),

  on(claimantActions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function mainReducer(state: ClaimantsState | undefined, action: Action) {
  return claimantsReducer(state, action);
}
