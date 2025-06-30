import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonHelper } from '@app/helpers';
import { BankAccountFormatEnum } from '@app/models/enums/bank-account-format.enum';
import { PriceInputValue } from '@app/modules/shared/price-input/price-input.component';
import * as uuid from 'uuid';

type ValidationResult = { [key: string]: boolean } | null;

@Injectable({ providedIn: 'root' })
export class ValidationService {
  public static readonly ssnPattern = /^(\d{3})(\d{2})(\d{4})$/;
  public static readonly ssnFormattedPattern = /^(\d{3})-(\d{2})-(\d{4})$/;

  public static getValidatorErrorMessage(validatorName: string, validatorValue?: any): any {
    if (validatorValue && Array.isArray(validatorValue)) {
      return validatorValue.join(';');
    }

    const config = {
      required: 'Required',
      email: 'Invalid email',
      invalidCreditCard: 'Is invalid credit card number',
      invalidEmailAddress: 'Invalid email address',
      invalidPassword: 'Invalid password.',
      invalidRange: 'Invalid range',
      invalidDateRange: 'Invalid date range',
      invalidDate: 'Invalid date format',
      invalidValue: 'Invalid value',
      invalidZipCode: 'Invalid zip code',
      invalidSwiftCode: 'Only capitalize letters and numbers, 8 or 11 characters long. For example - "BANKUS12" or "BANKUS12345".',
      minlength: `Minimum length ${validatorValue.requiredLength}`,
      maxlength: `Maximum length ${validatorValue.requiredLength}`,
      ngbDate: 'Invalid date',
      duplicatedPhoneNumber: 'Phone number is duplicated',
      duplicatedEmail: 'Email is duplicated',
      onlyNumbers: 'Only numerical characters accepted',
      onlyCurrency: 'Only currency allowed',
      onlyAlphabetics: 'Only alphabetic letters allowed',
      onlyAlphanumerics: 'Only alphabetic letters and numbers allowed',
      whitespace: 'Field should not have spaces',
      whitespaceBeforeText: 'Field should not have spaces before text',
      positive: 'Should be positive',
      error: validatorValue,
      mask: 'Invalid value',
      commaSeparated: 'You must enter numbers separated by commas',
      max: `The maximum value must not exceed ${validatorValue.max}`,
      min: `The minimum value must not be less than ${validatorValue.min}`,
      maxInt: 'The entered value is too big',
      haveNotAllowedCharacters: 'The next characters are not allowed to be used: % { } \\ < > * ? / $ ! \' " : @ + ` | = ',
      invalidLienIdAsync: 'Invalid Lien Id',
      invalidDocTrackingId: 'Invalid Document Tracking ID. For example 109156be-c4fb-41ea-b1b4-efe1671c5836',
      invalidPhoneNumber: 'Only alphanumeric characters with "-" or "+" are allowed',
      onlyBankAccountUS: 'Only numerical characters allowed, 4 to 13 characters long, can be delimited by "-"',
      onlyBankAccountInternational: 'Must begin with 2 alpha followed by 2 numbers, can be delimited every 4 characters and only capital letters, numbers, spaces, "." or "-" allowed',
      onlyBankAccountUSMinlength: 'Minimum length 4',
      onlyBankAccountIntMinlength: 'Minimum length 5',
      onlyBankAccountUSMaxlength: 'Maximum length 255',
    };

    return config[validatorName] || validatorValue;
  }

  public static creditCardValidator(control): ValidationResult {
    // Visa, MasterCard, American Express, Diners Club, Discover, JCB
    if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
      return null;
    }
    return { invalidCreditCard: true };
  }

  public static notAllowedCharactersInTemplateValidator(control): ValidationResult {
    // not allowed: % { } \ < > * ? / $ ! ' " : @ + ` | =
    const haveNotAllowedCharacters = /[%{}<>*?$!'":@+`|=\/\\]+/.test(control.value);
    if (control && (!control.value || !haveNotAllowedCharacters)) {
      return null;
    }
    return { haveNotAllowedCharacters: true };
  }

  public static emailValidator(control): ValidationResult {
    // RFC 2822 compliant regex
    if (control && (!control.value || control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/))) {
      return null;
    }
    return { invalidEmailAddress: true };
  }

  public static passwordValidator(control): ValidationResult {
    // 8 characters, contain 1 alpha, 1 upper, 1 digit and 1 special character.
    if (!control.value || control.value.match(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%/^&?*)(+=._-])[a-zA-Z0-9!@#$%/^&?*)(+=._-]{8,}$/)) {
      return null;
    }
    return { invalidPassword: true };
  }

  public static onlyNumbersValidator(control): ValidationResult {
    if (control && (!control.value || typeof control.value === 'number' || control.value.match(/^\d+$/))) {
      return null;
    }

    return { onlyNumbers: true };
  }

  public static maxIntValidator(control): ValidationResult {
    if (control && (control.value <= 2147483647)) {
      return null;
    }

    return { maxInt: true };
  }

  public static onlyCurrencyValidator(control): ValidationResult {
    if (control && (!control.value || control.value.match(/^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/))) {
      return null;
    }

    return { onlyCurrency: true };
  }

  public static noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = /\s/g.test(control.value);
    return !isWhitespace ? null : { whitespace: true };
  }

  public static noWhitespaceBeforeTextValidator(control: AbstractControl): ValidationErrors | null {
    if (CommonHelper.isNullOrUndefined(control) || CommonHelper.isNullOrUndefined(control.value)) {
      return null;
    }
    return ValidationService.hasWhitespace(control);
  }

  public static requiredAndNoWhitespaceBeforeTextValidator(control: AbstractControl): ValidationErrors | null {
    if (control
        && (CommonHelper.isNullOrUndefined(control.value)
            || CommonHelper.isBlank(control.value)
            || control.value.match(/^\s+$/))) {
      return { required: true };
    }
    return ValidationService.hasWhitespace(control);
  }

  public static notEmptyValidator(control): ValidationResult {
    if (control && (!control.value || control.value.match(/[^\s]+/))) {
      return null;
    }

    return { mask: true };
  }

  public static zipCodeValidator(control): ValidationResult {
    // matches zip codes following formats: (#####, #####-####)
    if (control && (!control.value || control.value.match(/^[0-9]{5}(?:-[0-9]{4})?$/))) {
      return null;
    }

    return { invalidZipCode: true };
  }

  public static zipCodePartialValidator(control): ValidationResult {
    // matches by the piece of zip codes following formats: (#####, #####-####)
    if (!ValidationService.zipCodeValidator(control)) {
      return null; // exact match
    }

    if (control.value.match(/^([0-9]{1,5}-?|-[0-9]{1,4}|[0-9]{1,5}-[0-9]{1,4})$/)) {
      return null;
    }

    return { invalidZipCode: true };
  }

  public static docTrackingIdValidator(control): ValidationResult {
    if (control && (!control.value || uuid.validate(control.value))) {
      return null;
    }

    return { invalidDocTrackingId: true };
  }

  public static swiftCodeValidator(control): ValidationResult {
    if (control && (!control.value || control.value.match(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/))) {
      return null;
    }

    return { invalidSwiftCode: true };
  }

  public static commaSeparatedValidator(control): ValidationResult {
    if (control && (!control.value || control.value.match(/^([0-9,])*$/))) {
      return null;
    }

    return { commaSeparated: true };
  }

  public static commaSeparatedIdsValidator(control): ValidationResult {
    if (control && (!control.value || control.value.match(/^(\d+(-\d+)*,)*\d+(-\d+)*,?$/))) {
      return null;
    }

    return { commaSeparated: true };
  }

  public static onlyAlphabetics(control): ValidationResult {
    // only letters, lower & upper case
    if (control && (!control.value || control.value.match(/^[a-zA-Z ]*$/))) {
      return null;
    }
    return { onlyAlphabetics: true };
  }

  public static onlyAlphanumerics(control): ValidationResult {
    // Matches only letters(lower & upper case) and numbers
    if (control && (!control.value || control.value.match(/^[a-zA-Z0-9]*$/))) {
      return null;
    }
    return { onlyAlphanumerics: true };
  }

  public static requiredPrice(control: { value: PriceInputValue }): ValidationResult {
    let error = null;

    if (!control) {
      return error;
    }

    const priceInput = control.value;

    if (CommonHelper.isNullOrUndefined(priceInput)
      || CommonHelper.isNullOrUndefined(priceInput.value)
      || CommonHelper.isNullOrUndefined(priceInput.type)) {
      error = { required: true };
    }

    return error;
  }

  public static noEmptyStringInHTMLValidator(control): ValidationResult {
    if ((control.value || '').length === 0) { return { required: true }; }
    if ((control.value || '').replace(/(<([^>]+)>)/gi, '').replace(/ /g, '').length === 0) { return { whitespace: true }; }

    return null;
  }

  public static phoneNumberValidator(control: AbstractControl): ValidationResult {
    let value = control?.value;
    let validationError: { invalidPhoneNumber: boolean } = null;

    // If the value exists and does not match the desired format, it's invalid
    if (value && !value.match(/^(?!-+$)(?!0+$)[+]?[0-9a-zA-Z-]+$/)) {
      validationError = { invalidPhoneNumber: true };
    }

    return validationError || null;
  }

  private static hasWhitespace(control: AbstractControl): ValidationResult {
    return control.value[0] === ' ' ? { whitespaceBeforeText: true } : null;
  }

  public static bankAccountValidator(control): ValidationResult {
    if (control && !control.value) {
      return null;
    }
    if (!control.touched && control.pristine) {
      return null;
    }
    const bankAccountFormat = control?.parent?.controls?.bankAccountFormat?.value;

    if (bankAccountFormat == BankAccountFormatEnum.US) {
      if (control && control.value?.length < 4) {
        return { onlyBankAccountUSMinlength: true };
      }
      if (control && control.value?.length > 255) {
        return { onlyBankAccountUSMaxlength: true };
      }
      // if (control && control.value.match(/^(?=.{4,13}$)((?:[0-9]{1,}-?)*[0-9]{1,})$/)) {
      //  return null;
      // }
      return null;
    }

    if (bankAccountFormat == BankAccountFormatEnum.International) {
      /* if (control && control.value?.length < 5) {
        return { onlyBankAccountIntMinlength: true };
      }
      if (control && control.value.match(/^(?=.{5,34}$)[A-Z]{2}[0-9]{2}(?:[ .-]?[A-Z0-9]{4}){1,}(?:[ .-]?[A-Z0-9]{1,3})?$/)) {
        return null;
      }
      return { onlyBankAccountInternational: true }; */
      if (control && control.value?.length < 4) {
        return { onlyBankAccountIntMinlength: true };
      }
      if (control && control.value?.length > 255) {
        return { onlyBankAccountUSMaxlength: true };
      }
      return null;
    }
    return null;
  }
}
