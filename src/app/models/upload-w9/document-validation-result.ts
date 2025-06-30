import { W9ValidationStatus } from '../enums/w9-validation-status.enum';

export class DocumentValidationResult {
  status: W9ValidationStatus;
  messages: string[];
}
