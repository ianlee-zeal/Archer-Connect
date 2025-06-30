// eslint-disable-next-line import/no-cycle
import { NoteDto } from '..';

export class TransferRequestTotalInfo {
  totalAmount: number;
  userFirstName: string;
  userLastName: string;
  caseName: string;
  qsfCompanyName: string;
  note: NoteDto;
}
