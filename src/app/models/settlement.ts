import { Auditable } from './auditable';

export class Settlement extends Auditable {
  id: number;
  name: string;
  orgId: number;
  matterId: number;
  org: string;
  matter: string;
  createdOn: string;
  showFinancialSummary: boolean;

  constructor(model?: Partial<Settlement>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item): Settlement {
    return {
      ...super.toModel(item),
      id: item.id,
      name: item.name,
      orgId: item.org?.id,
      matterId: item.tort?.id,
      matter: item.tort?.name,
      org: item.org?.name,
      createdOn: item.createdOn,
      showFinancialSummary: item.showFinancialSummary,
    } as Settlement;
  }

  public static toDto(item: Settlement) {
    let dto = {
      name: item.name,
      tortId: item.matterId,
      orgId: item.orgId,
      showFinancialSummary: item.showFinancialSummary,
    };

    if (item.id) {
      dto = Object.assign(dto, { id: item.id });
    }

    return dto;
  }
}
