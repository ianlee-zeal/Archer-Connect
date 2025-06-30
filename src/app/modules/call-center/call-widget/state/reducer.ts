import { createReducer, Action, on } from '@ngrx/store';

import * as actions from './actions'
import { CallInfo } from '@app/models/call-info';
import {
  CommunicationDirection,
  CommunicationPartyType,
  CommunicationResult,
  CommunicationSubject,
} from '@app/models/communication-center';

export interface CallWidgetState {
  callInfo: CallInfo;
  callInProgress: boolean,
  saveCallInProgress: boolean,
  communicationDirections: CommunicationDirection[],
  communicationParties: CommunicationPartyType[],
  communicationResults: CommunicationResult[],
  communicationSubjects: CommunicationSubject[],
  error: string;
}

export const callWidgetState: CallWidgetState = {
  callInfo: null,
  callInProgress: null,
  saveCallInProgress: null,
  communicationDirections: [],
  communicationParties: [],
  communicationResults: [],
  communicationSubjects: [],
  error: null,
}

const Reducer = createReducer(
  callWidgetState,
  on(actions.StartCall, (state, { callInfo: callInfo }) => ({ ...state, callInfo, callInProgress: true, error: null })),
  on(actions.FinishCall, state => ({ ...state, callInProgress: false, saveCallInProgress: true })),
  on(actions.FinishCallCompleted, state => ({ ...state, callInfo: null, callInProgress: null, error: null, saveCallInProgress: false })),

  on(actions.UpdateCallInfo, (state, { callInfo: callInfo }) => ({ ...state, callInfo })),
  on(actions.CancelCall, state => ({ ...state, callInfo: null, callInProgress: null, error: null })),

  on(actions.GetCommunicationDirectionListRequest, state => ({ ...state, error: null })),
  on(actions.GetCommunicationDirectionListSuccess, (state, { communicationDirections }) => ({ ...state, communicationDirections })),

  on(actions.GetCommunicationPartyTypeListSuccess, (state, { communicationParties }) => ({ ...state, communicationParties, error: null })),
  on(actions.GetCommunicationResultListSuccess, (state, { communicationResults }) => ({ ...state, communicationResults, error: null })),
  on(actions.GetCommunicationSubjectListSuccess, (state, { communicationSubjects }) => ({ ...state, communicationSubjects, error: null })),

  on(actions.ClearDropdownLists, state => ({
    ...state,
    communicationDirections: [],
    communicationMethods: [],
    communicationParties: [],
    communicationResults: [],
    communicationSubjects: [],
  })),

  on(actions.Error, (state, { error }) => ({ ...state, error, saveCallInProgress: false })),
)

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: CallWidgetState | undefined, action: Action) {
  return Reducer(state, action);
}
