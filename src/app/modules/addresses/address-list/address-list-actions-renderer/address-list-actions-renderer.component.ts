import { Component } from '@angular/core';
import { Policy } from '@app/modules/auth/policy';
import { PermissionService } from '@app/services';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { PermissionActionTypeEnum, EntityTypeEnum } from '@app/models/enums';

@Component({
  selector: 'app-address-list-actions-renderer',
  templateUrl: './address-list-actions-renderer.component.html',
  styleUrls: ['./address-list-actions-renderer.component.scss'],
})
export class AddressListActionsRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public addressesEditPermission: string;
  public entityType: EntityTypeEnum;

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  agInit(params: any): void {
    this.params = params;
    this.entityType = this.params.data.entityType;
    this.addressesEditPermission = PermissionService.create(Policy.getAddresses(this.entityType), PermissionActionTypeEnum.Edit);
  }

  onViewAddressClick() {
    this.params.viewAddressHandler(this.params);
  }

  onEditAddressClick() {
    this.params.editAddressHandler(this.params);
  }

  onSetPrimaryAddressClick() {
    if (this.params.data.isPrimary) {
      return;
    }
    this.params.setPrimaryAddressHandler(this.params);
  }
}
