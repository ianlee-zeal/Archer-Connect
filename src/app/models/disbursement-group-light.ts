export class DisbursementGroupLight {
  id: number;
  name: string;
  typeId: number;
  sequenceId: number;

  public static toModel(item): DisbursementGroupLight {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      typeId: item.disbursementGroupTypeId,
      sequenceId: item.sequenceId,
    };
  }
}
