import { Component, Input } from '@angular/core';

import { SearchConditionsEnum } from '@app/models/advanced-search/search-conditions.enum';
import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchTypesEnum } from '@app/models/advanced-search/search-types.enum';
import { ValidationService as VS } from '@app/services/validation.service';
import { BaseSearchField } from '../base-search-field';

@Component({
  selector: 'app-advanced-search-field-identifier',
  templateUrl: './identifier.component.html',
  styleUrls: ['./identifier.component.scss'],
  providers: [
    {
      provide: BaseSearchField,
      useExisting: AdvancedSearchFieldIdentifierComponent,
    },
  ],
})
export class AdvancedSearchFieldIdentifierComponent extends BaseSearchField {
  @Input() public entry: SearchState;
  @Input() public disabled: boolean;

  public isRequiredValidationDisabled: boolean;
  public searchTypesEnum = SearchTypesEnum;

  public get options() : any {
    return this.entry.additionalInfo.commaSeparatedIds ? this.conditionOptionsCommaSeparatedIds : this.conditionOptions;
  }

  public conditionOptionsCommaSeparatedIds: string[] = [SearchConditionsEnum.Contains];

  public commaSeparatedIdsChange(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.checked) {
      if (this.entry.field.type.type === SearchTypesEnum.NumberIdentifier) {
        this.condition = SearchConditionsEnum.Contains;
      }
      if (this.entry.field.type.type === SearchTypesEnum.StringIdentifier) {
        this.condition = SearchConditionsEnum.In;
        this.conditionOptionsCommaSeparatedIds = [SearchConditionsEnum.In, SearchConditionsEnum.NotIn];
      }
    } else {
      this.condition = this.entry.field.defaultCondition;
    }
    this.entry.additionalInfo = this.entry.additionalInfo || {};

    if (this.entry.additionalInfo?.commaSeparatedIds !== element.checked) {
      this.entry.term = '';
      this.entry.additionalInfo.commaSeparatedIds = element.checked;
    }

    this.markAsEdited.emit();
  }

  protected validate(): void {
    super.validate();

    const conditions: SearchConditionsEnum[] = this.entry && this.entry.field.conditionsForValidation;

    if (this.hasErrors() || this.condition === this.conditions.IsMissing) {
      return;
    }
    if (this.entry && (!conditions || conditions.includes(this.condition))) {
      const validationResult = this.entry.additionalInfo.commaSeparatedIds && this.entry.field.type.type === SearchTypesEnum.NumberIdentifier
        ? VS.commaSeparatedValidator({ value: this.entry.term })
        : false;

      if (validationResult) {
        this.entry.errors.term = validationResult;
      }
    }

    if (!this.entry.additionalInfo.commaSeparatedIds && this.entry.field.validation) {
      if (this.entry.term) {
        const validationResult = this.entry.field.validation({ value: this.entry.term });

        if (validationResult) {
          this.entry.errors.term = validationResult;
        }
      }

      if (this.entry.termTo) {
        const validationResult = this.entry.field.validation({ value: this.entry.termTo });

        if (validationResult) {
          this.entry.errors.termTo = validationResult;
        }
      }
    }

    if (!this.entry.term && !this.isRequiredValidationDisabled) {
      this.entry.errors.term = { required: true };
    }
  }
}
