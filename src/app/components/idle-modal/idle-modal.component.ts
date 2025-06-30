import { Component, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';

import { Subject } from 'rxjs';
import * as fromAuth from '../../modules/auth/state';
import { AuthLogout } from '../../modules/auth/state/auth.actions';
import { takeUntil } from 'rxjs/operators';
import { SessionService } from '@app/services';

@Component({
  selector: 'app-idle-modal',
  templateUrl: './idle-modal.component.html',
  styleUrls: ['./idle-modal.component.scss'],
})
export class IdleModalComponent implements OnInit, OnDestroy {
  private ngDestroyed$ = new Subject<void>();
  public idleTimerSecondsLeft: number;
  public isRenewing: boolean;
  public isLoggingOut: boolean;

  constructor(
    public modal: BsModalRef,
    private store: Store<fromAuth.AppState>,
    private idle: Idle,
    private sessionService: SessionService,
  ) { }


  ngOnInit() {
    //Clear all events that can interrupt idle timeout. This is because we want User manually click buttons in Modal dialog to interrupt timeout.
    this.idle.clearInterrupts();

    //Modal dialog will be showed for 5 minutes. Every second onTimeoutWarning will emit a new value.
    this.idle.onTimeoutWarning.pipe(
      takeUntil(this.ngDestroyed$)
    ).subscribe(secondsLeft => {
      if (secondsLeft <= 1) {
        this.isLoggingOut = true;
      }
      this.idleTimerSecondsLeft = secondsLeft - 1;
    });
  }

  logout() {
    this.modal.hide();
    this.store.dispatch(AuthLogout());
  }

  continueSession() {
    if (!this.isRenewing) {
      this.isRenewing = true;
    }

    const sessionExpirationDate = this.sessionService.getSessionExpirationDate();
    const _30minAsMs = 1800000;
    const elapsedSinceSessionExpired = new Date().getTime() - sessionExpirationDate;

    if (elapsedSinceSessionExpired > _30minAsMs) {
      this.store.dispatch(AuthLogout());
    } else {
      this.sessionService.startNewSession();
      this.modal.hide();
    }
  }

  ngOnDestroy(): void {
    this.idle.stop();
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.watch();
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
