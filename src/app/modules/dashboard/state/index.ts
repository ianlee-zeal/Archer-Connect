import { createFeatureSelector, createSelector } from '@ngrx/store'

import * as fromDashboard from './reducer'
import * as fromRoot from '@app/state'

export interface AppState extends fromRoot.AppState {
  dashboard_feature: fromDashboard.DashboardState
}

// State selectors
const selectFeature = createFeatureSelector<fromDashboard.DashboardState>('dashboard_feature');
export const pending = createSelector(selectFeature, state => state.pending)
export const error = createSelector(selectFeature, state => state.error);
