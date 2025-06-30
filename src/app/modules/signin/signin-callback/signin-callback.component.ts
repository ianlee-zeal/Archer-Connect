import { NavigationEnd, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';

import { StringHelper } from '@app/helpers/string.helper';
import { AppState } from '@app/state';
import { ROUTE_SIGN_IN } from '@app/app-routing.module';
import { authSelectors } from '@app/modules/auth/state';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { LogService } from '@app/services/log-service';
import { LoginRedirect } from '@app/modules/auth/state/auth.actions';
import { UserInfo } from '@app/models';

/**
 * Component showing empty 'skeleton' of the application during authentication into the app.
 *
 * @export
 * @class SignInCallbackComponent
 * @implements {OnDestroy}
 */
@Component({
  templateUrl: './signin-callback.component.html',
  selector: 'app-signin-redirect-callback',
  styleUrls: ['./signin-callback.component.scss'],
})
export class SignInCallbackComponent implements OnInit, OnDestroy {
  readonly currentDate = new Date();

  private readonly ngUnsubscribe$ = new Subject<void>();

  private interval: NodeJS.Timeout;
  private intervalCount = 0;
  public user: UserInfo;

  /**
   * Gets the observable of the flag indicating that authentication into application is in progress.
   *
   * @private
   * @memberof SignInCallbackComponent
   */
  private readonly isLoginPending$ = this.store.select(authSelectors.isLoginPending);

  /**
   * Gets or sets the observable of current user data
   *
   * @public
   * @memberof SignInCallbackComponent
   */
  public readonly user$ = this.store.select(authSelectors.getUser);

  /**
   * Creates an instance of SignInCallbackComponent.
   * @param {Router} router - current router
   * @param {Store<AppState>} store - current app store
   * @param {LogService} loggerService - logger service
   * @memberof SignInCallbackComponent
   */
  constructor(
    router: Router,
    private readonly store: Store<AppState>,
    private readonly loggerService: LogService,
  ) {
    router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((event: NavigationEnd) => {
        // 1. Check if user is being redirected to the 'Sign In' route after navigation is finished.
        // 2. Check if source URL is the same as the target URL.
        //    If URLs are the same - it means user got to the 'Sign In' route via direct URL
        //    using 'Back' button in browser, or inserted it from the clipboard, etc.
        // 3. Check current user data and check if login is currently in progress.
        //    If user exists and login is not in progress now, then redirect user to the parent view.
        if (event.urlAfterRedirects.indexOf(ROUTE_SIGN_IN) >= 0
          && StringHelper.equal(event.url, event.urlAfterRedirects)) {
          this.redirectIfLoginIsFinished();
        }
      });
  }
  ngOnInit(): void {
    // At some point due to slow API or some user actions during login process,
    // auth process is being broken and user is stuck on the sign in page.
    // To fix this interval with counter was created - if after few iterations
    // user data does not exist - init login process from the start by calling
    // the LoginRedirect() action.
    // https://archersystems.atlassian.net/browse/AC-16265
    this.interval = setInterval(() => this.redirectIfLoginIsFinished(), 5000);
  }

  private redirectIfLoginIsFinished(): void {
    combineLatest([this.user$, this.isLoginPending$])
      .pipe(first())
      .subscribe(([user, isLoginPending]) => {
        this.user = user;
        if (user && !isLoginPending) {
          this.goToParentView();
          return;
        }
        if (this.intervalCount >= 3) {
          this.store.dispatch(LoginRedirect());
        }
        this.intervalCount++;
      });
  }

  private goToParentView(): void {
    this.loggerService.log('SignInCallbackComponent - GotoParentView');
    this.store.dispatch(GotoParentView());
  }

  /** @inheritdoc */
  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
