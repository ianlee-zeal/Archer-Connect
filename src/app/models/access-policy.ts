import { GroupedAccessPolicyPermissions } from './grouped-access-policy-permissions';
import { Auditable } from '@app/models/auditable';
import { IdValue } from './idValue';

export class AccessPolicy extends Auditable {
  id: number;
  name: string;
  organizationId: null;
  description: string;
  policyLevel: IdValue;
  nameWithPolicyLevel: string;
  permissions: GroupedAccessPolicyPermissions | null;

  public static toModel(item: any): AccessPolicy {
    if (!item) {
      return null;
    }

    return {
      ...super.toModel(item),
      id: item.id,
      name: item.name,
      organizationId: item.organization && item.organization.id || null,
      description: item.description,
      policyLevel: item.policyLevel,
      nameWithPolicyLevel: item.nameWithPolicyLevel,
      permissions: GroupedAccessPolicyPermissions.toModel(item.permissions),
    };
  }

  public static toDto(accessPolicy: AccessPolicy) {
    return {
      id: accessPolicy.id,
      name: accessPolicy.name,
      organizationId: accessPolicy.organizationId,
      description: accessPolicy.description,
      permissionIds: GroupedAccessPolicyPermissions.toDto(accessPolicy.permissions).map(permission => permission.id),
    };
  }
}
