import { Component, OnInit, OnDestroy } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GroupedAccessPolicyPermissions } from '@app/models/grouped-access-policy-permissions';
import { EntityTypeCategoryEnum, PermissionActionTypeEnum } from '@app/models/enums';
import { IdValue, PermissionV2 } from '@app/models';
import { GroupedPermissions } from '@app/models/grouped-permissions';
import { PermissionsGridBase } from '../permissions-grid-base';

@Component({
  selector: 'app-field-permissions-grid',
  templateUrl: './field-permissions-grid.component.html',
  styleUrls: ['./field-permissions-grid.component.scss'],
})
export class FieldPermissionsGridComponent extends PermissionsGridBase implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  private readonly allActionTypes: number[] = [
    PermissionActionTypeEnum.Read,
    PermissionActionTypeEnum.Create,
    PermissionActionTypeEnum.Edit,
    PermissionActionTypeEnum.Delete,
  ];

  public actionTypes: IdValue[];
  public allPermissions: GroupedPermissions;

  public ngOnInit() {
    this.allPermissions$
      .pipe(
        filter(permissions => !!permissions),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(allPermissions => {
        this.allPermissions = allPermissions;
        const assignedActionTypeSet = new Set<number>();

        // Show only assigned action types
        for (const entryType of this.entityTypes) {
          for (const actionType of this.allActionTypes) {
            if (this.isPermissionExist(allPermissions, entryType.id, actionType)) {
              assignedActionTypeSet.add(actionType);
            }
          }
        }

        this.actionTypes = Array
          .from(assignedActionTypeSet)
          .map(i => <IdValue>{ id: i, name: PermissionActionTypeEnum[i] });
      });
  }

  public hasActions(permissions: GroupedAccessPolicyPermissions, entityTypeId: number): boolean {
    const actions = permissions[entityTypeId];
    return !!actions;
  }

  protected findPermissionByActionType(permissionsPerEntityType: PermissionV2[], entityTypeId: number, actionTypeId: PermissionActionTypeEnum): PermissionV2 {
    return permissionsPerEntityType.find(permission => permission.entityType.category?.id === EntityTypeCategoryEnum.Field
      && permission.actionType?.id === actionTypeId
      && permission.entityType?.id === entityTypeId);
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
