import { Directive, Input } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Directive({ selector: '[connectForm]' })
export class ConnectFormDirective {
  @Input('connectForm')
  set data(val: any) {
    if (val && this.formGroupDirective.form) {
      this.formGroupDirective.form.patchValue(val);
      this.formGroupDirective.form.markAsPristine();
    }
  }
  constructor(private readonly formGroupDirective: FormGroupDirective) { }
}
