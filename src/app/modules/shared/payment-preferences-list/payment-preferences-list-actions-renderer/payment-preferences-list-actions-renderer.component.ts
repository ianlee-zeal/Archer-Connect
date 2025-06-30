import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-payment-preferences-list-actions-renderer',
  templateUrl: './payment-preferences-list-actions-renderer.component.html',
  styleUrls: ['./payment-preferences-list-actions-renderer.component.scss']
})
export class PaymentPreferencesListActionsRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public editPaymentPreferencesPermission = PermissionService.create(PermissionTypeEnum.OrganizationPaymentInstruction, PermissionActionTypeEnum.Edit);

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  onEditPaymentPreferencesHandler() {
    this.params.editPaymentPreferencesHandler(this.params);
  }
}
