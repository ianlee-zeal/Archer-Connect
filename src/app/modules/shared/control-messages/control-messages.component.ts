import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'control-messages',
  templateUrl: './control-messages.component.html',
})
export class ControlMessagesComponent {
  @Input() control: UntypedFormControl;
  @Input() customErrorMessage: string;
  @Input() customErrorPropName: string;

  get errorMessage() {
    for (const propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName)
        && (this.control.touched || !this.control.pristine)) {
        if ((!!this.customErrorMessage && !this.customErrorPropName)
          || (this.customErrorMessage && (this.customErrorPropName === propertyName))) {
          return this.customErrorMessage;
        }
        return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
      }
    }

    return null;
  }
}
