import { Component } from '@angular/core';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-representative-actions-render',
  templateUrl: './representative-actions-render.component.html',
  styleUrls: ['./representative-actions-render.component.scss'],
})
export class RepresentativeActionsRenderComponent implements ICellRendererAngularComp {
  public params;
  public clientOrgAccessEditPermission = PermissionService.create(PermissionTypeEnum.ClientOrgAccess, PermissionActionTypeEnum.Edit);

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  onEditClick() {
    this.params.editHandler(this.params);
  }

  onViewOrgDetailsClick() {
    this.params.viewOrgDetailsHandler(this.params);
  }
}
