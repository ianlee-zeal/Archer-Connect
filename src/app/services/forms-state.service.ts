import { Injectable } from '@angular/core';
import { UntypedFormGroup, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormsStateService {

  public restoreFormState(formState: UntypedFormGroup, destinationForm: UntypedFormGroup): void {
    if (formState) {
      Object.keys(formState.controls).forEach(key => {
        const controlInState = formState.controls[key];
        if (destinationForm.controls[key]) {
          const formControl = destinationForm.controls[key] as AbstractControl;
          if (controlInState.pristine) {
            formControl.markAsPristine({ onlySelf: true });
          } else {
            formControl.markAsDirty({ onlySelf: true });
          }
          if (controlInState.touched) {
            formControl.markAsTouched({ onlySelf: true });
          } else {
            formControl.markAsUntouched({ onlySelf: true });
          }
        }
      })
    }
  }

  public restoreFormData(formData: any, destinationForm: UntypedFormGroup): void {
    if (formData) {
      destinationForm.patchValue(formData, { onlySelf: true, emitEvent: false });
    }
  }

}
