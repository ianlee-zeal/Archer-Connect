import { AbstractControl, ValidationErrors } from '@angular/forms';

export const autoFocusFieldAsyncValidator = (control: AbstractControl): Promise<ValidationErrors | null> => new Promise(resolve => {
  if (control.value) {
    return resolve(null);
  }
  setTimeout(() => {
    const controls = control?.parent?.controls;
    if (controls) {
      const touchedInputs = Object.keys(controls).filter(key => controls[key].touched === true);

      return touchedInputs.length !== 0 && !control.value
        ? resolve({ required: true })
        : resolve(null);
    }
    return resolve(null);
  }, 3000);
});
