import { Component } from '@angular/core';
import { EntityTypeEnum } from '@app/models/enums';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-stop-payment-request-attachments-link-renderer',
  templateUrl: './stop-payment-request-attachments-link-renderer.component.html',
  styleUrls: ['./stop-payment-request-attachments-link-renderer.component.scss'],
})
export class StopPaymentRequstListAttachmentsLinkRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public readonly entityType = EntityTypeEnum;

  public refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
  }

  public onActionHandler(entityType: EntityTypeEnum): void {
    this.params.onAction(this.params, entityType);
  }

  get showLinkAttachmentsLink(): boolean {
    return (this.params.showLinkAttachmentsLink && this.params.showLinkAttachmentsLink(this.params)) || !this.params.showLinkAttachmentsLink;
  }

  get showDownloadLinkQSFAcctAttachmentsLink(): boolean {
    return (this.params.showDownloadLinkQSFAcctAttachmentsLink && this.params.showDownloadLinkQSFAcctAttachmentsLink(this.params)) || !this.params.showDownloadLinkQSFAcctAttachmentsLink;
  }
}
