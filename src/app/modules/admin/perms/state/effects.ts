import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import * as fromAdmin from '../../state/state';
import * as permissionActions from './actions';
import { currentPermission, search as searchSelector } from './index';
import { PermissionsService } from '@app/services';

@Injectable()
export class PermissionEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<fromAdmin.AppState>,
    private permissionsService: PermissionsService,
  ) {
  }


  getAllPermissions$ = createEffect(() => this.actions$.pipe(
    ofType(permissionActions.GetPermissions),
    withLatestFrom(this.store$.select(searchSelector)),
    switchMap(([, search]) => this.permissionsService.index({ permissionTypeId: search.permissionTypeId, entityId: search.entityId, search_term: search.search_term })),
    switchMap(permissions => [permissionActions.GetPermissionsCompleted({ permissions })]),
  ));


  commitPermission = createEffect(() => this.actions$.pipe(
    ofType(permissionActions.CommitCurrentPermission),
    withLatestFrom(this.store$.select(currentPermission)),
    map(([, permission]) => permission),
    switchMap(permission => (permission.id ? this.permissionsService.put(permission) : this.permissionsService.post(permission))),
    switchMap(permission => [permissionActions.CommitCurrentPermissionCompleted({ permission }), permissionActions.GetPermissions()]),
  ));


  removePermissions = createEffect(() => this.actions$.pipe(
    ofType(permissionActions.RemovePermissions),
    switchMap(action => this.permissionsService.deleteAll(action.permissions.map(p => p.id))),
    switchMap(() => [permissionActions.RemovePermissionsCompleted(), permissionActions.GetPermissions()]),
  ));
}
