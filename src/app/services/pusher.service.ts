import { ToastrService } from 'ngx-toastr';
import { Injectable } from '@angular/core';
import Pusher, { Channel } from 'pusher-js';
import { environment } from 'src/environments/environment';

const PUSHER_UNAVAILABLE_STATE = 'unavailable';

@Injectable({ providedIn: 'root' })
export class PusherService {
  private pusher: Pusher;

  constructor(private readonly toaster: ToastrService) {
    this.pusher = new Pusher(environment.pusher_key, {
      cluster: environment.pusher_cluster,
      forceTLS: true,
    });
    this.pusher.connection.bind(PUSHER_UNAVAILABLE_STATE, () => {
      this.showUnavailableError();
    });
  }

  public subscribeChannel(channelName: string, events: string[], callBack: Function, onSubscribedCallback: () => void = null): Channel {
    if (this.pusher.connection.state === PUSHER_UNAVAILABLE_STATE) {
      this.showUnavailableError();
      return null;
    }

    const channel = this.pusher.subscribe(channelName);
    events.forEach(event => {
      channel.bind(event, data => {
        callBack(data, event);
      });
    });
    channel.bind('pusher:subscription_succeeded', () => {
      if (onSubscribedCallback) {
        onSubscribedCallback();
      }
    });
    channel.bind('pusher:subscription_error', error => {
      this.toaster.error(`Hangfire subscription failed. Please contact IT support. Error information: ${error.status}, ${error.type}, ${error.error}.`);
    });
    return channel;
  }

  public unsubscribeChannel(channel: Channel) {
    this.pusher.unsubscribe(channel.name);
  }

  private showUnavailableError(): void {
    this.toaster.error('Hangfire connection is unavailable. Please contact IT support.');
  }
}
