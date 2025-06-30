import { DocumentImport } from './documents';

export class PaymentRequestUpload {
  caseId: number;
  totalRows: number;
  totalAmount: number;
  qsf: number;
  spreadsheet: DocumentImport;
}
