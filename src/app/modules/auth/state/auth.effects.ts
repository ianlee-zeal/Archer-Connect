import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap, switchMap, withLatestFrom, map, mergeMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';

import { DefaultGlobalSearchTypeHelper } from '@app/helpers/default-global-search-type.helper';
import { Org, PermissionV2, UserInfo } from '@app/models';

import * as services from '@app/services';
import { ROUTE_SIGN_IN, ROUTE_HOME } from '@app/app-routing.module';
import { LogService } from '@app/services/log-service';
import { TimeZone } from '../../../models/time-zone';
import { IAuthState } from './auth.reducer';
import * as selectors from './index';
import * as authActions from './auth.actions';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { AnalyticsService } from '@app/services/analytics.service';

@Injectable()
export class UserEffects {
  constructor(
    private readonly store$: Store<IAuthState>,
    private readonly actions$: Actions,
    private readonly router: Router,
    private readonly oidcSecurityService: OidcSecurityService,
    private readonly usersService: services.UsersService,
    private readonly permissionsService: services.PermissionsV2Service,
    private readonly permissionService: services.PermissionService,
    private readonly sessionService: services.SessionService,
    private readonly currentOrganizationService: services.CurrentOrganizationService,
    private readonly loggerService: LogService,
    private readonly analyticsService: AnalyticsService,
  ) { }

  authLogout$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.AuthLogout),
    tap(() => {
      this.loggerService.log('AuthLogout');

      // remove url from the storage, so that user will be
      // redirected to the main page after authentication - AC-2759
      sessionStorage.removeItem('afterLoginUrl');
      this.sessionService.endCurrentSession();
      this.currentOrganizationService.clearCurrentOrganizationId();
    }),
  ), { dispatch: false });

  getUserInfo$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.GetUserInfo),
    withLatestFrom(this.store$.select(selectors.authSelectors.getUser)),
    switchMap(([, user]) => this.usersService.getUserAuth(user.id).pipe(
      mergeMap(response => {
        this.loggerService.log(`GetUserInfo - user in state: ${JSON.stringify(user)}`);
        this.loggerService.log(`GetUserInfo - user from response: ${JSON.stringify(response)}`);

        // save user for sentry errors in way that survives refreshes
        localStorage.setItem('user', JSON.stringify(response));

        const userInfo = <UserInfo>{
          ...user,
          roles: response.roles,
          defaultOrganization: response.defaultOrganization,
          defaultGlobalSearchType: response.defaultGlobalSearchType.id,
          timezone: TimeZone.toModel(response.timeZone),
          displayName: response.displayName,
          isImpersonating: response.isImpersonating,
        };

        userInfo.selectedOrganization = this.selectCurrentOrg(userInfo);

        this.loggerService.log(`GetUserInfo - GetUserInfoCompleted - Current Org Id: ${this.currentOrganizationService.getCurrentOrganizationId()}`);

        return [authActions.GetUserInfoCompleted({ user: userInfo }), authActions.GetUserDetailsCompleted({ user: response })];
      }),
    )),
  ));

  getUserInfoCompleted$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.GetUserInfoCompleted),
    switchMap(action => {
      this.loggerService.log('GetUserInfoCompleted');
      return [authActions.GetUserPermissions({ user: action.user })];
    }),
  ));

  authLoginComplete$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.AuthLoginComplete),
    tap(action => {
      this.analyticsService.setUserId(action.user.id);
      this.analyticsService.sendAnalyticsEvent('login_success', { method: 'custom' });
    }),
    map(() => {
      this.loggerService.log('AuthLoginComplete');
      return authActions.GetUserInfo();
    }),
  ));

  restorePermissions$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.RestorePermissions),
    withLatestFrom(this.store$.select(selectors.authSelectors.permissions)),
    tap(([, permissions]) => {
      this.loggerService.log('RestorePermissions', permissions);
      this.permissionService.set(permissions);
    }),
  ), { dispatch: false });

  getUserPermissions$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.GetUserPermissions),
    switchMap(user => this.permissionsService.getCurrent().pipe(
      mergeMap(response => {
        this.loggerService.log('GetUserPermissions - permissionService.getCurrent', user);

        if (user) {
          this.loggerService.log('setPermissions - set: user.permissions', response);
          this.permissionService.set(response);
        } else {
          this.loggerService.log('setPermissions - clear');
          this.permissionService.clear();
        }
        return [authActions.GetUserPermissionsComplete({ permissions: response ? response.map(p => PermissionV2.toModel(p)) : [] })];
      }),
    )),
  ));

  getUserPermissionsComplete$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.GetUserPermissionsComplete),
    withLatestFrom(this.store$.select(selectors.authSelectors.getUser)),
    tap(([, user]) => {
      this.loggerService.log('GetUserPermissionsComplete');

      let afterLoginUrl = sessionStorage.getItem('afterLoginUrl');

      if (!afterLoginUrl) {
        afterLoginUrl = DefaultGlobalSearchTypeHelper.defaultGlobalSearchToRoute(user.defaultGlobalSearchType);
        if (this.permissionService.has(PermissionService.create(PermissionTypeEnum.FirmLandingPage, PermissionActionTypeEnum.Read))
          && !user.defaultOrganization?.isMaster) {
          afterLoginUrl = ROUTE_HOME;
        }
      }

      this.router.navigate([afterLoginUrl]);
    }),
  ), { dispatch: false });

  loginRedirect$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.LoginRedirect),
    tap(() => {
      const currentUrl = window.location.pathname + window.location.search;

      this.loggerService.log(`LoginRedirect - currentUrl: ${currentUrl}`);

      if (this.isAfterLoginUrlValid(currentUrl)) {
        // store current url so that user can be redirected to it after authentication - AC-2759
        sessionStorage.setItem('afterLoginUrl', currentUrl);
      }

      this.oidcSecurityService.authorize();
    }),
  ), { dispatch: false });

  selectOrganization$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.SelectOrganization),
    mergeMap(({ id }) => this.permissionsService.getCurrent().pipe(
      switchMap(response => {
        this.loggerService.log(`SelectOrganization - setCurrentOrganizationId ${id}`);
        this.currentOrganizationService.setCurrentOrganizationId(id);
        return [
          authActions.GetUserPermissionsComplete({ permissions: response ? response.map(p => PermissionV2.toModel(p)) : [] }),
          authActions.SelectOrganizationComplete(),
        ];
      }),
    )),
  ));

  selectOrganizationComplete$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.SelectOrganizationComplete),
    tap(() => {
      this.loggerService.log('SelectOrganizationComplete');
      this.router.navigate(['claimants'])
        .then(() => window.location.reload());
    }),
  ), { dispatch: false });

  // eslint-disable-next-line class-methods-use-this
  private isAfterLoginUrlValid(afterLoginUrl: string) {
    return afterLoginUrl
      && afterLoginUrl !== '/'
      && afterLoginUrl !== '/signout'
      && afterLoginUrl !== '/silent-renew.html'
      && afterLoginUrl !== `/${ROUTE_SIGN_IN}`;
  }

  private selectCurrentOrg(user: UserInfo): Org {
    let selectedOrganization: Org = user.defaultOrganization ?? user.selectedOrganization ?? user.organizations[0];
    const orgIdFromLocalStorage = this.currentOrganizationService.getCurrentOrganizationId();

    if (orgIdFromLocalStorage && user.organizations.some(o => o.id === orgIdFromLocalStorage)) {
      selectedOrganization = user.organizations.find(o => o.id === orgIdFromLocalStorage);
    }

    this.currentOrganizationService.setCurrentOrganizationId(selectedOrganization.id);

    return selectedOrganization;
  }
}
