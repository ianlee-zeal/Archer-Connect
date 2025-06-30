import { combineReducers } from '@ngrx/store';

import { userAccessPoliciesInitialState } from './state';
import { Reducer as accessPoliciesReducer } from '../access-policies/state/reducer';
import { Reducer as userReducer } from '../users/state/reducer';

export const Reducer = combineReducers({
  accessPolicies: accessPoliciesReducer,
  users: userReducer,
}, userAccessPoliciesInitialState);
