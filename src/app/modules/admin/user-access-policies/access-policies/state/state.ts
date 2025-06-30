import { AccessPolicy, PermissionActionType } from '@app/models';
import { EntityType } from '@app/models/entity-type';
import { GroupedPermissions } from '@app/models/grouped-permissions';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { GroupedAccessPolicyPermissions } from '@app/models/grouped-access-policy-permissions';

export interface AccessPoliciesState {
  index: AccessPolicy[],
  item: AccessPolicy,
  orgId: number,
  itemHeader: AccessPolicy,
  allPermissions: GroupedPermissions,
  selectedPermissions: GroupedAccessPolicyPermissions,
  actionTypes: PermissionActionType[],
  entityTypes: EntityType[],
  error: string,
  actionBar: ActionHandlersMap,
}

export const accessPoliciesInitialState: AccessPoliciesState = {
  index: null,
  item: null,
  orgId: null,
  itemHeader: null,
  allPermissions: null,
  selectedPermissions: null,
  actionTypes: null,
  entityTypes: null,
  error: null,
  actionBar: null,
};
