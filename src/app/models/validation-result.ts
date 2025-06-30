export class ValidationResult {
  isValid: boolean;
  errors: string[];

  constructor(isValid: boolean, errors: string[]) {
    this.isValid = isValid;
    this.errors = errors;
  }
}
