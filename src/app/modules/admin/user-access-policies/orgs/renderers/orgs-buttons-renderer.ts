import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { PermissionTypeEnum, PermissionActionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-orgs-buttons-renderer',
  templateUrl: './orgs-buttons-renderer.html',
  styleUrls: ['./orgs-buttons-renderer.scss'],
})
export class OrgsButtonsRendererComponent implements ICellRendererAngularComp {
  public params: any;
  readonly editSubOrgPermissions = PermissionService.create(PermissionTypeEnum.SubOrganizations, PermissionActionTypeEnum.Edit);
  readonly editOrgPermissions = PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Edit);
  readonly switchOrgPermissions = PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.SwitchOrganization);

  get isSubOrg(): boolean {
    return !!this.params.data.parentOrgId;
  }

  agInit(params: any): void {
    this.params = params;
  }

  refresh(_: any): boolean {
    return true;
  }

  onEditOrgHandler() {
    this.params.editOrgHandler(this.params);
  }

  onEditSubOrgHandler() {
    this.params.editSubOrgHandler(this.params);
  }

  onSwitchOrgHandler() {
    this.params.switchOrgHandler(this.params);
  }
}
