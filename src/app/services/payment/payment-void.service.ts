import { Injectable } from '@angular/core';
import { Payment } from '@app/models';
import { StopPaymentRequestStatusEnum } from '@app/models/enums/payment-status.enum';
import { Observable } from 'rxjs';
import { MessageService } from '../message.service';

@Injectable({ providedIn: 'root' })
export class PaymentVoidService {
  private readonly warningSPRMsg = 'WARNING: Stop Payment is in the process of reissuing check or new check has been completed. To prevent a duplicate payment from being processed, please check with QSF Accounting before proceeding.';
  constructor(
    private messageService: MessageService,
  ) {}

  public isDisabledVoidPaymentAction(payment: Payment): boolean {
    return payment?.cannotVoid;
  }

  public tooltipTextVoidPayment(payment: Payment): string {
    if (!payment?.hasPaymentRequest) {
      return 'Payment was generated outside of ARCHER Connect. Please void the payment within the Accounting system.';
    }

    if (payment?.status === 'Cleared' || payment?.status === 'Void' || payment?.status === 'Voided') {
      return 'Payment cannot be voided because payment status is Cleared or Void.';
    }

    if (payment?.externalTrxnId && !payment?.stopPaymentRequest) {
      return 'Payment is being processed - a Stop Payment Request must first be initiated.';
    }

    if (payment?.stopPaymentRequest) {
      if (payment?.stopPaymentRequest.statusId === StopPaymentRequestStatusEnum.Rejected) {
        return 'Payment cannot be voided because Stop Payment Status is Rejected due to Bank confirmation that check has cleared.';
      }

      if ([
        StopPaymentRequestStatusEnum.Review,
        StopPaymentRequestStatusEnum.WaitingPeriod,
        StopPaymentRequestStatusEnum.InquiryAddlInfoRequested,
        StopPaymentRequestStatusEnum.PendingAPUpdates,
        StopPaymentRequestStatusEnum.APUpdatesComplete].includes(payment?.stopPaymentRequest.statusId)) {
        return 'A Stop Payment Request has been initiated, but has not been confirmed by the bank.  Payment cannot be voided until Stop Payment Request is confirmed.';
      }

      if ([
        StopPaymentRequestStatusEnum.ReadyToPay,
        StopPaymentRequestStatusEnum.Completed,
        StopPaymentRequestStatusEnum.PendingQC,
        StopPaymentRequestStatusEnum.QCApproved,
        StopPaymentRequestStatusEnum.QCDeclined,
        StopPaymentRequestStatusEnum.PendingSmartPayableReview,
        StopPaymentRequestStatusEnum.SmartPayableReviewApproved,
        StopPaymentRequestStatusEnum.SmartPayableReviewDeclined].includes(payment?.stopPaymentRequest.statusId)) {
        return this.warningSPRMsg;
      }
    }

    return '';
  }

  public showDuplicateWarningConfirmationDialog(): Observable<boolean> {
    return this.messageService.showConfirmationDialog('WARNING! Duplicate Payment Risk!', this.warningSPRMsg);
  }

  public showConfirmationDialog(showNote: boolean): Observable<any> {
    const title = 'Confirm Payment Void';
    const msg = `Voiding a payment cannot be undone.
    If you would like to continue voiding this payment, click Ok.
    If you did not intend to take this action or have not confirmed with QSF Accounting that the payment has not been processed,
    please click Cancel.`;

    if (showNote)
      return this.messageService.showConfirmationWithNoteDialog(
        title,
        msg,
        null,
        '',
      );

    return this.messageService.showConfirmationDialog(title, msg);
  }

  public isSPRWithDuplicateWarningStatus(stopPaymentStatusId): boolean {
    switch (stopPaymentStatusId) {
      case StopPaymentRequestStatusEnum.ReadyToPay:
      case StopPaymentRequestStatusEnum.Completed:
      case StopPaymentRequestStatusEnum.PendingQC:
      case StopPaymentRequestStatusEnum.QCApproved:
      case StopPaymentRequestStatusEnum.QCDeclined:
      case StopPaymentRequestStatusEnum.PendingSmartPayableReview:
      case StopPaymentRequestStatusEnum.SmartPayableReviewApproved:
      case StopPaymentRequestStatusEnum.SmartPayableReviewDeclined:
        return true;
      default:
        return false;
    }
  }
}
