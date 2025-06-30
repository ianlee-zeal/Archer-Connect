import { Component } from '@angular/core';
import { GridActionsRendererComponent, IGridActionRendererParams } from '@app/entities/grid-actions-renderer-component';
import { TransferRequestSummary } from '@app/models'
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-transfer-request-items-list-actions-renderer',
  templateUrl: './transfer-request-items-list-actions-renderer.component.html',
  styleUrls: ['./transfer-request-items-list-actions-renderer.component.scss'],
})
export class TransferRequestItemsListActionsRendererComponent extends GridActionsRendererComponent<TransferRequestSummary> {
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
