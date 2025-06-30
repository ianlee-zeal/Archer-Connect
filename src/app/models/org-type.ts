import { Auditable } from './auditable';

export class OrgType extends Auditable{
  id: number;
  name: string;
  isPrimary: boolean;

  constructor(model?: Partial<OrgType>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): OrgType {
    return {
      ...super.toModel(item),
      id: item.id,
      name: item.name,
      isPrimary: !!item.isPrimary
    };
  }

  public static toDto(item: OrgType): any {
    return {
      id: item.id,
      name: item.name,
      isPrimary: item.isPrimary,
    };
  }
}
