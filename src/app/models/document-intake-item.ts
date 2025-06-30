import { Auditable } from '@app/models/auditable';

export class DocumentIntakeItem extends Auditable {
  type: string;
  projectName: string;
  status: string;
  count: number;

  public static toModel(item): DocumentIntakeItem {
    if (!item) {
      return null;
    }
    return {
      projectName: item.caseName,
      ...item,
    };
  }
}
