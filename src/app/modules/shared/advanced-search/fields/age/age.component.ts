import { Component, Input } from '@angular/core';

import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchConditionsEnum } from '@app/models/advanced-search/search-conditions.enum';
import { BaseSearchField } from '../base-search-field';
import { SelectOption } from '../../../_abstractions/base-select';

const periodOptions: SelectOption[] = [
  {
    id: 'Days',
    name: 'Days',
  },
  {
    id: 'Months',
    name: 'Months',
  },
];

@Component({
  selector: 'app-advanced-search-field-age',
  templateUrl: './age.component.html',
  styleUrls: ['./age.component.scss'],
  providers: [
    {
      provide: BaseSearchField,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: AdvancedSearchFieldAgeComponent,
    },
  ],
})
export class AdvancedSearchFieldAgeComponent extends BaseSearchField {
  @Input() public entry: SearchState;
  @Input() public isRequiredValidationDisabled: boolean = false;

  public term: string;
  public termTo: string;
  public period: string = 'Days';

  public options: SelectOption[] = periodOptions;

  protected validate(): void {
    super.validate();

    if (this.hasErrors() || this.condition === this.conditions.IsMissing) {
      return;
    }

    if (this.condition !== this.conditions.InRange) {
      if (!this.entry.term && !this.isRequiredValidationDisabled) {
        this.entry.errors.term = { required: true };
      } else {
        this.restorePropertyIfNecessary('term');
        if (!this.term && !this.isRequiredValidationDisabled) {
          this.entry.errors.term = { required: true };
        } else if (+this.term === 0 && !this.isRequiredValidationDisabled) {
          this.entry.errors.term = { positive: true };
        }
        if (!this.period && !this.isRequiredValidationDisabled) {
          this.entry.errors.period = { required: true };
        }
      }
    }

    if (this.condition === this.conditions.InRange) {
      const { term, termTo } = this.entry;

      if (!term && !this.isRequiredValidationDisabled) {
        this.entry.errors.term = { required: true };
      }

      if (!termTo && !this.isRequiredValidationDisabled) {
        this.entry.errors.termTo = { required: true };
      }

      if (term && termTo && term >= termTo && !this.isRequiredValidationDisabled) {
        this.entry.errors.range = { invalidRange: true };
      }

      this.restorePropertyIfNecessary('term');
      this.restorePropertyIfNecessary('termTo');
    }
  }

  public onInputTermChange(value: string): void {
    this.term = value;

    this.markAsEdited.emit();
    this.setTerm();
  }

  public onInputTermToChange(value: string): void {
    this.termTo = value;

    this.markAsEdited.emit();
    this.setTermTo();
  }

  public onPeriodChange(value: string): void {
    this.period = value;

    this.markAsEdited.emit();
    this.setTerm();
    this.setTermTo();
  }

  private setTerm(): void {
    if (!this.term || !this.period) {
      this.entry.term = null;
    }

    this.entry.term = this.term;
    this.entry.additionalInfo.period = this.period;

    if (this.entry.field.onTermChange) {
      this.entry.field.onTermChange(this.entry);
    }
  }

  private setTermTo(): void {
    if (!this.termTo || !this.period) {
      this.entry.termTo = null;
    }

    this.entry.termTo = this.termTo;
    this.entry.additionalInfo.period = this.period;

    if (this.entry.field.onTermChange) {
      this.entry.field.onTermChange(this.entry);
    }
  }

  public static isValidAgeState(state: SearchState): boolean {
    if (!state.condition) {
      return false;
    }

    if (state.condition === SearchConditionsEnum.InRange) {
      return this.isValidBetweenAgeState(state);
    }
    return !!state.term;
  }

  private static isValidBetweenAgeState(state: SearchState) {
    return (state.term && state.termTo && state.term < state.termTo) || (!state.term && !state.termTo);
  }

  private restorePropertyIfNecessary(propertyName: string) {
    if (!this[propertyName] && this.entry[propertyName]) {
      this[propertyName] = this.entry[propertyName];
    }
  }
}
