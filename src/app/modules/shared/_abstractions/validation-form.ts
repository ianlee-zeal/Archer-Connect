import { UntypedFormGroup, UntypedFormControl, UntypedFormArray } from '@angular/forms';
import { ValidationComponent } from '../_interfaces/validation-component';

export abstract class ValidationForm implements ValidationComponent {
  protected abstract get validationForm(): UntypedFormGroup;

  private touchInvalid(fg: UntypedFormArray | UntypedFormGroup) {
    Object.keys(fg.controls).forEach(field => {
      const ctrl = fg.get(field);

      if (ctrl instanceof UntypedFormControl) {
        if (ctrl.invalid) ctrl.markAsTouched({ onlySelf: true });
      } else if (ctrl instanceof UntypedFormGroup || ctrl instanceof UntypedFormArray) {
        this.touchInvalid(ctrl);
      }
    });
  }

  public validate(): boolean {
    this.touchInvalid(this.validationForm);

    return this.validationForm.valid;
  }
}
