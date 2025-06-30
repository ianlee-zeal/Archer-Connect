import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EntityType } from '@app/models/entity-type';
import { PermissionV2, AccessPolicy } from '@app/models';
import { GroupedPermissions } from '@app/models/grouped-permissions';
import { EntityTypeCategoryEnum } from '@app/models/enums/entity-type-category.enum';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { AccessPoliciesState } from '../../state/state';
import * as accessPoliciesSelectors from '../../state/selectors';
import * as accessPoliciesActions from '../../state/actions';

@Component({
  selector: 'app-modal-field-permissions',
  templateUrl: './modal-field-permissions.component.html',
  styleUrls: ['./modal-field-permissions.component.scss'],
})
export class ModalFieldPermissionsComponent implements OnInit, OnDestroy {
  @Input() public entityType: EntityType;
  @Input() public canEdit: boolean = true;

  public entityTypes$;
  public ngUnsubscribe$ = new Subject<void>();
  public accessPolicy$ = this.store.select(accessPoliciesSelectors.accessPoliciesItem);
  public allPermissions$ = this.store.select(accessPoliciesSelectors.allPermissions);
  public error$ = this.store.select(accessPoliciesSelectors.error);

  public accessPolicy: AccessPolicy;
  public readonly editAccessPolicyPermissions = PermissionService.create(PermissionTypeEnum.AccessPolicies, PermissionActionTypeEnum.Edit);

  readonly awaitedSaveActionTypes = [
    accessPoliciesActions.UpdateAccessPolicySuccess.type,
    accessPoliciesActions.UpdateAccessPolicyError.type,
  ];

  constructor(
    private store: Store<AccessPoliciesState>,
    private modalRef: BsModalRef,
  ) {
  }

  public ngOnInit() {
    this.entityTypes$ = this.store.select(accessPoliciesSelectors.fieldEntityTypes, { parentId: this.entityType.id });

    this.accessPolicy$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.accessPolicy = item;
      });
  }

  public hasAdvancedPermissions(allPermissions: GroupedPermissions): boolean {
    const permissionsPerEntityType = allPermissions[this.entityType.id] as PermissionV2[];

    return permissionsPerEntityType?.some(perm => perm.actionType.isAdvanced);
  }

  public hasFieldPermissions(allPermissions: GroupedPermissions): boolean {
    const permissionsPerEntityType = allPermissions[this.entityType.id] as PermissionV2[];

    return permissionsPerEntityType?.some(perm => perm.entityType.category?.id === EntityTypeCategoryEnum.Field);
  }

  public onSave() {
    this.store.dispatch(accessPoliciesActions.UpdateAdvancedPermissionsRequest({ callback: () => this.modalRef.hide() }));
  }

  public onCancel() {
    this.store.dispatch(accessPoliciesActions.ResetAdvancedPermissions());
    this.modalRef.hide();
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
