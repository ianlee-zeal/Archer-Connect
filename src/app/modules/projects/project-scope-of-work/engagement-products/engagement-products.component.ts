import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { ProjectProductCategory, ProjectProduct } from '@app/models/scope-of-work';

import { ProjectScopeStatusEnum } from '@app/models/enums';

@Component({
  selector: 'app-engagement-products',
  templateUrl: './engagement-products.component.html',
  styleUrls: ['./engagement-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngagementProductsComponent implements OnInit {
  @Output() productChanged = new EventEmitter<{ productCategory: ProjectProductCategory, isValidData: boolean }>();
  @Input() productCategory: ProjectProductCategory;
  @Input() productCategoryIndex: number;
  @Input() readOnly: boolean;
  @Input() singleCheckedService: boolean = false;

  public form: UntypedFormGroup;

  public get products(): UntypedFormArray {
    return this.form.get('products') as UntypedFormArray;
  }

  public set products(value: UntypedFormArray) {
    this.form.controls.products = value;
  }

  public projectScopeStatus = ProjectScopeStatusEnum;

  constructor(
    private fb: UntypedFormBuilder,
  ) {}

  ngOnInit() {
    this.initProductCategory(this.productCategory);
  }

  public initProductCategory(category: ProjectProductCategory) {
    this.form = this.fb.group({ products: this.fb.array([]) });

    const formArray = this.form.get('products') as UntypedFormArray;

    if (category?.products) {
      const products = category?.products.map(
        product => this.createProductFormGroup(product, category));

      products?.forEach(productForm => formArray.push(productForm));
    }
  }

  private createProductFormGroup(product: ProjectProduct, category: ProjectProductCategory): UntypedFormGroup {
    const productForm = this.fb.group({
      id: product.id || 0,
      name: product.name,
      productCategoryShortName: category.productCategory.shortName,
      isChildProductCategory: !!category.productCategory.parentId,
      isChecked: product.isChecked,
      serviceId: product.serviceId,
      conditions: [product.conditions],
      isModified: false,
    });

    productForm.get('isChecked').setValidators(this.getProductIsCheckedValidator(productForm));

    return productForm;
  }

  private getProductIsCheckedValidator(productForm: UntypedFormGroup): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value && productForm.controls.conditions.value.find(c => c.isChecked)) {
        return { required: true };
      }

      return null;
    };
  }

  public onServiceCheckboxChange(isChecked: boolean, productId: number): void {
    const product = this.productCategory.products.find(x => x.id === productId);
    const productControl = this.products.controls.find(c => c.value.id === productId);

    if (product && product.isChecked !== isChecked) {
      productControl.patchValue({ isModified: !product.isModified });
      productControl.updateValueAndValidity();
    }

    this.uncheckAllExceptOne(isChecked, productId);
    this.emitChanges();
  }

  public onConditionChanged() {
    this.products.controls.forEach(productForm => (productForm as UntypedFormGroup)?.controls.isChecked.updateValueAndValidity());
    this.emitChanges();
  }

  private getIsDataValid() {
    return !this.products.controls.find(productForm => productForm.invalid);
  }

  private uncheckAllExceptOne(isChecked: boolean, productId: number): void {
    if (!this.singleCheckedService || !isChecked) {
      return;
    }

    const controlsToUncheck = this.products.controls.filter(c => c.value.isChecked && c.value.id !== productId);

    for (const control of controlsToUncheck) {
      const product = this.productCategory.products.find(p => p.id === control.value.id);

      if (product) {
        control.patchValue({ isChecked: false, isModified: !product.isModified });
        control.updateValueAndValidity();
      }
    }
  }

  private emitChanges(): void {
    const changedProductCategory = {
      ...this.productCategory, // previous values
      products: this.products.value, // actual values
    };

    this.productChanged.emit({ productCategory: ProjectProductCategory.toModel(changedProductCategory), isValidData: this.getIsDataValid() });
  }
}
