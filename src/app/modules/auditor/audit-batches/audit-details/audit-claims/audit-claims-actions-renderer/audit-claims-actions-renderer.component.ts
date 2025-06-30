import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-audit-claims-actions-renderer',
  templateUrl: './audit-claims-actions-renderer.component.html',
  styleUrls: ['./audit-claims-actions-renderer.component.scss'],
})
export class AuditClaimsActionsRendererComponent implements ICellRendererAngularComp {
  public params: any;

  // eslint-disable-next-line class-methods-use-this
  public refresh(): boolean {
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
  }

  public onDownloadClick(): void {
    this.params.downloadHandler(this.params.data);
  }
}
