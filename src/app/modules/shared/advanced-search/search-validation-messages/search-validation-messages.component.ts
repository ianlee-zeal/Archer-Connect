import { Component, Input } from '@angular/core';

import { ValidationService } from '@app/services/validation.service';

@Component({
  selector: 'app-search-validation-messages',
  templateUrl: './search-validation-messages.component.html',
  styleUrls: ['./search-validation-messages.component.scss'],
})
export class SearchValidationMessagesComponent {
  @Input() errors: {};

  get message() {
    for (let propertyName in this.errors) {
      if (this.errors.hasOwnProperty(propertyName)) {
        if(propertyName === 'required') {
          return null;
        }
        return ValidationService.getValidatorErrorMessage(propertyName, this.errors[propertyName]);
      }
    }

    return null;
  }
}
