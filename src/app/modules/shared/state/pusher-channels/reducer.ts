import { createReducer, on, Action } from '@ngrx/store';
import * as actions from './actions';
import { Channel } from 'pusher-js';

export interface SharedPusherChannelState {
  channels: Channel[],
}

const initialState: SharedPusherChannelState = {
  channels: [],
};

function addChannel(statechannels: Channel[], channel: Channel): Channel[] {
  return [...statechannels, channel];
}

function removeChannel(statechannels: Channel[], channel: Channel): Channel[] {
  return statechannels.filter(c => c !== channel);
}

// main reducer function
const sharedPusherChannelsReducer = createReducer(
  initialState,

  on(actions.AddPusherChannel, (state, { channel }) => ({ ...state, channels: addChannel(state.channels, channel) })),
  on(actions.RemovePusherChannel, (state, { channel }) => ({ ...state, channels: removeChannel(state.channels, channel) })),
);


// we have to wrap our reducer like this or it won't compile in prod
export function SharedPusherChannelsReducer(state: SharedPusherChannelState | undefined, action: Action) {
  return sharedPusherChannelsReducer(state, action);
}
