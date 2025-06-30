import { Component, Input, Output, EventEmitter } from '@angular/core';
import isEqual from 'lodash/isEqual';

import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchTypes } from '@app/models/advanced-search/search-types.hash';

@Component({
  selector: 'app-advanced-search-filter',
  templateUrl: './advanced-search-filter.component.html',
  styleUrls: ['./advanced-search-filter.component.scss'],
})
export class AdvancedSearchFilterComponent {
  @Input() public entry: SearchState;
  @Input() public isRequiredValidationDisabled: boolean;
  @Output() public submit = new EventEmitter();
  @Output() public markAsEdited = new EventEmitter();

  public readonly types = SearchTypes;
  public readonly isEqual = isEqual;
}
