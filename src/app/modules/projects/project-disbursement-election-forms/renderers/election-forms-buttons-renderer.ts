import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-election-forms-buttons-renderer',
  templateUrl: './election-forms-buttons-renderer.html',
  styleUrls: ['./election-forms-buttons-renderer.scss'],
})

export class ElectionFormsRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public isCreatedByThisUser = true;

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  editElectionFormHandler() {
    this.params.editElectionFormHandler(this.params.data.clientId);
  }
}
