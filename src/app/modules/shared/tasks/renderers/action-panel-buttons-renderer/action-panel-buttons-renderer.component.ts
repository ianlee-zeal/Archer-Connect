import { Component } from '@angular/core';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-action-panel-buttons-renderer',
  templateUrl: './action-panel-buttons-renderer.component.html',
})
export class ActionPanelButtonsRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public editPermission = PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Edit);

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  onEditClick() {
    this.params.editHandler(this.params);
  }
}
