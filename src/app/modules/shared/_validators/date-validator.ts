import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import moment from 'moment-timezone';
import { Injectable } from '@angular/core';
import { DateFormatPipe } from '../_pipes';

@Injectable({ providedIn: 'root' })
export class DateValidator {
  public valid(control: AbstractControl): ValidationErrors | null {
    if (control.value == null) {
      return null;
    }

    const value = moment(control.value, DateFormatPipe.format, true);

    return value && value.isValid() && value.toDate().getFullYear().toString().length === 4
      ? null
      : { invalidDate: true };
  }

  public sameOrBefore(control: AbstractControl, date: Date): ValidationErrors | null {
    if (control.value == null || date == null) {
      return null;
    }

    return moment(control.value).isSameOrBefore(date)
      ? null
      : { invalidDateRange: true };
  }

  public sameOrAfter(control: AbstractControl, date: Date): ValidationErrors | null {
    if (control.value == null || date == null) {
      return null;
    }

    return moment(control.value).isSameOrAfter(date)
      ? null
      : { invalidDateRange: true };
  }

  public notFutureDate(control: AbstractControl): ValidationErrors | null {
    if (control.value == null) {
      return null;
    }
    return moment(control.value).startOf('day').isSameOrBefore(moment().startOf('day')) ? null : { error: 'Date cannot be a future date' };
  }

  public notPastDate(control: AbstractControl): ValidationErrors | null {
    if (control.value == null) {
      return null;
    }
    return moment(control.value).startOf('day').isSameOrAfter(moment().startOf('day')) ? null : { error: 'Date cannot be a past date' };
  }

  public validate(value: string | Date, control: AbstractControl): void {
    let validationError: ValidationErrors = null;

    if (value) {
      const valueAsMoment = moment(value, DateFormatPipe.format, true);
      validationError = valueAsMoment.isValid() ? null : { invalidDate: true };
    }

    control.setErrors(validationError);

    if (!control.touched) {
      control.markAsTouched({ onlySelf: true });
    }
  }

  public duplicateDatesValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    const values = control.controls.map(c => c.value);
    const nonEmptyValues = values.filter(value => value !== '');

    const onlyDates = nonEmptyValues.map(date => {
      const d = new Date(date);
      const adjustedDate = new Date(new Date(date).getTime() - (d.getTimezoneOffset() * 60000));
      return adjustedDate.toISOString().split('T')[0];
    });

    const hasDuplicates = onlyDates.some((value, index) => onlyDates.indexOf(value) !== index);
    return hasDuplicates ? { duplicates: true } : null;
  };
}
