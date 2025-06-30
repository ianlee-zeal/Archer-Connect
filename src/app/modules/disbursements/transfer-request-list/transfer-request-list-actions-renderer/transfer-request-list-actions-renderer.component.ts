import { Component } from '@angular/core';
import { GridActionsRendererComponent, IGridActionRendererParams } from '@app/entities/grid-actions-renderer-component';
import { TransferRequestSummary } from '@app/models'
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-transfer-request-list-actions-renderer',
  templateUrl: './transfer-request-list-actions-renderer.component.html',
  styleUrls: ['./transfer-request-list-actions-renderer.component.scss'],
})
export class TransferRequestListActionsRendererComponent extends GridActionsRendererComponent<TransferRequestSummary> {
  params: IGridActionRendererParams<TransferRequestSummary> & { downloadAttachments: (data: TransferRequestSummary) => {}, showLinkAttachmentsLink: Function };

  agInit(params: ICellRendererParams): void {
    super.agInit(params);
  }

  public onDownloadDocumentClick() {
    this.params.downloadAttachments(this.params.data);
  }

  get showLinkAttachmentsLink(): boolean {
    return (this.params.showLinkAttachmentsLink && this.params.showLinkAttachmentsLink(this.params)) || !this.params.showLinkAttachmentsLink;
  }
}
