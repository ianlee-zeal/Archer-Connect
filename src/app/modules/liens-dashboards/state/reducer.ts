import { Action, combineReducers } from '@ngrx/store';

import * as fromProbateDashboard from '../probate-dashboard/state/reducer';
import * as fromDashboardClaimantsList from '../dashboard-claimants-list/state/reducer';

import * as fromReleaseDashboard from '../release-dashboard/state/reducer';
import * as fromReleaseDashboardClaimantsList from '../release-dashboard-claimants-list/state/reducer';

import * as fromBankruptcyDashboard from '../bankruptcy-dashboard/state/reducer';
import * as fromBankruptcyDashboardClaimantsList from '../bankruptcy-dashboard-claimants-list/state/reducer';

import * as fromLienResolutionDashboard from '../lien-resolution-dashboard/state/reducer';
import * as fromLienResolutionDashboardClaimantsList from '../lien-resolution-dashboard-claimants-list/state/reducer';

import * as fromQsfAdminDashboard from '../qsf-admin-dashboard/state/reducer';
import * as fromQsfAdminDashboardClaimantsList from '../qsf-admin-dashboard-claimants-list/state/reducer';

export interface LienState {
  probateDashboard: fromProbateDashboard.ProbateDashboardState,
  releaseDashboard: fromReleaseDashboard.ReleaseDashboardState,
  dashboardClaimaintsList:fromDashboardClaimantsList.ProbateDashboardClaimantsListCommonState,
  releaseDashboardClaimaintsList: fromReleaseDashboardClaimantsList.ReleaseDashboardClaimantsListCommonState,
  bankruptcyDashboard: fromBankruptcyDashboard.BankruptcyDashboardState,
  bankruptcyDashboardClaimaintsList: fromBankruptcyDashboardClaimantsList.BankruptcyDashboardClaimantsListCommonState,
  lienResolutionDashboard: fromLienResolutionDashboard.LienResolutionDashboardState,
  lienResolutionDashboardClaimaintsList: fromLienResolutionDashboardClaimantsList.LienResolutionDashboardClaimantsListCommonState
  qsfAdminDashboard: fromQsfAdminDashboard.QsfAdminDashboardState,
  qsfAdminDashboardClaimaintsList: fromQsfAdminDashboardClaimantsList.QsfAdminDashboardClaimantsListCommonState,
}

export const initialState: LienState = {
  probateDashboard: fromProbateDashboard.probateDashboardState,
  dashboardClaimaintsList: fromDashboardClaimantsList.initialState,
  releaseDashboard: fromReleaseDashboard.releaseDashboardState,
  releaseDashboardClaimaintsList: fromReleaseDashboardClaimantsList.initialState,
  bankruptcyDashboard: fromBankruptcyDashboard.bankruptcyDashboardState,
  bankruptcyDashboardClaimaintsList: fromBankruptcyDashboardClaimantsList.initialState,
  lienResolutionDashboard: fromLienResolutionDashboard.lienResolutionDashboardState,
  lienResolutionDashboardClaimaintsList: fromLienResolutionDashboardClaimantsList.initialState,
  qsfAdminDashboard: fromQsfAdminDashboard.qsfAdminDashboardState,
  qsfAdminDashboardClaimaintsList: fromQsfAdminDashboardClaimantsList.initialState,
};

const Reducer = combineReducers({
  probateDashboard: fromProbateDashboard.reducer,
  dashboardClaimaintsList: fromDashboardClaimantsList.ProbateReducer,
  releaseDashboard: fromReleaseDashboard.reducer,
  releaseDashboardClaimaintsList: fromReleaseDashboardClaimantsList.ReleaseReducer,
  bankruptcyDashboard: fromBankruptcyDashboard.reducer,
  bankruptcyDashboardClaimaintsList: fromBankruptcyDashboardClaimantsList.BankruptcyReducer,
  lienResolutionDashboard: fromLienResolutionDashboard.reducer,
  lienResolutionDashboardClaimaintsList: fromLienResolutionDashboardClaimantsList.LienResolutionReducer,
  qsfAdminDashboard: fromQsfAdminDashboard.reducer,
  qsfAdminDashboardClaimaintsList: fromQsfAdminDashboardClaimantsList.QsfAdminReducer,
}, initialState);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: LienState | undefined, action: Action) {
  return Reducer(state, action);
}
