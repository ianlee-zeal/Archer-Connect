import { Component } from '@angular/core';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-global-communication-search-buttons-renderer',
  templateUrl: './global-communication-search-buttons-renderer.html',
  styleUrls: ['./global-communication-search-buttons-renderer.scss'],
})

export class GlobalCommunicationSearchButtonsRenderer implements ICellRendererAngularComp {
  public params: any;
  public globalCommunicationsEditPermission = PermissionService.create(PermissionTypeEnum.GlobalCommunicationSearch, PermissionActionTypeEnum.EditGlobalCommunication);

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  showGlobalCommunicationSearchHandler() {
    this.params.showGlobalCommunicationSearchHandler(this.params);
  }
}
