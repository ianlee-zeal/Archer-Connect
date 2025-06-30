import { Component } from '@angular/core';
import { QSFLienSweepStatus } from '@app/models/enums/qsf-lien-sweep-status.enum';
import { QSFSweepBatch } from '@app/models/qsf-sweep/qsf-sweep-batch';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'qsf-sweep-batch-actions-renderer',
  templateUrl: 'qsf-sweep-batch-actions-renderer.component.html',
  styleUrls: ['./qsf-sweep-batch-actions-renderer.component.scss'],
})
export class QsfSweepBatchActionsRendererComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams & { downloadFilesHandler: (data: QSFSweepBatch) => {}, openResultDetailsHandler: (data: QSFSweepBatch) => {} };
  public statuses = QSFLienSweepStatus;

  public refresh(): boolean {
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
  }

  public onDownloadFilesClick(): void {
    this.params.downloadFilesHandler(this.params.data);
  }

  public onViewResults(): void {
    this.params.openResultDetailsHandler(this.params.data);
  }
}
