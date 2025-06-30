// eslint-disable-next-line import/no-cycle
import { NoteDto } from '..';

export class PaymentRequestTotalInfo {
  totalAmount: number;
  userFirstName: string;
  userLastName: string;
  caseName: string;
  caseId: number;
  qsfCompanyName: string;
  qsfCompanyAltName: string;
  note: NoteDto;
}
