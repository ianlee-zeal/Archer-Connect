import { createReducer, on, Action } from '@ngrx/store';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import * as actions from './actions';

export interface OrgImpersonateState {
    orgsOptions: SelectOption[] | null;
    orgsOptionsLoading: boolean;
    rolesOptions: SelectOption[] | null;
    rolesOptionsLoading: boolean;
}

const initialState: OrgImpersonateState = {
    orgsOptions: [],
    orgsOptionsLoading: false,
    rolesOptions: [],
    rolesOptionsLoading: false,
  };

export const orgImpersonateReducer = createReducer(
    initialState,
    //org options
    on(actions.GetOrgsOptionsRequest, state => ({
        ...state, orgsOptionsLoading: true,
    })),
    on(actions.GetOrgsOptionsError, state => ({
        ...state, orgsOptionsLoading: false,
    })),
    on(actions.GetOrgsOptionsSuccess, (state, { orgsOptions }) => {
        return {
            ...state,
            orgsOptions: [...orgsOptions],
            orgsOptionsLoading: false,
        };
    }),
    on(actions.ClearOrgsOptions, state => ({
        ...state, orgsOptions: [], rolesOptions: [],
    })),
    //roles options
    on(actions.GetRolesOptionsRequest, state => ({
        ...state, rolesOptionsLoading: true,
    })),
    on(actions.GetRolesOptionsError, state => ({
        ...state, rolesOptionsLoading: false,
    })),
    on(actions.GetRolesOptionsSuccess, (state, { rolesOptions }) => {
        return {
            ...state,
            rolesOptions: [...rolesOptions],
            rolesOptionsLoading: false,
        };
    }),
);

export function OrgImpersonateState(
    state: OrgImpersonateState | undefined,
    action: Action
  ) {
    return orgImpersonateReducer(state, action);
  }
