import { Component } from '@angular/core';
import { PaymentTypeEnum } from '@app/models/enums';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'account-renderer-renderer',
  templateUrl: './account-renderer-component.html',
  styleUrls: ['./account-renderer-component.scss'],
})

export class AccountRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public isCreatedByThisUser = true;
  public paymentTypeEnum = PaymentTypeEnum;

  public get accountName(): string {
    return this.params.data.accountName;
  }

  public get isActiveAccount() : string {
    return this.params.data.hasActiveChartOfAccount;
  }

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }
}
