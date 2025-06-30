import { Payment } from 'src/app/models/payment';
import { Auditable } from '../auditable';

export class CheckVerificationGrid extends Auditable {
  id: number;
  paymentId: number;
  active: boolean;
  agentsName: string;
  financialInstitution: string;
  payment: Payment;
  note: string;
  phone: string;
  documentIds: number[];

  constructor(model?: Partial<CheckVerificationGrid>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): CheckVerificationGrid {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        paymentId: item.paymentId,
        active: item.active,
        agentsName: item.agentsName,
        financialInstitution: item.financialInstitution,
        payment: item.payment,
        note: item.note,
        phone: item.phone,
        documentIds: item.documentIds,
      };
    }
    return null;
  }
}
