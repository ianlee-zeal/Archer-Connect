import { createReducer, on, Action } from '@ngrx/store';
import { OrganizationRoleUser } from '@app/models/organization-role-user';
import * as userRolesListActions from './actions';

export interface SharedUserRolesListState {
  error: any,
  userRolesList: OrganizationRoleUser[],
}

const initialState: SharedUserRolesListState = {
  error: null,
  userRolesList: null,
};

// main reducer function
const sharedUserRolesListReducer = createReducer(
  initialState,

  on(userRolesListActions.GetUserRolesListRequest, state => ({ ...state, error: null })),
  on(userRolesListActions.GetUserRolesListRequestComplete, (state, { userRolesList }) => ({ ...state, userRolesList })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedUserRolesListReducer(state: SharedUserRolesListState | undefined, action: Action) {
  return sharedUserRolesListReducer(state, action);
}
