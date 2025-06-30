import { Component } from '@angular/core';
import { IconHelper } from '@app/helpers';
import { PaymentTypeEnum } from '@app/models/enums';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-payment-queue-buttons-renderer',
  templateUrl: './payment-queue-buttons-renderer.html',
  styleUrls: ['./payment-queue-buttons-renderer.scss'],
})

export class PaymentQueueRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public isCreatedByThisUser = true;
  public paymentTypeEnum = PaymentTypeEnum;

  public readonly getSplitTypeIcon = IconHelper.getSplitTypeIcon;

  public get payeeName(): string {
    return this.params.data.payeeName;
  }

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }
}
