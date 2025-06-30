import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-attachment-cell-renderer',
  templateUrl: './attachment-cell-renderer.component.html',
  styleUrls: ['./attachment-cell-renderer.component.scss'],
})
export class AttachmentCellRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public data: any;
  public count: number | undefined;

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
    this.data = this.params.node.data;

    if (this.data) {
      this.count = this.data.relatedDocuments && this.data.relatedDocuments.length;
    }
  }
}
