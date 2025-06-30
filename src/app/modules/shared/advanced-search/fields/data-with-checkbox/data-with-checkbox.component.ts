/* eslint-disable no-param-reassign */
import { Component, Input, ViewChild } from '@angular/core';

// eslint-disable-next-line import/no-extraneous-dependencies
import { ProductCategory } from '@app/models/enums';
import { MultiSelectListWithChipsComponent } from '@app/modules/shared/multiselect-list-with-chips/multiselect-list-with-chips.component';
import { SearchState } from '@app/models/advanced-search/search-state';
import { BaseSearchField } from '../base-search-field';
import { AdvancedSearchFieldDataComponent } from '../data/data.component';

@Component({
  selector: 'app-advanced-search-field-data-with-checkbox',
  templateUrl: './data-with-checkbox.component.html',
  styleUrls: ['./data-with-checkbox.component.scss'],
  providers: [
    {
      provide: BaseSearchField,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: AdvancedSearchFieldDataWithCheckboxComponent,
    },
  ],
})
export class AdvancedSearchFieldDataWithCheckboxComponent extends AdvancedSearchFieldDataComponent {
  @ViewChild(MultiSelectListWithChipsComponent) multiSelectListWithChipsComponent: MultiSelectListWithChipsComponent;
  @Input() public entry: SearchState;

  public get showCheckbox(): boolean {
    if (this.entry.field.termsToShowCheckbox) {
      const termsToShowCheckbox = this.entry.field.termsToShowCheckbox.map((itm : string | number) => itm.toString());
      return termsToShowCheckbox.includes(this.entry.term?.toString());
    }
    return true;
  }

  public get checkboxLabelText(): string {
    if (this.entry.field.checkboxLabel?.trim()) {
      return this.entry.field.checkboxLabel;
    }

    switch (this.entry.term) {
      case ProductCategory.Probate:
        return 'Include No Probate';
      case ProductCategory.Bankruptcy:
        return 'Include No Bankruptcy';
      case ProductCategory.MedicalLiens:
        return 'Include No Medical Liens';
      default:
        return '';
    }
  }

  public get additionalCheckboxDisabled(): boolean {
    return this.entry.field.mutualExclusion && !!this.entry.term;
  }

  protected validate(): void {
    if (!this.entry) {
      return;
    }

    this.entry.errors = {};

    if (!this.condition) {
      this.entry.errors.condition = { required: true };
    }

    if (this.hasErrors() || this.condition === this.conditions.IsMissing) {
      return;
    }

    if (!this.isRequiredValidationDisabled) {
      if (this.entry.field.mutualExclusion) {
        if ((this.entry.additionalInfo.isChecboxChecked && !!this.entry.term)
          || (!this.entry.additionalInfo.isChecboxChecked && !this.entry.term)
        ) {
          this.entry.errors.term = { required: true };
        }
      } else if (!this.entry.term) {
        this.entry.errors.term = { required: true };
      }
    }
  }

  public onChangeCheckbox(value): void {
    super.onChangeCheckbox(value);
    if (this.entry.field.mutualExclusion) {
      this.setAdditionalCheckbox(false);
    }
  }

  public onSelectAllChange(isChecked: boolean): void {
    super.onSelectAllChange(isChecked);
    if (this.entry.field.mutualExclusion) {
      this.setAdditionalCheckbox(false);
    }
  }

  public onChangeSearch(value): void {
    super.onChangeSearch(value);

    if (this.entry.field.mutualExclusion) {
      this.setAdditionalCheckbox(false);
    }

    this.entry.additionalInfo = this.entry.additionalInfo || {};
    this.entry.additionalInfo.isChecboxChecked = false;
    this.markAsEdited.emit();
  }

  public additionalCheckboxChange(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.setAdditionalCheckbox(element.checked);
    this.markAsEdited.emit();
  }

  private setAdditionalCheckbox(isChecked: boolean): void {
    this.entry.additionalInfo = this.entry.additionalInfo || {};
    this.entry.additionalInfo.isChecboxChecked = isChecked;
  }
}
