import { Component } from '@angular/core';
import { AuditBatchUploading } from '@app/models/enums';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-audit-batches-actions-renderer',
  templateUrl: './audit-batches-actions-renderer.component.html',
  styleUrls: ['./audit-batches-actions-renderer.component.scss'],
})
export class AuditBatchesActionsRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public failedState: boolean;

  // eslint-disable-next-line class-methods-use-this
  public refresh(): boolean {
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
    this.failedState = params.data.runStatusId === AuditBatchUploading.Failed;
  }

  public onViewClick(): void {
    this.params.viewHandler(this.params.data, true);
  }

  public onDownloadClick(): void {
    this.params.downloadHandler(this.params.data?.resultDocument?.id);
  }
}
