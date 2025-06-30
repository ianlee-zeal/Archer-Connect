import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { OidcSecurityService, AuthStateResult, ValidationResult, UserDataResult, AuthenticatedResult } from 'angular-auth-oidc-client';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import decodeJwt from 'jwt-decode';

import * as rootActions from '@app/state/root.actions';
import * as authActions from '@app/modules/auth/state/auth.actions';
import * as fromAuth from '@app/modules/auth/state';
import * as fromRoot from './state';
import { OrgsService, ModalService, SessionService, KeyboardEventService } from './services';
import { IdleModalComponent } from './components/idle-modal/idle-modal.component';
import { Org, User, UserInfo } from './models';
import { LogService } from './services/log-service';
import { LOCAL_STORAGE_KEY_USER } from './services/current-organization.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('error_modal') error_modal: ModalDirective;

  private readonly user$ = this.authStore.select(fromAuth.authSelectors.getUser);

  private readonly ngUnsubscribe$ = new Subject<void>();
  public onAuthorizationResult$: Subject<AuthStateResult> = new Subject<AuthStateResult>();
  isAuthenticated$: Observable<AuthenticatedResult>;

  public error_title;

  public error_description;

  public error_content;

  constructor(
    private readonly rootStore: Store<fromRoot.AppState>,
    private readonly oidcSecurityService: OidcSecurityService,
    private readonly authStore: Store<fromAuth.AppState>,
    private readonly orgsService: OrgsService,
    private readonly idle: Idle,
    private readonly modalService: ModalService,
    private readonly sessionService: SessionService,
    private readonly loggerService: LogService,
    private router: Router,
    private keyboardEvent: KeyboardEventService,
  ) {
    if (window.location.href.includes('justLoggedIn=true')) {
      localStorage.removeItem(this.sessionService.sessionExpirationStorageKey);
      localStorage.removeItem(this.sessionService.isAppLoadedDirectlyStorageKey);

      this.authStore.dispatch(authActions.ResetState());
    }

    this.onAuthorizationResult$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((result: AuthStateResult) => {
        if (!result.isAuthenticated) {
          this.loggerService.log('result.authorizationState is: unauthorized. Redirect to login');
          this.rootStore.dispatch(authActions.LoginRedirect());
        }

        if (result.isAuthenticated) {
          if (result.isRenewProcess) {
            this.authStore.dispatch(authActions.RestorePermissions());
            return;
          }

          if (this.sessionService.isSessionPresent()
            && this.sessionService.isSessionExpired()
            && this.sessionService.isAppLoadedDirectly()) {
            this.loggerService.log('endCurrentSession');
            this.sessionService.endCurrentSession();
            return;
          }

          this.loggerService.log('startNewSession');
          this.sessionService.startNewSession();

          this.oidcSecurityService.userData$
            .pipe(
              filter((userData: UserDataResult) => !!userData),
              takeUntil(this.ngUnsubscribe$),
            )
            .subscribe((userData: UserDataResult) => {
              this.loggerService.log('getUserData: ', userData);

              this.orgsService.getListByCurrentUser()
                .pipe(
                  takeUntil(this.ngUnsubscribe$),
                )
                .subscribe((organizations: Org[]) => {
                  this.loggerService.log(`getListByCurrentUser - organizations: ${JSON.stringify(organizations)}`);

                  this.oidcSecurityService.getAccessToken().pipe(
                    takeUntil(this.ngUnsubscribe$),
                  ).subscribe((token:string) => {
                    const decodedToken = decodeJwt(token);
                    this.loggerService.log('getListByCurrentUser - token: ', token);

                    const user = <UserInfo>{
                      id: +((decodedToken as any).id),
                      username: userData.userData.name,
                      userGuid: userData.userData.sub,
                      organizations,
                    };

                    this.rootStore.dispatch(authActions.AuthLoginComplete({ user }));
                    this.rootStore.dispatch(rootActions.InitializeBanner());

                    if (user.organizations?.length > 0) {
                      this.rootStore.dispatch(rootActions.LoadData());
                    } else {
                      this.router.navigate(['no-access']);
                    }
                  });
                });
            });
        }
      });

    if (!window.location.hash) {
      this.sessionService.setIsAppLoadedDirectly();
    }
  }

  public ngOnInit(): void {
    this.setIdle();
    this.isAuthenticated$ = this.oidcSecurityService.isAuthenticated$;

    this.oidcSecurityService
      .checkAuth()
      .subscribe(({ isAuthenticated }: { isAuthenticated: boolean }) => {
        const validationResult = isAuthenticated ? ValidationResult.Ok : ValidationResult.LoginRequired;

        this.loggerService.log(`this.oidcSecurityService.moduleSetup - !window.location.hash - isAuthorized: ${isAuthenticated}. window.location.pathname: ${window.location.pathname}`);

        this.updateAuthorizationResultState(
          isAuthenticated,
          validationResult,
          (isAuthenticated && window.location.pathname !== '/signin' && window.location.pathname !== '/'),
        );
      });
  }

  private setIdle(): void {
    // sets an idle timeout
    const minutes25 = 25 * 60;
    this.idle.setIdle(minutes25);

    // sets a timeout period. After 5 minutes of inactivity, the user will be considered timed out.
    const fiveMinutes = 5 * 60;
    this.idle.setTimeout(fiveMinutes);

    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    // Reset idle timeout timer when idle ends.
    this.idle.onIdleEnd.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.resetIdle();
    });

    // If timeout happened and the User still do nothing - logs this User out
    this.idle.onTimeout.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.rootStore.dispatch(authActions.AuthLogout());
    });

    // If idle timeout happened we are showing warning modal dialog with information about logging out because of inactivity
    this.idle.onIdleStart.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.modalService.show(IdleModalComponent);
    });

    this.resetIdle();
  }

  resetIdle(): void {
    this.idle.watch();
  }

  /**
   * Method will be executed only for other opened browser windows/tabs.
   *
   * @param {StorageEvent} event
   * @memberof AppComponent
   */
  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent): void {
    if (event.key === LOCAL_STORAGE_KEY_USER) {
      const oldValue = JSON.parse(event.oldValue) as User;
      const newValue = JSON.parse(event.newValue) as User;

      if (oldValue?.id !== newValue?.id) {
        this.authStore.dispatch(authActions.AuthLogout());
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  public keyUpPressed(event: KeyboardEvent): void {
    this.keyboardEvent.setEvent(event);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private updateAuthorizationResultState(
    isAuthenticated: boolean,
    validationResult: ValidationResult,
    isRenew: boolean,
  ): void {
    const newResult = {
      isAuthenticated,
      validationResult,
      isRenewProcess: isRenew,
    } as AuthStateResult;
    this.onAuthorizationResult$.next(
      newResult,
    );
  }
}
