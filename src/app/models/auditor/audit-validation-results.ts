import { AuditResultPreview } from './audit-result-preview';

export class AuditValidationResults {
  totalRecordsCount: number;
  items: [];

  constructor(model?: Partial<AuditValidationResults>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): AuditValidationResults {
    return {
      totalRecordsCount: item.totalRecordsCount,
      items: item.items.map(AuditResultPreview.toModel),
    };
  }
}
