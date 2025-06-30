export class ResendReasonSpecification  {
  id: number;
  name: string;
  resendReasonId: number;
  resendReason: string;

  constructor(model?: Partial<ResendReasonSpecification>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ResendReasonSpecification {
    if (item) {
      return {
        resendReasonId: item.resendReasonId,
        resendReason: item.resendReason,
        id: item.id,
        name: item.name,
      };
    }
    return null;
  }
}
