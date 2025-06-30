import { Component } from '@angular/core';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-project-contacts-list-action-panel-renderer',
  templateUrl: './project-contacts-list-action-panel-renderer.component.html',
  styleUrls: ['./project-contacts-list-action-panel-renderer.component.scss'],
})
export class ProjectContactsListActionPanelRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public contact: any;
  public editElectionFormPermission = PermissionService.create(PermissionTypeEnum.ProjectContacts, PermissionActionTypeEnum.Edit);

  refresh(): boolean {
    return true;
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.contact = params.data;
  }

  onViewContactHandler(): void {
    this.params.onViewContactHandler(this.params.node);
  }

  onEditContactHandler(): void {
    this.params.onEditContactHandler(this.params.node);
  }
}
