import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-lien-deficiencies-grid-actions-renderer',
  templateUrl: './lien-deficiencies-grid-actions-renderer.component.html',
  styleUrls: ['./lien-deficiencies-grid-actions-renderer.component.scss'],
})
export class LienDeficienciesGridActionsRendererComponent implements ICellRendererAngularComp {
  public params: any;

  // eslint-disable-next-line class-methods-use-this
  public refresh(): boolean {
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
  }

  public onDownloadClick(): void {
    this.params.downloadHandler(this.params.data?.id);
  }
}
