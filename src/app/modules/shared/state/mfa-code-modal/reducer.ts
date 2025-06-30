import { createReducer, on, Action } from '@ngrx/store';
import * as actions from './actions';

export interface SharedMfaCodeModalState {
  code: string,
  phoneNumber: number | null,
}

const initialState: SharedMfaCodeModalState = { code: null, phoneNumber: null };

// main reducer function
const sharedMfaCodeModalReducer = createReducer(
  initialState,

  on(actions.SendMfaCodeRequest, state => ({ ...state, code: null })),
  on(actions.SendMfaCodeRequestForNewAuthyUser, state => ({ ...state, phoneNumber: null, code: null })),
  on(actions.SendMfaCodeRequestForNewAuthyUserSuccess, (state, { result }) => ({ ...state, code: null, phoneNumber: result })),
  on(actions.SaveUserEnteredMfaCode, (state, { code }) => ({ ...state, code })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedMfaCodeReducer(state: SharedMfaCodeModalState | undefined, action: Action) {
  return sharedMfaCodeModalReducer(state, action);
}
