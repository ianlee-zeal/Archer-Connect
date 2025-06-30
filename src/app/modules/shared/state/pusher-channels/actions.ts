import { createAction, props } from '@ngrx/store';
import { Channel } from 'pusher-js';

const featureName = '[Shared Pusher Channels]';

export const AddPusherChannel = createAction(`${featureName} Add Pusher Channel`, props<{ channel: Channel }>());
export const RemovePusherChannel = createAction(`${featureName} Remove Pusher Channel`, props<{ channel: Channel }>());
