import { ValidationResultsLineItem } from '../file-imports';

export class InvoiceArcherFeesValidationResultItem {
  accountNumber: string;
  accountName: string;
  totalAmount: number;
  recordCount: number;

  constructor(model?: Partial<InvoiceArcherFeesValidationResultItem>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): InvoiceArcherFeesValidationResultItem {
    return {
      accountNumber: item.accountNumber,
      accountName: item.accountName,
      totalAmount: 0,
      recordCount: 0,
    };
  }

  public static transformToInvoiceArcherFees(items: ValidationResultsLineItem[]): InvoiceArcherFeesValidationResultItem[] {
    const groupedResults = items.reduce((acc, item) => {
      const accountNo = item.fields?.AccountNo;
      const amount = parseFloat(item.fields?.Amount) || 0;

      if (!acc[accountNo]) {
        acc[accountNo] = {
          accountNumber: accountNo,
          accountName: item.fields?.AccountName || '',
          totalAmount: 0,
          recordCount: 0,
        };
      }

      acc[accountNo].totalAmount += amount;
      acc[accountNo].recordCount += 1;

      return acc;
    }, {} as { [key: string]: InvoiceArcherFeesValidationResultItem });

    return Object.values(groupedResults);
  }
}
