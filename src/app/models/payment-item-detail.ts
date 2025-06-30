export class PaymentItemDetail {
  id: string;
  paymentId: number;
  disbursementGroupId?: number;
  disbursementGroup: string;
  stageId: number;
  stage: string;
  clientId: number;
  client: string;
  createdDate: Date;
  amount?: number;
  payeeEntityId?: number;
  payeeEntityType: string;
  claimSettlementLedgerId: number;
  sourceEntityType: number;
  paymentItemStatus: string;
  paymentItemStatusId: number;
  entityStatus: string;
  entityStatusId: number;
  chartOfAccountId: number;
  accountGroupNo: string;
  accountNo: string;
  displayName: string;

  constructor(model?: Partial<PaymentItemDetail>) {
    Object.assign(this, model);
  }

  static toModel(item: any): PaymentItemDetail {
    return {
      id: item.Id,
      paymentId: item.paymentId,
      accountGroupNo: item.accountGroupNo,
      accountNo: item.accountNo,
      chartOfAccountId: item.chartOfAccountId,
      claimSettlementLedgerId: item.claimSettlementLedgerId,
      client: item.client,
      clientId: item.clientId,
      createdDate: item.createdDate,
      disbursementGroup: item.disbursementGroup,
      displayName: item.displayName,
      entityStatus: item.entityStatus,
      entityStatusId: item.entityStatusId,
      payeeEntityType: item.payeeEntityType,
      paymentItemStatus: item.paymentItemStatus,
      paymentItemStatusId: item.paymentItemStatusId,
      sourceEntityType: item.sourceEntityType,
      stage: item.stage,
      stageId: item.stageId,
      amount: item.amount,
      disbursementGroupId: item.disbursementGroupId,
      payeeEntityId: item.payeeEntityId,
    };
  }
}
