import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-user-roles-list-actions-renderer',
  templateUrl: './user-roles-list-actions-renderer.component.html',
  styleUrls: ['./user-roles-list-actions-renderer.component.scss'],
})
export class UserRolesListActionsRendererComponent implements ICellRendererAngularComp {
  public params: any;

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  onViewPermissionsClick() {
    this.params.viewPermissionsHandler(this.params);
  }
}
