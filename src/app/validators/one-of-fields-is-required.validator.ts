import { AbstractControl, UntypedFormGroup, ValidationErrors } from '@angular/forms';

export const oneOfFieldsIsRequired = (controls: AbstractControl[]) => (formGroup: UntypedFormGroup): ValidationErrors | null => { /* eslint-disable-line @typescript-eslint/no-unused-vars */
  const hasValue = controls.some((control: AbstractControl) => control.value);

  if (hasValue) {
    return null;
  }

  return { oneOfFieldsIsRequired: true };
};
