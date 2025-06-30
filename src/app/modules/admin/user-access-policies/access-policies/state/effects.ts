import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, forkJoin } from 'rxjs';
import { mergeMap, catchError, switchMap, map, tap, withLatestFrom } from 'rxjs/operators';

import { EntityTypeCategoryEnum } from '@app/models/enums/entity-type-category.enum';
import { EntityType } from '@app/models/entity-type';
import { AccessPolicy } from '@app/models/access-policy';
import { GroupedPermissions } from '@app/models/grouped-permissions';
import * as services from '@app/services';
import { GroupedAccessPolicyPermissions } from '@app/models/grouped-access-policy-permissions';
import { AccessPoliciesState } from './state';
import { orgId, selectedPermissions, accessPoliciesItem } from './selectors';
import { GotoParentView } from '../../../../shared/state/common.actions';
import * as accessPolicyActions from './actions';

@Injectable()
export class AccessPoliciesEffects {
  private categoriesToDisplay = [
    EntityTypeCategoryEnum.Module,
    EntityTypeCategoryEnum.Object,
    EntityTypeCategoryEnum.Field,
    EntityTypeCategoryEnum.FeatureFlag
  ];

  constructor(
    private actions$: Actions,
    private store: Store<AccessPoliciesState>,
    private router: Router,
    private accessPolicyService: services.AccessPolicyService,
    private entityTypesService: services.EntityTypesService,
    private permissionsService: services.PermissionsV2Service,
    private toaster: services.ToastService,
  ) { }

  getAccessPolices$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.GetAccessPolicies),
    mergeMap(action => forkJoin(this.accessPolicyService.index({ orgId: action.orgId })).pipe(
      switchMap(data => {
        const accessPolicies = data[0].map(AccessPolicy.toModel);
        return [accessPolicyActions.GetAccessPoliciesComplete({ data: [accessPolicies] })];
      }),
    )),
  ));

  getAccessPolicy$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.GetAccessPolicy),
    mergeMap(action => this.accessPolicyService.get(action.id).pipe(
      switchMap(data => [
        accessPolicyActions.GetAccessPolicyComplete({ data: AccessPolicy.toModel(data) }),
        accessPolicyActions.ResetSelectedPermissions(),
      ]),
      catchError(error => of(accessPolicyActions.Error({ error }))),
    )),
  ));

  addAccessPolicy$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.AddAccessPolicyRequest),
    withLatestFrom(this.store.select(orgId)),
    mergeMap(([action, id]) => {
      const accessPolicy = AccessPolicy.toDto(action.item);

      return this.accessPolicyService.post(accessPolicy).pipe(
        switchMap(data => [
          accessPolicyActions.AddAccessPolicySuccess({ modal: action.modal }),
          accessPolicyActions.GetAccessPolicies({ orgId: id }),
          accessPolicyActions.GotoAccessPolicy({ id: data.id, navSettings: null }),
        ]),
        catchError(error => of(accessPolicyActions.AddAccessPolicyError({ error }))),
      );
    }),
  ));

  updateAccessPolicy$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.UpdateAccessPolicyRequest),
    withLatestFrom(this.store.select(selectedPermissions)),
    mergeMap(([action, selectedPermissions]) => {
      const accessPolicy = action.item;
      accessPolicy.permissions = selectedPermissions;

      return this.accessPolicyService.put(AccessPolicy.toDto({ ...accessPolicy })).pipe(
        switchMap(accessPolicy => {
          if (action.callback) {
            action.callback();
          }

          return [
            accessPolicyActions.UpdateAccessPolicySuccess({ accessPolicy: AccessPolicy.toModel(accessPolicy) }),
            accessPolicyActions.ResetSelectedPermissions(),
          ];
        }),
        catchError(error => of(accessPolicyActions.UpdateAccessPolicyError({ error }))),
      );
    }),
  ));

  updateAdvancedPermissionsRequest$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.UpdateAdvancedPermissionsRequest),
    withLatestFrom(
      this.store.select(selectedPermissions),
      this.store.select(accessPoliciesItem),
    ),
    mergeMap(([action, selectedPermissions, acPolicy]) => {
      const accessPolicy = acPolicy;

      const basicPermissions = GroupedAccessPolicyPermissions
        .toDto(accessPolicy.permissions)
        ?.filter(p => p.entityType.category?.id !== EntityTypeCategoryEnum.Field && !p.actionType.isAdvanced);

      const newAdvancedPermissions = GroupedAccessPolicyPermissions
        .toDto(selectedPermissions)
        ?.filter(p => p.entityType.category?.id === EntityTypeCategoryEnum.Field || p.actionType.isAdvanced);

      accessPolicy.permissions = GroupedAccessPolicyPermissions.toModel([
        ...basicPermissions,
        ...newAdvancedPermissions,
      ]);

      return this.accessPolicyService.put(AccessPolicy.toDto({ ...accessPolicy })).pipe(
        switchMap(accessPolicy => {
          if (action.callback) {
            action.callback();
          }

          return [accessPolicyActions.UpdateAccessPolicySuccess({ accessPolicy: AccessPolicy.toModel(accessPolicy) })];
        }),
        catchError(error => of(accessPolicyActions.UpdateAccessPolicyError({ error }))),
      );
    }),
  ));

  resetAdvancedPermissions$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.ResetAdvancedPermissions),
    withLatestFrom(
      this.store.select(selectedPermissions),
      this.store.select(accessPoliciesItem),
    ),
    mergeMap(([_, selectedPermissions, accessPolicy]) => {
      const basicPermissions = GroupedAccessPolicyPermissions
        .toDto(selectedPermissions)
        ?.filter(p => p.entityType.category?.id !== EntityTypeCategoryEnum.Field && !p.actionType.isAdvanced);

      const advancedPermissions = GroupedAccessPolicyPermissions
        .toDto(accessPolicy.permissions)
        ?.filter(p => p.entityType.category?.id === EntityTypeCategoryEnum.Field || p.actionType.isAdvanced);

      const permissions = GroupedAccessPolicyPermissions.toModel([
        ...basicPermissions,
        ...advancedPermissions,
      ]);

      return [accessPolicyActions.ResetSelectedPermissionsSuccess({ permissions })];
    }),
  ));

  resetSelectedPermissions$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.ResetSelectedPermissions),
    withLatestFrom(this.store.select(accessPoliciesItem)),
    mergeMap(([, accessPolicy]) => [accessPolicyActions.ResetSelectedPermissionsSuccess({ permissions: accessPolicy.permissions })]),
  ));

  deleteAccessPolicies$ = createEffect((): any => this.actions$.pipe(
    ofType(accessPolicyActions.DeleteAccessPoliciesRequest),
    mergeMap(action => this.accessPolicyService.deleteAll(action.ids).pipe(
      switchMap(() => [accessPolicyActions.DeleteAccessPoliciesSuccess(), GotoParentView()]),
      catchError(error => of(accessPolicyActions.Error({ error }))),
    )),
  ));

  updateAccessPolicySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.UpdateAccessPolicySuccess),
    tap(() => {
      this.toaster.showSuccess('Access Policy was updated');
    }),
  ), { dispatch: false });

  addAccessPolicySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.AddAccessPolicySuccess),
    tap(({ modal }) => {
      modal.hide();
      this.toaster.showSuccess('New Access Policy was created');
    }),
  ), { dispatch: false });

  deleteAccessPoliciesSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.DeleteAccessPoliciesSuccess),
    tap(() => {
      this.toaster.showSuccess('Access Policy was deleted');
    }),
  ), { dispatch: false });

  gotoAccessPolicies$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.GotoAccessPolicies),
    tap(() => this.router.navigate(['/admin/user/roles'])),
  ), { dispatch: false });

  gotoAccessPolicy$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.GotoAccessPolicy),
    tap(({ id, navSettings }) => this.router.navigate([`${this.router.url}/${id}`], { state: { navSettings } })),
  ), { dispatch: false });

  // permissions
  getAllPermissions$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.GetAllPermissions),
    mergeMap(() => forkJoin(
      this.permissionsService.getAll(this.categoriesToDisplay),
      this.entityTypesService.getAll(this.categoriesToDisplay),
    ).pipe(
      switchMap(([permissions, entityTypes]) => {
        const mappedEntityTypes = entityTypes.map(item => EntityType.toModel(item));
        const groupedPermissions = new GroupedPermissions(permissions, mappedEntityTypes);

        return [
          accessPolicyActions.GetAllPermissionsComplete({ permissions: groupedPermissions, entityTypes: mappedEntityTypes }),
        ];
      }),
      catchError(error => of(accessPolicyActions.Error({ error }))),
    )),
  ));

  // Action Types
  getActionTypes$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.GetActionTypes),
    mergeMap(() => this.permissionsService.getActionTypes().pipe(
      switchMap(actionTypes => [
        accessPolicyActions.GetActionTypesComplete({ actionTypes }),
      ]),
      catchError(error => of(accessPolicyActions.Error({ error }))),
    )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(accessPolicyActions.Error),
    map(({ error }) => [this.toaster.showError(error)]),
  ), { dispatch: false });
}
