/* eslint-disable class-methods-use-this */
import { Injectable } from '@angular/core';
import { UntypedFormGroup, AbstractControl } from '@angular/forms';
import { ApiErrorResponse, ErrorLevel } from '@app/models/api-error-response';
import { ValidationService } from './validation.service';
import { ToastService } from './toast-service';

// Service that is able to use form server errors.
@Injectable({ providedIn: 'root' })
export class ServerErrorService {
  constructor(private toastrService: ToastService) { }

  // method sets errors from `response` to the `form` object.
  showServerErrors(form: UntypedFormGroup, response: any) {
    const noToastr = response.error?.errorMessages != null;

    // show Toastr error message if we don't pass form control.
    if (!noToastr && (form == null && response.error)) {
      this.toastrService.showError(response.error);
      return;
    }

    // show toaster in case if errors are empty and there is an error on global level
    if ((response?.error?.errorMessages && Object.keys(response.error.errorMessages).length === 0) && response.error?.error?.length) {
      this.toastrService.showError(response.error.error);
      return;
    }

    if (!response.error && !response.error?.errorMessages) {
      return;
    }

    if (response.error && !response.error.errorMessages) {
      this.toastrService.showError(response.error);
      return;
    }

    Object.keys(response.error?.errorMessages).forEach(fieldName => {
      const errors = response.error.errorMessages[fieldName];
      if (errors) {
        this.setErrors(fieldName, form, errors);
      }
    });
  }

  // checks if the `fieldName` valid or not.
  public hasWrongValue(form: UntypedFormGroup, fieldName: string): boolean {
    return this.getFieldErrors(form, fieldName).length > 0;
  }

  public getFieldErrors(form: UntypedFormGroup, fieldName: string) {
    const control = this.getFieldControl(form, fieldName);

    if (control && control.touched && control.errors) {
      const result = this.getErrors(control);
      return result;
    }

    return [];
  }

  // get errors array for the current `fieldName` in the form.
  getFieldError(form: UntypedFormGroup, fieldName: string) {
    return this.getFieldErrors(form, fieldName);
  }

  public getFormErrors(fieldName: string, err: ApiErrorResponse): string[] {
    const errors = this.getParameterCaseInsensitive(err.errorMessages, fieldName);

    if (!errors) {
      return [];
    }

    return errors
      .filter(e => e.ErrorLevel === ErrorLevel.Form)
      .map(e => e.Content);
  }

  // Get errors array from the forms `control`
  private getErrors(control: AbstractControl) {
    const result = Object.keys(control.errors)
      .filter((error: any) => control.errors[error])
      .reduce((acc, currentValue) => {
        // Try to get a default validation message from ValidationService.
        // If message is undefined we assume that there are custom errors in the control.
        const currentErrors = control.errors[currentValue];
        const message = ValidationService.getValidatorErrorMessage(currentValue, currentErrors);

        if (message) {
          return [message, ...acc];
        }

        return acc.concat(currentErrors);
      }, []);

    return result;
  }

  private setErrors(fieldName: string, form: UntypedFormGroup, errors: any) {
    const formControlName = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
    const control = this.getFieldControl(form, formControlName);

    if (control) {
      // analyze `errors` array and set errors that are appropriate to `fieldName` to the related form control
      errors.forEach(currentError => {
        const fieldNameFromResponse = this.getParameterCaseInsensitive(currentError, 'fieldName');
        if (fieldNameFromResponse === fieldName) {
          const errorLevelFromResponse = this.getParameterCaseInsensitive(currentError, 'errorLevel');
          if (currentError && errorLevelFromResponse === 0) {
            const errorsToSet = control.errors ? control.errors[fieldName] : [];

            const errorContentFromResponse = this.getParameterCaseInsensitive(currentError, 'content');
            errorsToSet.push(errorContentFromResponse);

            const newError = { [formControlName]: errorsToSet };
            control.setErrors(newError);
          }
        }
      });
    }
  }

  private getFieldControl(form: UntypedFormGroup, fieldName: string): AbstractControl {
    return form.get(fieldName);
  }

  private getParameterCaseInsensitive(object, key) {
    return object[Object.keys(object).filter(k => k.toLowerCase() === key.toLowerCase())[0]];
  }
}
