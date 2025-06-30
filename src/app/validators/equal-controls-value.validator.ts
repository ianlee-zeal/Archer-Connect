import { UntypedFormGroup, ValidationErrors } from '@angular/forms';

export const equalControlsValueValidator = (controlName: string, anotherControlName: string) => {
  return (formGroup: UntypedFormGroup): ValidationErrors | null => {
    const controlNameValue = formGroup.controls[controlName].value;
    const anotherControlNameValue = formGroup.controls[anotherControlName].value;

    return controlNameValue === anotherControlNameValue ? null : { notSame: true };
  };
};
