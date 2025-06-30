import { createFeatureSelector, createSelector } from "@ngrx/store"

import * as fromPermissions from './reducer'
import * as fromAdmin from '../../state/state'
import * as fromAdminR from '../../state/reducer'

export interface AppState extends fromAdmin.AppState {
  permissions: fromPermissions.PermissionState
}

const selectFeature = createFeatureSelector<fromAdminR.AdminState>('admin_feature');

export const pending = createSelector(selectFeature, state => state.permissions.pending);
export const allPermissions = createSelector(selectFeature, state => state.permissions.allPermissions);
export const currentPermission = createSelector(selectFeature, state => state.permissions.currentPermission);
export const search = createSelector(selectFeature, state => state.permissions.search);
