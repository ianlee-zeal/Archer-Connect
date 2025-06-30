import { Component } from '@angular/core';

import { BaseSearchField } from '../base-search-field';
import { AdvancedSearchFieldTextComponent } from '../text/text.component';

@Component({
  selector: 'app-advanced-search-field-text-primary-option',
  templateUrl: './text-primary-option.component.html',
  styleUrls: ['./text-primary-option.component.scss'],
  providers: [
    {
      provide: BaseSearchField,
      useExisting: AdvancedSearchFieldTextPrimaryOptionComponent,
    }
  ],
})
export class AdvancedSearchFieldTextPrimaryOptionComponent extends AdvancedSearchFieldTextComponent {
  public primaryChange(event: Event): void {
    const element = event.target as HTMLInputElement;

    this.entry.additionalInfo = this.entry.additionalInfo || {};
    this.entry.additionalInfo.isPrimary = element.checked;
    this.markAsEdited.emit();
  }
}
