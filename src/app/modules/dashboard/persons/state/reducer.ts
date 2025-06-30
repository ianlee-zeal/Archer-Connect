import { createReducer, on, Action, combineReducers } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Person } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/reducer';
import * as actions from './actions';

export interface PersonState {
  common: PersonCommonState,
  advancedSearch: fromAdvancedSearch.AdvancedSearchState,
}

interface PersonCommonState {
  error: string,
  pending: boolean,
  agGridParams: IServerSideGetRowsParamsExtended,
  persons: Person[],
  prevPersonId: number;
  personPreviousUrl: string;
  actionBar: ActionHandlersMap;
}

const personCommonInitialState: PersonCommonState = {
  error: null,
  pending: false,
  agGridParams: null,
  persons: null,
  prevPersonId: null,
  personPreviousUrl: null,
  actionBar: null,
};

export const initialState: PersonState = {
  common: personCommonInitialState,
  advancedSearch: fromAdvancedSearch.initialState,
};

const personsCommonReducer = createReducer(
  personCommonInitialState,
  on(actions.Error, (state, { error }) => ({ ...state, error })),

  on(actions.GetPersonsList, state => ({ ...state, pending: true, error: null, persons: null })),
  on(actions.GetPersonsListComplete, (state, { persons, agGridParams }) => ({ ...state, pending: false, persons, agGridParams })),
  on(actions.GetPersonsListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(actions.CreatePerson, (state, { person, modal }) => ({ ...state, error: null, person, modal })),
  on(actions.CreatePersonComplete, (state, modal) => ({ ...state, person: null, error: null, modal })),
  on(actions.ResetCreatePersonState, state => ({ ...state, error: null })),
  on(actions.UpdatePreviousPersonId, (state, { prevPersonId }) => ({ ...state, prevPersonId })),
  on(actions.UpdatePreviousPersonUrl, (state, { personPreviousUrl }) => ({ ...state, personPreviousUrl })),
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar: { ...actionBar } })),
);

function PersonsCommonReducer(state: PersonCommonState | undefined, action: Action) {
  return personsCommonReducer(state, action);
}

const personsReducer = combineReducers({
  common: PersonsCommonReducer,
  advancedSearch: fromAdvancedSearch.AdvancedSearchReducerFor(actions.FEATURE_NAME),
}, initialState);

// we have to wrap our reducer like this or it won't compile in prod
export function PersonReducer(state: PersonState | undefined, action: Action) {
  return personsReducer(state, action);
}
