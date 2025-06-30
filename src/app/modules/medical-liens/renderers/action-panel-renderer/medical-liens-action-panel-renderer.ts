import { Component } from '@angular/core';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-medical-liens-action-panel-renderer',
  templateUrl: './medical-liens-action-panel-renderer.html',
  styleUrls: ['./medical-liens-action-panel-renderer.scss'],
})
export class MedicalLiensActionPanelRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public openInLPMPermissions = PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.ViewInLPM);

  refresh(): boolean {
    return true;
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  onEdit() {
    this.params.onEditHandler(this.params.node.data);
  }
}
