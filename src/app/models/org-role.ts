import { Auditable } from './auditable';
import { AccessPolicy } from './access-policy';
import { IdValue } from './idValue';

export class OrgRole extends Auditable {
  id: number;
  name: string;
  roleLevel: IdValue;
  organizationId: number;
  accessPolicyId: number;
  accessPolicy: AccessPolicy;
  orgName: string;
  usersCount: number;

  constructor(model?: Partial<OrgRole>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): OrgRole {
    return {
      ...super.toModel(item),
      id: item.id,
      name: item.name,
      roleLevel: item.roleLevel,
      organizationId: item.organizationId,
      accessPolicy: item.accessPolicy,
      orgName: item.orgName,
      usersCount: item.usersCount,
      accessPolicyId: item.accessPolicyId
    };
  }

  public static toDto(item: OrgRole): any {
    return {
      id: item.id,
      name: item.name,
      organizationId: item.organizationId,
      orgName: item.orgName,
      usersCount: item.usersCount,
      accessPolicyId: item.accessPolicyId,
    };
  }
}
