import { Dictionary } from '@app/models/utils';
import { createReducer, on, Action } from '@ngrx/store';
import { IDictionary } from '../../../models/utils/dictionary';
/* eslint-disable @typescript-eslint/no-use-before-define */

import * as authActions from '../../auth/state/auth.actions';
import * as sharedActions from './common.actions';
import { MimeType } from '../../../models/mime-type';
import { Pager } from '../grid-pager/pager';
import { NavigationSettings } from '../action-bar/navigation-settings';
import { RelatedPage } from '../grid-pager';

export interface SharedState {
  formsIndex: any,
  currentTask: any,
  error: any,
  pending: boolean,
  selectedOrganization: number,
  mimeTypes: MimeType[],
  allowedFileExtensions: string[],
  pagers: IDictionary<RelatedPage, Pager>,
  pager: Pager,
}

const initialState: SharedState = {
  formsIndex: null,
  currentTask: null,
  error: null,
  pending: false,
  selectedOrganization: null,
  mimeTypes: null,
  allowedFileExtensions: null,
  pagers: null,
  pager: null,
};

// main reducer function
export const sharedReducer = createReducer(
  initialState,

  on(sharedActions.GetFormsComplete, (state, { formsIndex }) => ({ ...state, formsIndex, pending: false })),

  on(sharedActions.Error, (state, { error }) => ({ ...state, error })),

  on(authActions.SelectOrganization, (state, { id }) => ({ ...state, formsIndex: null, selectedOrganization: id, pending: true })),

  on(sharedActions.GetMimeTypes, state => ({ ...state, mimeTypes: null })),
  on(sharedActions.GetMimeTypesComplete, (state, { mimeTypes, allowedFileExtensions }) => ({ ...state, mimeTypes, allowedFileExtensions })),

  on(sharedActions.CreatePager, (state, action) => createPagerReducer(state, action)),
  on(sharedActions.UpdatePager, (state, action) => updatePagerReducer(state, action)),
  on(sharedActions.ActivatePager, (state, action) => activatePagerReducer(state, action)),
  on(sharedActions.ResetActivePager, state => resetPagerReducer(state)),
  on(sharedActions.SetAllowedFileExtensions, (state, { allowedFileExtensions }) => ({...state,allowedFileExtensions,}))
);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedReducer(state: SharedState | undefined, action: Action) {
  return sharedReducer(state, action);
}

/**
 * Creates new pager state (updates if already exist)
 *
 * @param {SharedState} state - current state
 * @param {{
 *   relatedPage: RelatedPage,
 *   settings: NavigationSettings,
 * }} payload
 * @returns {SharedState}
 */
function createPagerReducer(state: SharedState, payload: {
  relatedPage: RelatedPage,
  settings: NavigationSettings,
  pager?: Partial<Pager>,
}): SharedState {
  const newPagers = new Dictionary<RelatedPage, Pager>(state.pagers ? state.pagers.items() : []);
  let newPager: Pager = {
    currentPage: (payload.settings.current + 1) || 1,
    pageSize: 1,
    totalCount: payload.settings.count,
    entityLabel: '',
    relatedPage: payload.relatedPage,
    isForceDefaultBackNav: false,
  };
  if (payload.pager) {
    newPager = { ...newPager, ...payload.pager };
  }
  const existingPager = newPagers.getValue(payload.relatedPage);
  newPagers.setValue(payload.relatedPage, {
    ...(existingPager || {}),
    ...newPager,
    ...{ payload: { ...existingPager?.payload, ...payload.pager?.payload } },
  });
  return {
    ...state,
    pagers: newPagers,
    pager: newPager,
  };
}

/**
 * Updates pager state
 *
 * @param {SharedState} state - current state
 * @param {{
 *   relatedPage: RelatedPage,
 *   pager: Partial<Pager>,
 * }} payload
 * @returns {SharedState}
 */
function updatePagerReducer(state: SharedState, payload: {
  relatedPage?: RelatedPage,
  pager: Partial<Pager>,
}): SharedState {
  const newPagers = new Dictionary<RelatedPage, Pager>(state.pagers ? state.pagers.items() : []);
  const relatedPage = payload.relatedPage !== undefined ? payload.relatedPage : state.pager?.relatedPage;
  let newPager: Pager = newPagers.getValue(relatedPage);
  if (newPager && newPager.relatedPage === relatedPage) {
    newPager = { ...newPager, ...payload.pager, ...{ payload: { ...newPager.payload, ...payload.pager.payload } } };
  } else {
    newPager = <Pager>{ ...payload.pager, ...{ payload: { ...payload.pager.payload } } };
  }
  newPagers.setValue(newPager.relatedPage, newPager);
  return {
    ...state,
    pagers: newPagers,
    pager: newPager,
  };
}

/**
 * Activates pager using provided page value
 *
 * @param {SharedState} state - current state
 * @param {{
 *   relatedPage: RelatedPage,
 * }} payload
 * @returns {SharedState}
 */
function activatePagerReducer(state: SharedState, payload: {
  relatedPage: RelatedPage,
}): SharedState {
  if (!state.pagers) {
    return state;
  }
  const newPager = state.pagers.getValue(payload.relatedPage);
  if (!newPager) {
    if (state.pager.relatedPage == payload.relatedPage) {
      return state;
    }
    const newPagers = new Dictionary<RelatedPage, Pager>(state.pagers ? state.pagers.items() : []);
    return {
      ...initialState,
      pager: {
        ...initialState.pager,
        payload: state.pager.payload,
        relatedPage: payload.relatedPage,
      },
      pagers: newPagers,
    };
  }
  return {
    ...state,
    pager: { ...newPager },
  };
}

/**
 * Resets currently activated pager
 *
 * @param {SharedState} state
 * @return {*}  {SharedState}
 */
function resetPagerReducer(state: SharedState): SharedState {
  if (!state.pager) {
    return state;
  }
  const newPager = { ...state.pager };
  newPager.currentPage = 1;
  newPager.totalCount = 1;
  return {
    ...state,
    pager: { ...newPager },
  };
}
