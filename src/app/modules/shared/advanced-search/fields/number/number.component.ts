import { Component, Input } from '@angular/core';

import { SearchState } from '@app/models/advanced-search/search-state';
import { BaseSearchField } from '../base-search-field';

@Component({
  selector: 'app-advanced-search-field-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.scss'],
  providers: [
    {
      provide: BaseSearchField,
      useExisting: AdvancedSearchFieldNumberComponent,
    }
  ],
})
export class AdvancedSearchFieldNumberComponent extends BaseSearchField {
  @Input() public entry: SearchState;

  public isRequiredValidationDisabled: boolean;

  protected validate(): void {
    super.validate();

    if (this.hasErrors() || this.condition === this.conditions.IsMissing) {
      return;
    }

    if (this.condition !== this.conditions.InRange && !this.entry.term && !this.isRequiredValidationDisabled) {
      this.entry.errors.term = { required: true };
    }

    if (this.entry.condition === this.conditions.InRange) {
      const { term, termTo } = this.entry;

      if (!term && !this.isRequiredValidationDisabled) {
        this.entry.errors.term = { required: true };
      }

      if (!termTo && !this.isRequiredValidationDisabled) {
        this.entry.errors.termTo = { required: true };
      }

      if (term && termTo && (parseInt(this.entry.term.toString().replace(',', ''), 10) > parseInt(this.entry.termTo.toString().replace(',', ''), 10))) {
        this.entry.errors.range = { invalidRange: true };
      }
    }

    if (this.entry.term) {
      const validationResult = this.entry.field.validation({value: this.entry.term});

      if (validationResult) {
        this.entry.errors.term = validationResult;
      }
    }

    if (this.entry.termTo) {
      const validationResult = this.entry.field.validation({value: this.entry.termTo});

      if (validationResult) {
        this.entry.errors.termTo = validationResult;
      }
    }
  }
}
