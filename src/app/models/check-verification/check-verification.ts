import { Payment } from 'src/app/models/payment';
import { Phone } from '..';
import { Attachment } from '../attachment';
import { Auditable } from '../auditable';
import { Note } from '../note';

export class CheckVerification extends Auditable {
  id: number;
  paymentId: number;
  active: boolean;
  agentsName: string;
  financialInstitution: string;
  payment: Payment;
  note: Note;
  attachments: Attachment[];
  phone: Phone;

  constructor(model?: Partial<CheckVerification>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): CheckVerification {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        paymentId: item.paymentId,
        active: item.active,
        agentsName: item.agentsName,
        financialInstitution: item.financialInstitution,
        payment: item.payment,
        note: Note.toModel(item.note),
        attachments: item.attachments.map(Attachment.toModel),
        phone: item.phone,
      };
    }
    return null;
  }
}
