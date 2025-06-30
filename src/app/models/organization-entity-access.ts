import { Auditable } from './auditable';

export class OrganizationEntityAccess extends Auditable {
  public id: number;
  public organizationId: number;
  public organizationName: string;
  public organizationTypeId: number;
  public organizationTypeName: string;
  public entityTypeId: number;
  public entityId: number;
  public externalId: string;
  public displayName: string;
  public deleted: boolean;
  public isMaster: boolean;

  constructor(model?: Partial<OrganizationEntityAccess>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): OrganizationEntityAccess {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        organizationId: item.organizationId,
        organizationName: item.organization?.name,
        organizationTypeId: item.organizationTypeId,
        organizationTypeName: item.organizationType?.name,
        entityTypeId: item.entityTypeId,
        entityId: item.entityId,
        externalId: item.externalId,
        displayName: item.displayName,
        deleted: item.organization?.deleted,
        isMaster: item.organization?.isMaster,
      };
    }
    return null;
  }

}
