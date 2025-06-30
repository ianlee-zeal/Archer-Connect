import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-document-intake-buttons-renderer',
  templateUrl: './document-intake-buttons-renderer.html',
  styleUrls: ['./document-intake-buttons-renderer.scss'],
})

export class DocumentIntakeRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public isCreatedByThisUser = true;

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  viewDocumentIntakeHandler() {
    this.params.viewDocumentIntakeHandler(this.params.data.projectId);
  }
}
