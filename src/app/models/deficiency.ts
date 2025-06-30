import { Auditable } from './auditable';
import { DeficiencyStatus } from './enums/deficiency-status.enum';

export class Deficiency extends Auditable {
  id: number;
  deficiencyType: string;
  ledgerStage: string;
  relatedProcess: string;
  responsibleParty: string;
  entityId: number;
  entityTypeName: string;
  disbursementGroup: string;
  severity?: string;
  isCured: boolean;
  isForceCured: boolean;
  status: DeficiencyStatus;
  isOverridePermitted: boolean;

  constructor(model?: Partial<Deficiency>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): Deficiency | null {
    if (item) {
      return {
        ...super.toModel(item),
        ...item,
        status: item.isCured ? DeficiencyStatus.Cured : DeficiencyStatus.Active,
      };
    }
    return null;
  }
}
