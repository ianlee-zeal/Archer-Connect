/* eslint-disable no-console */
import { MetaReducer, ActionReducer, ActionReducerMap } from '@ngrx/store';
import { storageSync } from '@larscom/ngrx-store-storagesync';

import { AppState } from '.';
import { rootReducer } from './root.reducer';
import * as authActions from '../modules/auth/state/auth.actions';
import { AuthModuleFeatures } from '../modules/auth/state';

export const reducers: ActionReducerMap<AppState> = {
  // router: routerReducer,
  // feature1: fromFeature1.reducer,
  // // feature2 does not get synced to storage at all
  // feature2: fromFeature2.reducer
  root_feature: rootReducer,
};

// clears entire state tree on logout
export function logoutReducer(reducer) {
  return (state, action) => {
    if (action.type === authActions.AuthLogout.type) {
      // eslint-disable-next-line no-param-reassign
      state = undefined;
    }
    return reducer(state, action);
  };
}

// ngrx synced to session storage:  https://github.com/larscom/ngrx-store-storagesync
export function storageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return storageSync<AppState>({
    features: [
      // save only router state to sessionStorage
      // { stateKey: 'router', storageForFeature: window.sessionStorage },

      // exclude key 'success' inside 'auth' and all keys 'loading' inside 'feature1'
      // { stateKey: 'feature1', excludeKeys: ['auth.success', 'loading'] }
      { stateKey: 'root_feature', excludeKeys: ['gridLocalData', 'statusesByEntityType'] },
      { stateKey: AuthModuleFeatures.authFeature },
    ],

    // defaults to localStorage
    storage: window.localStorage,
  })(reducer);
}

export function logger(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state: any, action: any): any => {
    const result = reducer(state, action);
    console.groupCollapsed(action.type);
    console.log('prev state', state);
    console.log('action', action);
    console.log('next state', result);
    console.groupEnd();
    return result;
  };
}

export const metaReducers: Array<MetaReducer<any, any>> = [
  logoutReducer,
  storageSyncReducer,
  // Uncomment the next row if you want to enable ngrx store logging
  //logger,
];
