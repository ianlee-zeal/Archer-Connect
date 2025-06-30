import { ImportErrorType, ImportValidationErrorType } from "../enums";

export class ValidationResultLineItemError {
  type: ImportErrorType;
  validationType: ImportValidationErrorType;
  property: string;
  data: string;
  summary: string;

  constructor(model?: ValidationResultLineItemError) {
    Object.assign(this, model);
  }
}
