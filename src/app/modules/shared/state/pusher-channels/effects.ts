import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { createEffect, ofType, Actions } from '@ngrx/effects';

import { SharedPusherChannelState } from './reducer';
import { PusherService } from '@app/services/pusher.service';
import * as actions from './actions';
import { tap } from 'rxjs/operators';

@Injectable()
export class PusherChannelEffects {
  constructor(
    private actions$: Actions,
    private store: Store<SharedPusherChannelState>,
    private pusher: PusherService
  ) { }


  removePusherChannel$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RemovePusherChannel),
    tap(action => this.pusher.unsubscribeChannel(action.channel))
  ));

}
