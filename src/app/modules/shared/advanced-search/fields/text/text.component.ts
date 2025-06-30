import { Component, Input } from '@angular/core';

import { SearchState } from '@app/models/advanced-search/search-state';
import { BaseSearchField } from '../base-search-field';

import { SearchConditionsEnum } from '@app/models/advanced-search/search-conditions.enum';
@Component({
  selector: 'app-advanced-search-field-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
  providers: [
    {
      provide: BaseSearchField,
      useExisting: AdvancedSearchFieldTextComponent,
    }
  ],
})
export class AdvancedSearchFieldTextComponent extends BaseSearchField {
  @Input() public entry: SearchState;
  @Input() public disabled: boolean;

  public isRequiredValidationDisabled: boolean;

  protected validate(): void {
    super.validate();
    let conditions: SearchConditionsEnum[] = this.entry && this.entry.field.conditionsForValidation;

    if (this.hasErrors() || this.condition === this.conditions.IsMissing) {
      return;
    }

    if (this.entry && this.entry.field.validation && (!conditions || conditions.includes(this.condition))) {
      const validationResult = this.entry.field.validation({value: this.entry.term});

      if (validationResult) {
        this.entry.errors.term = validationResult;
      }
    }

    if (!this.entry.term && !this.isRequiredValidationDisabled) {
      this.entry.errors.term = { required: true };
    }
  }
}
