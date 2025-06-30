import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchField } from '../../../../../models/advanced-search/search-field';
import { BaseSearchField } from '../base-search-field';

@Component({
  selector: 'app-advanced-search-field-boolean',
  templateUrl: './boolean.component.html',
  styleUrls: ['./boolean.component.scss'],
  providers: [
    {
      provide: BaseSearchField,
      useExisting: AdvancedSearchFieldBooleanComponent,
    },
  ],
})
export class AdvancedSearchFieldBooleanComponent extends BaseSearchField implements OnInit {
  @Input() public entry: SearchState;

  public checkboxHidden: boolean;
  public isRequiredValidationDisabled: boolean;

  ngOnInit(): void {
    this.checkboxHidden = this.entry.field.checkboxHidden;
    this.entry.term = this.entry.term ? this.entry.term : this.entry.field.defaultTerm;
  }

  public get label(): string {
    const field: SearchField = this.entry.field;
    return field.primaryLabel ? field.primaryLabel : field.name;
  }

  public onChange(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.entry.term = element.checked;
    this.markAsEdited.emit();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    this.checkboxHidden = this.entry.field.checkboxHidden;
    this.entry.term = this.entry.term ? this.entry.term : this.entry.field.defaultTerm;
  }

  protected validate(): void {
  }
}
