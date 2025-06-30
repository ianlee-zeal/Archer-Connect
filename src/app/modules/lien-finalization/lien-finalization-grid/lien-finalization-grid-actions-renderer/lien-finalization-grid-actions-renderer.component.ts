import { Component } from '@angular/core';
import { LienFinalizationTool } from '@app/models/enums';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-lien-finalization-grid-actions-renderer',
  templateUrl: './lien-finalization-grid-actions-renderer.component.html',
  styleUrls: ['./lien-finalization-grid-actions-renderer.component.scss'],
})
export class LienFinalizationGridActionsRendererComponent implements ICellRendererAngularComp {
  public params: any;

  public get startFinalizationButtonShow(): boolean {
    return this.params.data?.runStatusId === LienFinalizationTool.Pending
           && this.params.data.selectedLienCount;
  }

  public get downloadResultsButtonShow(): boolean {
    return this.params.data?.runStatusId === LienFinalizationTool.Accepted && this.params.data?.resultDocumentId;
  }

  public get cancelButtonShow(): boolean {
    return this.params.data?.runStatusId === LienFinalizationTool.Pending
           || this.params.data?.runStatusId === LienFinalizationTool.Review
           || this.params.data?.runStatusId === LienFinalizationTool.Accepted;
  }

  public get goToLPMButtonShow(): boolean {
    return this.params.data?.runStatusId === LienFinalizationTool.Accepted && this.params.data?.resultDocumentId;
  }

  // eslint-disable-next-line class-methods-use-this
  public refresh(): boolean {
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
  }

  public onDownloadLiensClick(): void {
    this.params.downloadHandler(this.params.data?.readyDocumentId);
  }

  public onDownloadResultsClick(): void {
    this.params.downloadHandler(this.params.data?.resultDocumentId);
  }

  public onStartFinalization(): void {
    this.params.startFinalization(this.params.data?.id);
  }

  public onCancelClick(): void {
    this.params.cancelBatch(this.params.data?.id);
  }

  public onOpenInLPM(): void {
    this.params.openInLPM(this.params.data?.id);
  }
}
