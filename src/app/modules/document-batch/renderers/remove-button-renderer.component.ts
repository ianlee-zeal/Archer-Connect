import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-remove-button-renderer',
  templateUrl: './remove-button-renderer.component.html',
})
export class RemoveButtonCellRendererComponent implements ICellRendererAngularComp {
  public params: any;
  /* public editPermission = PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Edit); */

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  onRemoveClick() {
    this.params.removeHandler(this.params);
  }
}
