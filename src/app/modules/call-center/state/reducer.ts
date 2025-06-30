import { Action, combineReducers } from '@ngrx/store';

import * as fromWidget from '../call-widget/state/reducer';
import * as fromCommunicationList from '../communication-list/state/reducer';
import * as fromCommunication from '../communication/state/reducer';

export interface CallCenterState {
  widget: fromWidget.CallWidgetState,
  communicationList: fromCommunicationList.CommunicationListState,
  communication : fromCommunication.CommunicationState
}

export const initialState: CallCenterState = {
  widget: fromWidget.callWidgetState,
  communicationList: fromCommunicationList.communicationListState,
  communication: fromCommunication.communicationState,
}

const Reducer = combineReducers({
  widget: fromWidget.reducer,
  communicationList: fromCommunicationList.reducer,
  communication: fromCommunication.reducer,
}, initialState);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: CallCenterState | undefined, action: Action) {
  return Reducer(state, action);
}