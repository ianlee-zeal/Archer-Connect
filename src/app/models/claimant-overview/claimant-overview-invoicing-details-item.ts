export class ClaimantOverviewInvoicingDetailsItem {
  serviceName: string;
  accountNo: string;
  totalFees?: number;
  totalFeesInvoiced?: number;
  totalFeesPaid?: number;
  invoiceNumber: string;
  invoiceDate: Date;
  feeWrittenToLedger?: number;
  isTotalRow: boolean;
  isLedgerFeeExceedsTotalFees: boolean;
  showTotalFeesPending: boolean;

  public static toModel(item: any): ClaimantOverviewInvoicingDetailsItem {
    if (!item) {
      return null;
    }

    return {
      serviceName: item.serviceName,
      accountNo: item.accountNo,
      totalFees: item.totalFees,
      totalFeesInvoiced: item.totalFeesInvoiced,
      totalFeesPaid: item.totalFeesPaid,
      invoiceNumber: item.invoiceNumber,
      invoiceDate: item.invoiceDate ? new Date(item.invoiceDate) : null,
      feeWrittenToLedger: item.feeWrittenToLedger,
      isTotalRow: item.isTotalRow,
      isLedgerFeeExceedsTotalFees: item.isLedgerFeeExceedsTotalFees,
      showTotalFeesPending: item.showTotalFeesPending,
    };
  }
}
