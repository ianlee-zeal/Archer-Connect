import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-saved-searches-buttons-renderer',
  templateUrl: './saved-searches-buttons-renderer.html',
  styleUrls: ['./saved-searches-buttons-renderer.scss'],
})

export class SavedSearchesRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public isCreatedByThisUser = true;

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.isCreatedByThisUser = params.data.createdBy.id === params.data.currentUserId;
    this.params = params;
  }

  editSavedSearchHandler() {
    this.params.editSavedSearchHandler(this.params);
  }

  goToSavedSearchHandler() {
    this.params.goToSavedSearchHandler(this.params);
  }

  deleteSavedSearchHandler() {
    this.params.deleteSavedSearchHandler(this.params);
  }
}
