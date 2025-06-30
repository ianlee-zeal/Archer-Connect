/* eslint-disable import/no-cycle */
import { Payment } from 'src/app/models/payment';
import { DateHelper } from '@app/helpers/date.helper';
import { Auditable } from './auditable';
import { EntityAddress } from './entity-address';
import { IdValue } from '.';
import { Attachment } from './attachment';
import { Note } from './note';
import { ResendReasonSpecification } from './stop-payment-request/resend-reason-specification';

export class StopPaymentRequest extends Auditable {
  id: number;
  paymentId: number;
  statusId: number;
  resendReasonId: number;
  resendReasonSpecificationId: number;
  resendReasonSpecification: ResendReasonSpecification;
  isAddressCorrect: boolean;
  active: boolean;
  statusDescription: string;
  payment: Payment;
  resendReason: IdValue;
  status: IdValue;
  addressLink: EntityAddress;
  note: Note;
  statusComment: string;
  sprAttachments: Attachment[];
  qsfAcctAttachments: Attachment[];
  requestInformationUpdatedDate: Date;

  constructor(model?: Partial<StopPaymentRequest>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): StopPaymentRequest {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        paymentId: item.paymentId,
        statusId: item.statusId,
        resendReasonId: item.resendReasonId,
        resendReasonSpecificationId: item.resendReasonSpecificationId,
        resendReasonSpecification: item.resendReasonSpecification,
        isAddressCorrect: item.isAddressCorrect,
        active: item.active,
        statusDescription: item.statusDescription,
        payment: item.payment,
        resendReason: item.resendReason,
        status: item.status,
        addressLink: EntityAddress.toModel(item.addressLink),
        note: Note.toModel(item.note),
        statusComment: item.statusComment,
        sprAttachments: item.sprAttachments.map(Attachment.toModel),
        qsfAcctAttachments: item.qsfAcctAttachments.map(Attachment.toModel),
        requestInformationUpdatedDate: item.requestInformationUpdatedDate ? DateHelper.toLocalDate(item.requestInformationUpdatedDate) : null,
      };
    }
    return null;
  }

  public static toDto(item: Partial<StopPaymentRequest>): any {
    if (!item) {
      return null;
    }

    return { resendReason: item.resendReason };
  }
}
