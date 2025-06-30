import { combineReducers, createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AuditRun } from '@app/models/auditor/audit-run';
import { AuditRunDetails } from '@app/models/auditor/audit-run-details';
import * as auditDetailsActions from './actions';

export interface AuditDetailsCommonState {
  error: string,

  auditDetailsHeader: AuditRun;
}

export const auditDetailsCommonState: AuditDetailsCommonState = {
  error: undefined,

  auditDetailsHeader: null,
};

const auditDetailsCommonReducer = createReducer(
  auditDetailsCommonState,

  on(auditDetailsActions.GetAuditDetails, state => ({ ...state, error: null, auditDetailsHeader: null })),
  on(auditDetailsActions.GetAuditDetailsComplete, (state, { item }) => ({ ...state, auditDetailsHeader: item })),
  on(auditDetailsActions.ResetAuditDetails, state => ({ ...state, auditDetailsHeader: null })),
  on(auditDetailsActions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

export interface AuditClaimsGridState {
  agGridParams: IServerSideGetRowsParamsExtended,
  list: AuditRunDetails[],
}

export const auditClaimsGridState: AuditClaimsGridState = {
  agGridParams: null,
  list: [],
};

const auditClaimsGridReducer = createReducer(
  auditClaimsGridState,

  on(auditDetailsActions.GetAuditClaimsList, state => ({ ...state, error: null, list: null })),
  on(auditDetailsActions.GetAuditClaimsListComplete, (state, { auditClaims, agGridParams }) => ({ ...state, list: auditClaims, agGridParams })),
  on(auditDetailsActions.GetAuditClaimsListError, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

export interface AuditDetailsState {
  common: AuditDetailsCommonState,
  auditClaimsGrid: AuditClaimsGridState,
}

export const auditDetailsState: AuditDetailsState = {
  common: auditDetailsCommonState,
  auditClaimsGrid: auditClaimsGridState,
};

const auditDetailsReducer = combineReducers({
  common: auditDetailsCommonReducer,
  auditClaimsGrid: auditClaimsGridReducer,
}, auditDetailsState);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: AuditDetailsState | undefined, action: Action) {
  return auditDetailsReducer(state, action);
}
