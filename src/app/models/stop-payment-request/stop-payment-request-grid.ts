/* eslint-disable import/no-cycle */
import { Auditable } from '../auditable';
import { EntityAddress } from '../entity-address';

export class StopPaymentRequestGrid extends Auditable {
  id: number;
  statusId: number;
  status: string;
  resendReasonId: number;
  resendReason: string;
  resendReasonSpecificationId: number;
  resendReasonSpecification: string;
  isAddressCorrect: boolean;
  active: boolean;
  statusDescription: string;
  addressLink: EntityAddress;
  note: string;
  statusComment: string;
  attachmentDocumentIds: number[];
  qsfAcctDocumentIds: number[];
  requestInformationUpdatedDate: Date;

  constructor(model?: Partial<StopPaymentRequestGrid>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): StopPaymentRequestGrid {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        statusId: item.statusId,
        resendReasonId: item.resendReasonId,
        resendReasonSpecificationId: item.resendReasonSpecificationId,
        resendReasonSpecification: item.resendReasonSpecification,
        isAddressCorrect: item.isAddressCorrect,
        active: item.active,
        statusDescription: item.statusDescription,
        resendReason: item.resendReason,
        status: item.status,
        addressLink: EntityAddress.toModel(item.addressLink),
        note: item.note,
        statusComment: item.statusComment,
        attachmentDocumentIds: item.attachmentDocumentIds,
        qsfAcctDocumentIds: item.qsfAcctDocumentIds,
        requestInformationUpdatedDate: item.requestInformationUpdatedDate ? new Date(item.requestInformationUpdatedDate) : null,
      };
    }
    return null;
  }

  public static toDto(item: Partial<StopPaymentRequestGrid>): any {
    if (!item) {
      return null;
    }

    return { resendReason: item.resendReason };
  }
}
