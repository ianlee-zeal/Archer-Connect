import { ClientHoldAdvancedSearchKey } from '@app/models/enums';
import { Component, Input, SimpleChanges } from '@angular/core';

import { SearchState } from '@app/models/advanced-search/search-state';
import { HoldType } from '@app/models/hold-type';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { HoldTypesService } from '@app/services/api/hold-types.service';
import { BaseSearchField } from '../fields/base-search-field';

@Component({
  selector: 'app-hold-client-group',
  templateUrl: './hold-client-group.component.html',
  styleUrls: ['./hold-client-group.component.scss'],
})
export class HoldClientGroupComponent extends BaseSearchField {
  @Input() public entry: SearchState;

  public isRequiredValidationDisabled: boolean;
  private initialAdditionalFieldsList: SearchState[];
  private holdTypes: HoldType[] = [];
  private holdTypesList: SelectOption[] = [];
  private holdTypeReasonsList: SelectOption[] = [];

  constructor(private holdTypesService: HoldTypesService) { super(); }

  ngOnInit(): void {
    this.initialAdditionalFieldsList = [...this.entry.additionalFields];
    this.entry.field.onTermChange = this.getTermChangeCallback(this.entry.field.key);

    this.entry.additionalFields.forEach(obj => {
      obj.field.onTermChange = this.getTermChangeCallback(obj.field.key);
      if (!obj.options || !obj.options.length) {
        obj.options = this.getSelectOptionsProperty(obj.field.key);
      }
    });

    this.getHoldTypes();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }

  public getTermChangeCallback(input: string) {
    switch (input) {
      case ClientHoldAdvancedSearchKey.ClientOnHold:
      case ClientHoldAdvancedSearchKey.HoldTypeReason:
        return this.updateClaimantHoldSearchField.bind(this);
      case ClientHoldAdvancedSearchKey.HoldTypeId:
        return this.getHoldTypeReasons.bind(this);
      default:
        return null;
    }
  }

  public getSelectOptionsProperty(input: string): SelectOption[] {
    switch (input) {
      case ClientHoldAdvancedSearchKey.ClientOnHold:
      case ClientHoldAdvancedSearchKey.HoldTypeReason:
        return [];
      case ClientHoldAdvancedSearchKey.HoldTypeId:
        return this.holdTypesList;
      case ClientHoldAdvancedSearchKey.HoldTypeReasonId:
        return this.holdTypeReasonsList;
      default:
        return null;
    }
  }

  private updateClaimantHoldSearchField(value) {
    if (!value) {
      return;
    }

    if (value === 'true') {
      this.entry.additionalFields = [...this.initialAdditionalFieldsList];
      this.setDefaultSearchConditions();
    } else if (value === 'false') {
      this.entry.additionalFields = [];
    }

    const key = value === 'true' ? ClientHoldAdvancedSearchKey.HoldTypeReason : ClientHoldAdvancedSearchKey.ClientOnHold;
    this.entry.field = { ...this.entry.field, key, onTermChange: this.getTermChangeCallback(key) };
  }

  // find and update entry and force change detection on it
  private updateOptions(key: string, options: SelectOption[]) {
    const i = this.entry.additionalFields.findIndex(o => o.field.key == key);

    this.entry.additionalFields[i].options = options;
    this.entry.additionalFields[i] = { ...this.entry.additionalFields[i] }; // force change detection
  }

  private getHoldTypes() {
    this.holdTypesService.getHoldTypes()
      .subscribe(result => {
        this.holdTypes = result;
        const holdTypes = result.map(type => ({ id: type.id, name: type.name }));
        this.updateOptions(ClientHoldAdvancedSearchKey.HoldTypeId, holdTypes);
        this.setDefaultSearchConditions();
      });
  }

  private getHoldTypeReasons(holdTypeId: number) {
    const holdTypeReasons = this.holdTypes.find(type => type.id === holdTypeId).holdTypeReasons;
    this.updateOptions(ClientHoldAdvancedSearchKey.HoldTypeReasonId, holdTypeReasons);
  }

  private setDefaultSearchConditions() {
    if (!this.entry.term) {
      this.entry.term = 'true';
    }

    if (this.entry.term === 'true' && !this.entry.additionalFields[0].term) {
      const { id } = this.holdTypes[0];
      this.entry.additionalFields[0].term = id;
      this.entry.additionalFields[1].term = null;
      this.getHoldTypeReasons(id);
    }
  }
}
