import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProjectProductCategory } from '@app/models/scope-of-work';
import { IdValue } from '@app/models/idValue';

@Component({
  selector: 'app-project-scope-status',
  templateUrl: 'project-scope-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectScopeStatusComponent implements OnInit {
  @Input() canEdit: boolean;
  @Input() statusOptions: IdValue[];
  @Input() productCategory: ProjectProductCategory;
  @Output() onChange = new EventEmitter();

  status: IdValue;

  ngOnInit(): void {
    this.status = this.productCategory.projectScopeStatus;
  }

  public onChangeStatus(value: IdValue): void {
    const changedProductCategory = {
      ...this.productCategory,
      projectScopeStatus: value,
    };

    this.status = value;
    this.onChange.emit({ productCategory: ProjectProductCategory.toModel(changedProductCategory), isValidData: true });
  }
}
