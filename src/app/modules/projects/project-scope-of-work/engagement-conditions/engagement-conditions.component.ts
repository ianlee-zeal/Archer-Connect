import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray } from '@angular/forms';

import { ProjectScopeStatusEnum } from '@app/models/enums';
import { ProjectProduct, ProjectProductCondition } from '@app/models/scope-of-work';

@Component({
  selector: 'app-engagement-conditions',
  templateUrl: './engagement-conditions.component.html',
  styleUrls: ['./engagement-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EngagementConditionsComponent implements OnInit {
  @Output() conditionChanged = new EventEmitter();
  @Input() product: ProjectProduct;
  @Input() isLastProduct: boolean;
  @Input() readOnly: boolean;

  public form: UntypedFormGroup;

  public projectScopeStatus = ProjectScopeStatusEnum;

  public get conditions(): UntypedFormArray {
    return this.form.get('conditions') as UntypedFormArray;
  }

  public set conditions(value: UntypedFormArray) {
    this.form.controls.conditions = value;
  }

  constructor(
    private fb: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.initProduct(this.product);
  }

  public initProduct(product: ProjectProduct) {
    this.form = this.fb.group({
      conditions: this.fb.array([]),
    });

    const formArray = this.form.get('conditions') as UntypedFormArray;

    if (product.conditions) {
      const conditions = product.conditions.map(
        condition => this.createConditionFormGroup(condition));
        conditions?.forEach(ctrl => formArray.push(ctrl));
    }
  }

  private createConditionFormGroup(condition: ProjectProductCondition): UntypedFormGroup {
    const conditionForm = this.fb.group({
      caseProductId: condition.caseProductId,
      productConditionId: condition.productConditionId,
      isChecked: condition.isChecked,
      name: condition.name
    });

    return conditionForm;
  }

  public onChange(): void {
    this.conditions.value.forEach(
      item => {
        if (typeof item.isChecked ==='boolean') {
          var condition = this.product.conditions.find(x => x.productConditionId === item.productConditionId);
          if (condition && condition.isChecked !== item.isChecked) {
            var isModified = !condition.isModified;
            condition.isModified = isModified;
            item.isModified = isModified;
            condition.isChecked = item.isChecked;
          }
        }
      }
    );

    this.conditionChanged.emit();
  }
}
