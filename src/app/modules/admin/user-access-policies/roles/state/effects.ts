import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  mergeMap,
  switchMap,
  catchError,
  tap,
  withLatestFrom,
  map,
} from 'rxjs/operators';

import { OrgRoleService, ToastService } from '@app/services';
import { OrgRole } from '@app/models/org-role';
import { actions } from '.';
import { OrganizationRoleState } from './reducers';
import * as selectors from './selectors';
import { RoleLevelEnum } from '@app/models/enums/role-level.enum';

@Injectable()
export class RolesEffects {
  constructor(
    private orgRoleService: OrgRoleService,
    private store$: Store<OrganizationRoleState>,
    private actions$: Actions,
    private toaster: ToastService,
    private router: Router,
  ) { }


  getAGRolesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrganizationRolesRequest),
    mergeMap(action => this.orgRoleService.index({ gridOptions: action.agGridParams.request })
      .pipe(
        switchMap(response => {
          const orgRoles = response.items.map(x => OrgRole.toModel(x));

          return [actions.GetOrganizationRolesSuccess({
            orgRoles,
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })];
        }),
        catchError(error => of(actions.GetOrganizationRolesError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  getAGRolesListError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrganizationRolesError),
    tap(action => {
      console.error(action.errorMessage); // eslint-disable-line no-console
    }),
  ), { dispatch: false });


  deleteOrgRoleList$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeleteOrganizationRolesRequest),
    mergeMap(action => this.orgRoleService.deleteAll(action.ids).pipe(
      switchMap(() => {
        action.callback();
        return [actions.DeleteOrganizationRolesSuccess({ orgId: action.orgId })];
      }),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));


  deleteOrgRoleListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteOrganizationRolesSuccess),
    tap(({ orgId }) => {
      this.router.navigate([`/admin/user/orgs/${orgId}/roles`]);
      this.toaster.showSuccess('Selected Organization Role was deleted');
    }),
  ), { dispatch: false });


  getOrgRoleDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrganizationRoleDetailsRequest),
    mergeMap(action => this.orgRoleService.get(action.id).pipe(
      switchMap(response => {
        const orgRole = OrgRole.toModel(response);
        return [actions.GetOrganizationRoleDetailsSuccess({ orgRole })];
      }),
      catchError(error => of(actions.GetOrganizationRoleDetailsError({ errorMessage: error }))),
    )),
  ));


  saveOrg$ = createEffect(() => this.actions$.pipe(ofType(actions.SaveOrgRoleRequest),
    withLatestFrom(this.store$.select(selectors.orgRole)),
    mergeMap(([action, orgRole]) => {
      const orgRoleDto = OrgRole.toDto(orgRole);
      return this.orgRoleService.put(orgRoleDto).pipe(
        switchMap(data => {
          action.callback();

          return [actions.SaveOrgRoleSuccess({ orgRole: data })];
        }),
        catchError(errorMessage => of(actions.Error({ errorMessage }))),
      );
    })));


  saveOrgRoleSuccess$ = createEffect(() => this.actions$.pipe(ofType(actions.SaveOrgRoleSuccess),
    tap(() => {
      this.toaster.showSuccess('Organization role was updated');
    })), { dispatch: false });


  createOrgRole$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateOrganizationRoleRequest),
    mergeMap(action => this.orgRoleService.post(<OrgRole>{ name: action.name, organizationId: action.level === RoleLevelEnum.Global ? null : action.orgId, accessPolicyId: action.accessPolicyId }).pipe(
      switchMap(response => [
        actions.CreateOrganizationRoleSuccess({ id: response.id, orgId: action.orgId, modal: action.modal }),
      ]),
      catchError(error => of(actions.CreateOrganizationRoleError({ error }))),
    )),
  ));

  createPersonSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateOrganizationRoleSuccess),
    tap(({ id, orgId, modal }) => {
      modal.hide();
      this.router.navigate([`/admin/user/orgs/${orgId}/roles/${id}`]);
      this.toaster.showSuccess('New Organization Role was created');
    }),
  ), { dispatch: false });


  goToOrgRolesPage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToOrgRolesPage),
    tap(() => this.router.navigate(['/admin/org/roles'])),
  ), { dispatch: false });


  goToOrgRoleDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToOrgRole),
    tap(({ id, navSettings }) => this.router.navigate(
      [`${this.router.url}/${id}/tabs`],
      { state: { navSettings } },
    )),
  ), { dispatch: false });


  error$ = createEffect(() => this.actions$.pipe(
    ofType(
      actions.Error,
    ),
    map(({ errorMessage }) => [this.toaster.showError(errorMessage)]),
  ), { dispatch: false });
}
