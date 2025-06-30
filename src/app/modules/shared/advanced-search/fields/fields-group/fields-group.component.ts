import { Component, Input } from '@angular/core';

import { SearchState } from '@app/models/advanced-search/search-state';
import { BaseSearchField } from '../base-search-field';

@Component({
  selector: 'app-advanced-search-fields-group',
  templateUrl: './fields-group.component.html',
  styleUrls: ['./fields-group.component.scss'],
  providers: [
    {
      provide: BaseSearchField,
      useExisting: AdvancedSearchFieldsGroupComponent,
    },
  ],
})
export class AdvancedSearchFieldsGroupComponent extends BaseSearchField {
  @Input() public entry: SearchState;

  public get isRequiredValidationDisabled(): boolean {
    return this.entry.field.allAdditionalFieldsRequired ? false : this.entry.additionalFields.some(field => field.term);
  }
}
