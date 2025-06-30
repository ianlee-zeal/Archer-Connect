import { Auditable } from '../auditable';

export class ProjectProductCondition extends Auditable {
  id: number;
  caseProductId: number;
  productConditionId: number;

  name: string;
  isModified: boolean;
  isChecked: boolean;

  public static toModel(item): ProjectProductCondition {
    if (item) {
      var result = {
        ...super.toModel(item),
        id: item.id,
        name: item.name,
        caseProductId: item.caseProductId,
        productConditionId: item.productConditionId,
        isChecked: item.isChecked,
      } as ProjectProductCondition;
      return result;
    }

    return null;
  }

  public static toDto(condition: ProjectProductCondition) {
    return {
      id: condition.id || 0,
      productConditionId: condition.productConditionId,
      isChecked: condition.isChecked,
    };
  }
}
