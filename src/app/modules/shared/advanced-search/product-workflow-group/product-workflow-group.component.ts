/* eslint-disable no-param-reassign */
import { Component, Input, SimpleChanges } from '@angular/core';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';

import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchTypes } from '@app/models/advanced-search/search-types.hash';
import { EntityTypeEnum, ProductCategory, ProductWorkflowAdvancedSearchKey } from '@app/models/enums';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ProductCategoriesService, StagesService, ProductsService, PhasesService } from '@app/services';
import { AdvancedSearchFieldAgeComponent } from '../fields/age/age.component';
import { BaseSearchField } from '../fields/base-search-field';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-product-workflow-group',
  templateUrl: './product-workflow-group.component.html',
  styleUrls: ['./product-workflow-group.component.scss'],
})
export class ProductWorkflowGroupComponent extends BaseSearchField {
  @Input() public entry: SearchState;

  public isRequiredValidationDisabled: boolean;

  private productCategories: SelectOption[] = [];
  private subProductCategories: SelectOption[] = [];
  private products: SelectOption[] = [];
  private phases: SelectOption[] = [];
  private stages: SelectOption[] = [];
  private categoryIds: number[];

  constructor(
    private productCategoriesService: ProductCategoriesService,
    private stagesService: StagesService,
    private productsService: ProductsService,
    private phasesService: PhasesService,
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

  public getCallBack(input: string) {
    switch (input) {
      case ProductWorkflowAdvancedSearchKey.ProductCategory:
        return this.productCategoryDropdownCallback.bind(this);
      case ProductWorkflowAdvancedSearchKey.SubProductCategory:
        return this.subProductCategoryDropdownCallback.bind(this);
      case ProductWorkflowAdvancedSearchKey.Phase:
        return this.setPhaseDropdownCallBack.bind(this);
      case ProductWorkflowAdvancedSearchKey.Product:
      case ProductWorkflowAdvancedSearchKey.Stage:
      case ProductWorkflowAdvancedSearchKey.AgeOfPhase:
      case ProductWorkflowAdvancedSearchKey.AgeOfStage:
        return this.validationCallBack.bind(this);
      default:
        return null;
    }
  }

  private getConditionCallBack(input: string) {
    switch (input) {
      case ProductWorkflowAdvancedSearchKey.ProductCategory:
        return this.productCategoryConditionCallback.bind(this);
      case ProductWorkflowAdvancedSearchKey.SubProductCategory:
        return this.subProductCategoryConditionCallback.bind(this);
      case ProductWorkflowAdvancedSearchKey.Phase:
        return this.setPhaseConditionCallBack.bind(this);
      case ProductWorkflowAdvancedSearchKey.Product:
      case ProductWorkflowAdvancedSearchKey.Stage:
      case ProductWorkflowAdvancedSearchKey.AgeOfPhase:
      case ProductWorkflowAdvancedSearchKey.AgeOfStage:
        return this.validationCallBack.bind(this);
      default:
        return null;
    }
  }

  public getSelectOptionsProperty(input: string): SelectOption[] {
    switch (input) {
      case ProductWorkflowAdvancedSearchKey.ProductCategory:
        return this.productCategories;
      case ProductWorkflowAdvancedSearchKey.SubProductCategory:
        return this.subProductCategories;
      case ProductWorkflowAdvancedSearchKey.Phase:
        return this.phases;
      case ProductWorkflowAdvancedSearchKey.Stage:
        return this.stages;
      case ProductWorkflowAdvancedSearchKey.Product:
        return this.products;
      default:
        return null;
    }
  }

  // find and update entry and force change detection on it
  private updateOptions(key: string, options: SelectOption[]) {
    const i = this.entry.additionalFields.findIndex(o => o.field.key === key);

    this.entry.additionalFields[i].options = options;
    this.entry.additionalFields[i] = { ...this.entry.additionalFields[i] }; // force change detection
  }

  private initProductCategories() {
    this.productCategoriesService.getDropdownProductCategories()
      .subscribe(result => this.updateOptions(ProductWorkflowAdvancedSearchKey.ProductCategory, result));
  }

  private productCategoryDropdownCallback(value: any) {
    this.setProductCategoryResponse(value);
    this.setRequiredValidation();
  }

  private productCategoryConditionCallback(value: any) {
    if (!value) {
      this.setProductCategoryResponse(null);
    }

    this.setRequiredValidation();
  }

  private setProductCategoryResponse(value: any): void {
    const ids: number[] = this.trimIds([value]);

    this.categoryIds = ids;
    if (ids.length > 0) {
      this.productCategoriesService.getDropdownByProductCategories(ids)
        .subscribe(result => this.updateOptions(ProductWorkflowAdvancedSearchKey.SubProductCategory, result));
      this.productsService.getByProductCategoryIds(ids)
        .subscribe(result => this.updateOptions(ProductWorkflowAdvancedSearchKey.Product, result));
      this.phasesService.getByProductIds(ids)
        .subscribe(result => this.updateOptions(ProductWorkflowAdvancedSearchKey.Phase, result));
      this.stagesService.getDropdownByProductCategories(ids, EntityTypeEnum.LienProducts)
        .subscribe(result => this.updateOptions(ProductWorkflowAdvancedSearchKey.Stage, result));
    } else {
      this.updateOptions(ProductWorkflowAdvancedSearchKey.SubProductCategory, []);
      this.updateOptions(ProductWorkflowAdvancedSearchKey.Product, []);
      this.updateOptions(ProductWorkflowAdvancedSearchKey.Phase, []);
      this.updateOptions(ProductWorkflowAdvancedSearchKey.Stage, []);
    }
  }

  private subProductCategoryDropdownCallback(value: any) {
    this.setSubProductCategoryResponse(value);
    this.setRequiredValidation();
  }

  private subProductCategoryConditionCallback(value: any) {
    if (!value) {
      this.setSubProductCategoryResponse(null);
    }

    this.setRequiredValidation();
  }

  private setSubProductCategoryResponse(value: any): void {
    const ids: number[] = this.trimIds([value]);

    if (ids.length > 0) {
      this.productsService.getByProductCategoryIds(ids, this.categoryIds)
        .subscribe(result => this.updateOptions(ProductWorkflowAdvancedSearchKey.Product, result));
    } else {
      this.updateOptions(ProductWorkflowAdvancedSearchKey.Product, []);
    }
  }

  private setPhaseDropdownCallBack(value: any) {
    this.setPhaseResponse(value);
    this.setRequiredValidation();
  }

  private setPhaseConditionCallBack(value: any) {
    if (!value) {
      this.setPhaseResponse(null);
    }

    this.setRequiredValidation();
  }

  private setPhaseResponse(value: any): void {
    const ids: number[] = this.trimIds([value]);

    if (this.categoryIds.length === 1 && this.categoryIds[0] === ProductCategory.Bankruptcy) {
      this.searchBankruptcyStages(ids);
    } else if (ids.length > 0) {
      this.stagesService.getDropdownByPhaseIds(ids)
        .subscribe(result => this.updateOptions(ProductWorkflowAdvancedSearchKey.Stage, result));
    } else {
      this.updateOptions(ProductWorkflowAdvancedSearchKey.Stage, []);
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
      if (o.field?.type === SearchTypes.age
          && (o.term || o.termTo)
          && !AdvancedSearchFieldAgeComponent.isValidAgeState(o)) {
        hasInvalidAgeQuery = true;
      }
    });
    if (hasInvalidAgeQuery) {
      this.isRequiredValidationDisabled = false;
    } else {
      this.isRequiredValidationDisabled = this.entry.additionalFields.some(f => f.term);
    }
  }

  private searchBankruptcyStages(phaseIds: number[]): void {
    const searchOptions = AGGridHelper.getDefaultSearchRequest();
    searchOptions.endRow = -1;
    searchOptions.sortModel = [{ sort: 'asc', colId: 'name' }];
    searchOptions.filterModel.push(new FilterModel({
      filter: ProductCategory.Bankruptcy,
      filterType: FilterTypes.Number,
      type: 'equals',
      key: 'productCategoryId',
    }));

    if (phaseIds.length) {
      searchOptions.filterModel.push(new FilterModel({
        filter: phaseIds.join(','),
        filterType: FilterTypes.Number,
        type: 'contains',
        key: 'phaseId',
      }));
    }

    this.stagesService.search(searchOptions)
      .subscribe(result => this.updateOptions(ProductWorkflowAdvancedSearchKey.Stage, result.items));
  }
}
