import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-bank-accounts-buttons-renderer',
  templateUrl: './bank-accounts-buttons-renderer.html',
  styleUrls: ['./bank-accounts-buttons-renderer.scss'],
})

export class BankAccountsButtonsRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public editBankAccountPermission = PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.Edit);
  public setPrimaryBankAccountPermission = PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.SetDefault);

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  constructor() { }

  onEditBankAccountHandler() {
    this.params.editBankAccountHandler(this.params);
  }

  onSetPrimaryBankAccountHandler() {
    if (this.params.data.isPrimary) {
      return;
    }
    this.params.setPrimaryBankAccountHandler(this.params);
  }
}
