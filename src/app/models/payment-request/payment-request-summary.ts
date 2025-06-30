import { DateHelper } from '@app/helpers/date.helper';

export class PaymentRequestSummary {
  paymentRequestId: number;
  requesterId: number;
  requesterName: string;

  statusId: number;
  statusName: string;

  caseId: number;
  caseName: string;

  qsfAccount: string;

  paymentCount: string;
  paymentAmount: number;

  submittedDate: Date;

  note: string;

  attachmentDocumentIds: number[];

  isManual: boolean;

  static toModel(item: any) : PaymentRequestSummary | null {
    if (item) {
      return {
        paymentRequestId: item.paymentRequestId,
        requesterId: item.requesterId,
        requesterName: item.requesterName,
        statusId: item.statusId,
        statusName: item.statusName,
        caseId: item.caseId,
        caseName: item.caseName,
        qsfAccount: item.qsfAccount,
        paymentCount: item.paymentCount,
        paymentAmount: item.paymentAmount,
        submittedDate: DateHelper.toLocalDateWithoutTime(item.submittedDate),
        note: item.note,
        attachmentDocumentIds: item.attachmentDocumentIds,
        isManual: item.isManual
      };
    }

    return null;
  }
}
