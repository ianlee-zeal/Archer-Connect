export class CopySpecialPaymentInstructionData {
  payee: string;
  method: string;
  percentage: number;

  constructor(model?: CopySpecialPaymentInstructionData) {
    Object.assign(this, model);
  }

  public static toModel(item: any): CopySpecialPaymentInstructionData {
    return {
      payee: item.payee,
      method: item.method,
      percentage: item.percentage
    };
  }
}
