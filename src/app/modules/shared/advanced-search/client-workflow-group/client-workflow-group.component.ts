import { Component, Input, SimpleChanges } from '@angular/core';

import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchTypes } from '@app/models/advanced-search/search-types.hash';
import { ClientWorkflowAdvancedSearchKey, EntityTypeEnum } from '@app/models/enums';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ProductCategoriesService, StagesService } from '@app/services';
import { AdvancedSearchFieldAgeComponent } from '../fields/age/age.component';
import { BaseSearchField } from '../fields/base-search-field';

@Component({
  selector: 'app-client-workflow-group',
  templateUrl: './client-workflow-group.component.html',
  styleUrls: ['./client-workflow-group.component.scss']
})
export class ClientWorkflowGroupComponent extends BaseSearchField {
  @Input() public entry: SearchState;

  public isRequiredValidationDisabled: boolean;

  private productCategories: SelectOption[] = [];
  private stages: SelectOption[] = [];

  constructor(
    private productCategoriesService: ProductCategoriesService,
    private stagesService: StagesService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.entry.additionalFields.forEach(obj => {
      obj.field.onTermChange = this.getCallBack(obj.field.key);
      obj.field.onConditionChange = this.getConditionCallBack(obj.field.key);
      if (!obj.options || !obj.options.length) {
        obj.options = this.getSelectOptionsProperty(obj.field.key);
      }
    });

    this.initProductCategories();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    this.setRequiredValidation();
  }

  private getCallBack(input: string) {
    switch (input) {
      case ClientWorkflowAdvancedSearchKey.ProductCategory:
        return this.productCategoryDropdownCallBack.bind(this);
      case ClientWorkflowAdvancedSearchKey.Stage:
      case ClientWorkflowAdvancedSearchKey.AgeOfStage:
        return this.validationCallBack.bind(this);
      default:
        return null;
    }
  }

  private getConditionCallBack(input: string) {
    switch (input) {
      case ClientWorkflowAdvancedSearchKey.ProductCategory:
        return this.productCategoryConditionCallBack.bind(this);
      case ClientWorkflowAdvancedSearchKey.Stage:
      case ClientWorkflowAdvancedSearchKey.AgeOfStage:
        return this.validationCallBack.bind(this);
      default:
        return null;
    }
  }

  private getSelectOptionsProperty(input: string): SelectOption[] {
    switch (input) {
      case ClientWorkflowAdvancedSearchKey.ProductCategory:
        return this.productCategories;
      case ClientWorkflowAdvancedSearchKey.Stage:
        return this.stages;
      default:
        return null;
    }
  }

  // find and update entry and force change detection on it
  private updateOptions(key: string, options: SelectOption[]) {
    const i = this.entry.additionalFields.findIndex(o => o.field.key == key);

    this.entry.additionalFields[i].options = options;
    this.entry.additionalFields[i] = { ...this.entry.additionalFields[i] }; // force change detection
  }

  private initProductCategories() {
    this.productCategoriesService.getDropdownProductCategories()
      .subscribe(result => this.updateOptions(ClientWorkflowAdvancedSearchKey.ProductCategory, result));
  }

  private productCategoryDropdownCallBack(value: any): void {
    this.setProductCategoryResponse(value);
    this.setRequiredValidation();
  }

  private productCategoryConditionCallBack(value: any): void {
    if (!value) {
      this.setProductCategoryResponse(null);
    }
    this.setRequiredValidation();
  }

  private setProductCategoryResponse(value: any): void {
    let ids: number[] = this.trimIds([value]);
    ids = this.trimIds(ids);

    if (ids.length > 0) {
      this.stagesService.getDropdownByProductCategories(ids, EntityTypeEnum.Clients)
        .subscribe(result => this.updateOptions(ClientWorkflowAdvancedSearchKey.Stage, result));
    } else {
      this.updateOptions(ClientWorkflowAdvancedSearchKey.Stage, []);
    }
  }

  // We are trimming indexes away from the passed IDs, based on business logic
  private trimIds(ids: number[]): number[] {
    return ids?.filter(i => !!i && i !== -1);
  }

  private validationCallBack() {
    this.setRequiredValidation();
  }

  // validation call-back used for changes to conditions & term / term to values
  private setRequiredValidation(): void {
    let hasInvalidAgeQuery: boolean = false;
    this.entry.additionalFields.forEach(o => {
      if (o.field?.type === SearchTypes.age &&
          (o.term || o.termTo) &&
          !AdvancedSearchFieldAgeComponent.isValidAgeState(o)) {
        hasInvalidAgeQuery = true;
      }
    });
    if (hasInvalidAgeQuery) {
      this.isRequiredValidationDisabled = false;
    } else {
      this.isRequiredValidationDisabled = this.entry.additionalFields.some(f => f.term);
    }
  }
}
