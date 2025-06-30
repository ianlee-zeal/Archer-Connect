import { Document } from './documents/document';

export class ManualPaymentRequestDocs {
  caseId: number;
  additionalDocuments: Document[];
  note: string;
}
