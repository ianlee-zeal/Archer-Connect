/* eslint-disable import/no-cycle */
import { DateHelper } from '@app/helpers/date.helper';
import { AddressType } from './address-type';
import { Auditable } from './auditable';
import { Claimant } from './claimant';
import { DisbursementGroup } from './disbursement-group';
import { Document } from './documents';
import { ElectionPaymentMethod, PaymentMethodEnum } from './enums';
import { IdValue } from './idValue';

export class ClaimantElection extends Auditable {
  id: number;
  clientId: number;
  client: Claimant;
  received: boolean;
  receivedDate: Date;
  efPaymentMethodId: ElectionPaymentMethod;
  efPaymentMethod: IdValue;
  paymentMethodId: PaymentMethodEnum;
  lumpSumAmount?: number;
  structuredSettlementAmount?: number;
  specialNeedsTrustAmount?: number;
  addressChange: boolean;
  addressCity: string;
  addressLineOne: string;
  addressLineTwo: string;
  addressState: string;
  addressZip: string;
  country: string;
  countryId: number;
  addressTypeId: number;
  addressType: AddressType;
  dateSigned: Date;
  deficiencyNotes: string;
  doc: Document;
  docId: number;
  documentChannel: IdValue;
  documentChannelId: number;
  docusignId: number;
  documentReviewId: number;
  originalDoc: Document;
  originalDocId: number;
  electionFormStatusId: number;
  electionFormStatus: IdValue;
  netAllocation: number;
  disbursementGroupId: number | null;
  disbursementGroup: DisbursementGroup | null;
  note: string;

  public static toModel(item: any): ClaimantElection {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        clientId: item.clientId,
        client: Claimant.toModel(item.client),
        received: !!item.doc || !!item.receivedDate,
        receivedDate: DateHelper.toLocalDate(item.receivedDate),
        efPaymentMethodId: item.efPaymentMethodId,
        efPaymentMethod: item.efPaymentMethod,
        paymentMethodId: item.paymentMethodId,
        lumpSumAmount: item.lumpSumAmount ?? 0,
        structuredSettlementAmount: item.structuredSettlementAmount ?? 0,
        specialNeedsTrustAmount: item.specialNeedsTrustAmount ?? 0,
        addressChange: item.addressChange,
        addressCity: item.addressCity,
        addressLineOne: item.addressLineOne,
        addressLineTwo: item.addressLineTwo,
        addressState: item.addressState,
        addressZip: item.addressZip,
        country: item.country,
        countryId: item.countryId,
        addressType: AddressType.toModel(item.addressType),
        addressTypeId: item.addressTypeId,
        dateSigned: DateHelper.toLocalDate(item.dateSigned),
        deficiencyNotes: item.deficiencyNotes,
        doc: Document.toModel(item.doc),
        docId: item.docId,
        documentChannel: item.documentChannel,
        documentChannelId: item.documentChannelId,
        docusignId: item.docusignId,
        documentReviewId: item.documentReviewId,
        originalDoc: Document.toModel(item.originalDoc),
        originalDocId: item.originalDocId,
        electionFormStatus: item.electionFormStatus,
        electionFormStatusId: item.electionFormStatus?.id,
        netAllocation: item.netAllocation,
        disbursementGroupId: item.disbursementGroupId,
        disbursementGroup: DisbursementGroup.toModel(item.disbursementGroup),
        note: item.note,
      };
    }

    return null;
  }
}
