import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

import { ProjectScopeStatusEnum } from '@app/models/enums';
import { ProjectProductCategory } from '@app/models/scope-of-work';

@Component({
  selector: 'app-product-category-status',
  templateUrl: './product-category-status.component.html',
  styleUrls: ['./product-category-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCategoryStatusComponent implements OnInit {
  @Output() statusChanged = new EventEmitter<{ productCategory: ProjectProductCategory, isValidData: boolean }>();
  @Input() productCategory: ProjectProductCategory;
  @Input() readOnly: boolean;

  public form: UntypedFormGroup;

  public projectScopeStatus = ProjectScopeStatusEnum;

  constructor(
    private fb: UntypedFormBuilder,
  ) {}

  ngOnInit() {
    this.initProductCategory(this.productCategory);
  }

  public initProductCategory(category: ProjectProductCategory): void {
    this.form = this.fb.group({
      statusId: [category.statusId],
      statusName: category.status.name,
      handoff: [category.handoff],
      engagedDate: [category.engagedDate],
    });

    this.form.valueChanges.subscribe(res => {
      if (res.statusId !== this.productCategory.status.id) {
        this.productCategory = {
          ...this.productCategory,
        };
      }
    });
  }

  public onChange(): void {
    const { handoff, engagedDate } = this.productCategory;
    const { statusId } = this.form.value;

    const changedProductCategory = {
      ...this.productCategory,
      statusId,
    };

    changedProductCategory.handoff = ProjectScopeStatusEnum.Yes === statusId
      ? handoff : null;

    changedProductCategory.engagedDate = ProjectScopeStatusEnum.Yes === statusId
      ? engagedDate || new Date() : null;

    this.statusChanged.emit({ productCategory: ProjectProductCategory.toModel(changedProductCategory), isValidData: true });
  }
}
