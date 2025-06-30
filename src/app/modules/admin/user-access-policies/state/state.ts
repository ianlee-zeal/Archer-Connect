import { AccessPoliciesState, accessPoliciesInitialState } from '../access-policies/state/state';
import { UsersState, usersInitialState } from '../users/state/state';

export interface AppState {
  user_access_policies: UserAccessPoliciesState,
};

export interface UserAccessPoliciesState {
  accessPolicies: AccessPoliciesState,
  users: UsersState,
}

export const userAccessPoliciesInitialState: UserAccessPoliciesState = {
  accessPolicies: accessPoliciesInitialState,
  users: usersInitialState,
};
