import { IdValue } from './idValue';
import { Org } from './org';

export class ElectionForm {
  archerId: number;
  clientId: number;
  firstName: string;
  lastName: string;
  primaryFirm: Org;
  received?: boolean;
  dateReceived?: Date;
  paymentType: string;
  addressChange: boolean;
  disbursementGroup: any; // TODO
  status: IdValue;
  netAllocation: number;
  docusignId: string;
  note: string;
  paymentMethodId: number;

  constructor(model?: Partial<ElectionForm>) {
    Object.assign(this, model);
  }

  public static toModel(item): ElectionForm {
    if (!item) {
      return null;
    }

    return {
      archerId: item.client.archerId,
      clientId: item.client.id,
      firstName: item.client.firstName,
      lastName: item.client.lastName,
      primaryFirm: item.client.org,
      received: !!item.receivedDate || !!item.doc,
      dateReceived: item.receivedDate,
      paymentType: item.efPaymentMethod.name,
      addressChange: item.addressChange,
      disbursementGroup: item.disbursementGroup,
      status: item.electionFormStatus,
      netAllocation: item.netAllocation,
      docusignId: item.docusignId,
      note: item.note,
      paymentMethodId: item.paymentMethodId,
    };
  }
}
