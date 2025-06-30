import * as actions from './actions';
import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { OrganizationRolesService, OrgsService } from "@app/services";
import { OrgImpersonateService } from '@app/services/api/org/org-impersonate.service';
import { LogService } from '@app/services/log-service';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Store } from "@ngrx/store";
import { mergeMap, switchMap, catchError, of, tap, exhaustMap } from 'rxjs';
import * as authActions from '@app/modules/auth/state/auth.actions';
import * as fromAuth from '@app/modules/auth/state';
import { HttpStatusCode } from '@angular/common/http';

@Injectable()
export class OrgImpersonateEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly router: Router,
    private readonly orgsService: OrgsService,
    private readonly organizationRolesService: OrganizationRolesService,
    private readonly orgImpersonateService: OrgImpersonateService,
    private readonly loggerService: LogService,
    private readonly authStore: Store<fromAuth.AppState>,
  ) { }

  getOrgOptions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgsOptionsRequest),
    mergeMap(action =>
      this.orgsService.searchOrganizations(action.search)
        .pipe(
          switchMap(response => {
            const orgsOptions = response.items.map(item => ({ id: item.id, name: `${item.id} - ${item.name}` }));
            return [actions.GetOrgsOptionsSuccess({ orgsOptions })];
          }),
          catchError(error => of(actions.GetOrgsOptionsError({ error }))),
        )
    ),
  ));

  getRolesOptions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetRolesOptionsRequest),
    mergeMap(action =>
      this.organizationRolesService.getOrganizationRoles(action.orgId)
        .pipe(
          switchMap(response => {
            const rolesOptions = response.map(item => ({ id: item.id, name: `${item.id} - ${item.name}` }));
            return [actions.GetRolesOptionsSuccess({ rolesOptions })];
          }),
          catchError(error => of(actions.GetRolesOptionsError({ error }))),
        )
    ),
  ));

  impersonateOrganization$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ImpersonateOrgRequest),
    exhaustMap(action =>
      this.orgImpersonateService.impersonate(action.impersonateRequest).pipe(
          switchMap(response => {
            const success = !!response.organization && response.organizationRoles.length  > 0;
            if (success){
              this.loggerService.log(`Impersonate Organization - Impersonating Organization:  ${action.impersonateRequest.orgId}`);
              return [actions.ImpersonateOrgRequestComplete({success:success})];
            }
          }),
          catchError(error => of(actions.ImpersonateOrgRequestError({ error }))),
        )
    ),
  ));

  impersonateOrganizationComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ImpersonateOrgRequestComplete),
    tap(action => {
      if (action.success){
        this.loggerService.log('Impersonate Organization Complete');
        this.authStore.dispatch(authActions.AuthLogout());
      }
    }),
  ), { dispatch: false });

  depersonateOrganization$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DepersonateOrgRequest),
    exhaustMap(() =>
      this.orgImpersonateService.depersonate().pipe(
          switchMap(response => {
            const success = response?.status === HttpStatusCode.NoContent;
            if (success){
              this.loggerService.log('Impersonate Organization - Depersonate Organization');
              return [actions.DepersonateOrgRequestComplete({success:success})];
            }
          }),
          catchError(error => of(actions.ImpersonateOrgRequestError({ error }))),
        )
    ),
  ));

  depersonateOrganizationComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DepersonateOrgRequestComplete),
    tap(action => {
      if (action.success){
        this.loggerService.log('Depersonate Organization Complete');
        this.authStore.dispatch(authActions.AuthLogout());
      }
    }),
  ), { dispatch: false });
}
