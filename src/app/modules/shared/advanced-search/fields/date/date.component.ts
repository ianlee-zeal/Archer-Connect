import { Component, Input, ViewEncapsulation } from '@angular/core';
import { default as moment } from 'moment-timezone';

import { SearchState } from '@app/models/advanced-search/search-state';
import { BaseSearchField } from '../base-search-field';

@Component({
  selector: 'app-advanced-search-field-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  providers: [
    {
      provide: BaseSearchField,
      useExisting: AdvancedSearchFieldDateComponent,
    }
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AdvancedSearchFieldDateComponent extends BaseSearchField {
  @Input() public entry: SearchState;

  public isRequiredValidationDisabled: boolean;

  protected validate(): void {
    super.validate();

    if (this.hasErrors() || this.condition === this.conditions.IsMissing) {
      return;
    }

    if (this.condition !== this.conditions.InRange && !this.entry.term) {
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

      if (term && termTo && !moment(<Date>term).startOf('day').isBefore(termTo)) {
        this.entry.errors.range = { invalidDateRange: true };
      }
    }
  }
}
