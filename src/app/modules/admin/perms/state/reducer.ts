import {
  Action,
  createReducer,
  on
} from '@ngrx/store';
import * as permissionActions from "./actions";

import { Permission } from "../../../../models/permission";

export interface PermissionState {
  allPermissions: Permission[];
  currentPermission: Permission;
  error: any;
  pending: boolean;
  search: {
    page: number;
    per_page: number;
    permissionTypeId: number | null,
    entityId: number | null,
    search_term: string;
    admin_user_id: number;
    status: number;
    sort_on: string;
    sort: string;
  }
}

export const permissionsInitialState: PermissionState = {
  allPermissions: [],
  currentPermission: null,
  error: null,
  pending: false,
  search: {
    page: 1,
    per_page: 30,
    permissionTypeId: null,
    entityId: null,
    search_term: null,
    admin_user_id: null,
    status: null,
    sort_on: 'name',
    sort: 'asc',
  }
};

export const Reducer = createReducer(
  permissionsInitialState,
  on(permissionActions.GetPermissions, state => ({
    ...state,
    pending: true
  })),

  on(permissionActions.GetPermissionsCompleted, (state, { permissions }) => ({
    ...state,
    allPermissions: permissions,
    pending: false
  })),

  on(permissionActions.UpdateCurrentPermission, (state, { permission }) => ({
    ...state,
      currentPermission: { ...state.currentPermission, ...permission }
  })),

  on(permissionActions.CommitCurrentPermission, state => ({
    ...state,
    pending: true
  })),

  on(permissionActions.CommitCurrentPermissionCompleted, state => ({
    ...state,
    pending: false
  })),

  on(permissionActions.RemovePermissions, state => ({
    ...state,
    pending: true
  })),

  on(permissionActions.RemovePermissionsCompleted, state => ({
    ...state,
    pending: false
  })),

  on(permissionActions.UpdateSearch, (state, { search }) => ({
    ...state,
    search: {
      ...state.search,
      search_term: search.search_term,
      permissionTypeId: search.permissionTypeId,
      entityId: search.entityId
    }
  }))
);

export function reducer(state: PermissionState | undefined, action: Action) {
  return Reducer(state, action);
}
