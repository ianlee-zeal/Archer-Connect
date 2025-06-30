/* eslint-disable import/no-cycle */
import { Attachment } from '../attachment';
import { NoteDto } from '../note';

export interface IAcceptPaymentRequestData {
  selectedPaymentIds: string[],
  note: NoteDto,
  attachments: Attachment[],
}
