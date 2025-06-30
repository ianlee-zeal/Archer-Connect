import { Component } from '@angular/core';
import { GridActionsRendererComponent, IGridActionRendererParams } from '@app/entities/grid-actions-renderer-component';
import { PaymentRequestSummary } from '@app/models';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-disbursements-list-actions-renderer',
  templateUrl: './disbursements-list-actions-renderer.component.html',
  styleUrls: ['./disbursements-list-actions-renderer.component.scss'],
})
export class DisbursementsListActionsRendererComponent extends GridActionsRendererComponent<PaymentRequestSummary> {
  params: IGridActionRendererParams<PaymentRequestSummary> & { downloadAttachments: (data: PaymentRequestSummary) => {}, showLinkAttachmentsLink: Function };

  agInit(params: ICellRendererParams & { downloadAttachments: (data: PaymentRequestSummary) => {}, showLinkAttachmentsLink: Function }): void {
    super.agInit(params);
  }

  public onDownloadDocumentClick() {
    this.params.downloadAttachments(this.params.data);
  }

  get showLinkAttachmentsLink(): boolean {
    return (this.params.showLinkAttachmentsLink && this.params.showLinkAttachmentsLink(this.params)) || !this.params.showLinkAttachmentsLink;
  }
}
