import { createReducer, on, Action } from '@ngrx/store';
import { Email } from '@app/models';
import * as actions from './actions';

export interface EmailState {
  error: any,
  primaryEmail: Email,
}

const initialState: EmailState = {
  error: null,
  primaryEmail: null,
};

// main reducer function
const emailReducer = createReducer(
  initialState,
  on(actions.GetPrimaryEmailByEntity, (state: EmailState) => ({ ...state, error: null, primaryEmail: null })),
  on(actions.GetPrimaryEmailByEntityComplete, (state: EmailState, { primaryEmail }: { primaryEmail: Email }) => ({ ...state, primaryEmail })),
  on(actions.Error, (state: EmailState, { errorMessage }: { errorMessage: string }) => ({ ...state, error: errorMessage })),

);

// we have to wrap our reducer like this or it won't compile in prod
export function EmailReducer(state: EmailState | undefined, action: Action): EmailState {
  return emailReducer(state, action);
}
