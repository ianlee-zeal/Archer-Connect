export class OrganizationPaymentStatus {
  accountGroup: string;
  account: string;
  assignedOrg: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  entryCount: number;
  paidCount: number

  static toModel(item: any) : OrganizationPaymentStatus | null {
    if (item) {
      return {
        account: item.account,
        accountGroup: item.accountGroup,
        assignedOrg: item.assignedOrg,
        totalAmount: item.totalAmount,
        paidAmount: item.paidAmount,
        balance: item.balance,
        entryCount: item.entryCount,
        paidCount: item.paidCount
      };
    }

    return null;
  }
}
