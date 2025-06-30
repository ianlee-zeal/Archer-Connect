import { DateHelper } from "@app/helpers/date.helper";

export class ClaimSettlementLedgerEntry {
  paymentId: number;
  disbursementType?: string;
  payee?: string;
  method: string;
  referenceNumber?: string;
  totalAmount: number;
  dateSent?: Date;
  status?: string;
  clearedDate?: Date;
  trackingNumber?: string;
  payeeAddress1?: string;
  payeeAddress2?: string;
  payeeAddressCity?: string;
  payeeAddressState?: string;
  payeeAddressZip?: string;
  stopPaymentReason?: string;
  type?: string;
  spiPercentage?: number;

  public static toModel(item: any): ClaimSettlementLedgerEntry {
    return {
		paymentId: item.paymentId,
		disbursementType: item.disbursementType,
		payee: item.payee,
		method: item.method,
		referenceNumber: item.referenceNumber,
		totalAmount: item.totalAmount,
		dateSent: DateHelper.toLocalDate(item.dateSent),
		status: item.status,
		clearedDate: DateHelper.toLocalDate(item.clearedDate),
		trackingNumber: item.trackingNumber,
		payeeAddress1: item.payeeAddress1,
		payeeAddress2: item.payeeAddress2,
		payeeAddressCity: item.payeeAddressCity,
		payeeAddressState: item.payeeAddressState,
		payeeAddressZip: item.payeeAddressZip,
		stopPaymentReason: item.stopPaymentReason,
		type: item.type,
		spiPercentage: item.spiPercentage,
    };
  }
}
