import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { DisbursementGroupRendererButton } from '../models/disbursement-group-renderer-button';

@Component({
  selector: 'app-disbursement-group-buttons-renderer',
  templateUrl: './disbursement-group-buttons-renderer.html',
  styleUrls: ['./disbursement-group-buttons-renderer.scss'],
})
export class DisbursementGroupButtonsRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public editButton: DisbursementGroupRendererButton;
  public goToButton: DisbursementGroupRendererButton;

  refresh(): boolean {
    return true;
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;

    this.editButton = this.params.editButton;
    if (this.editButton) {
      // If permission is undefined it means that permission exists according to the current implementation of PermissionDirective
      this.editButton.permission = this.params.editButton.permission;
      this.editButton.title = this.params.editButton.title || 'Edit';
    }

    this.goToButton = this.params.goToButton;
    if (this.goToButton) {
      this.goToButton.permission = this.params.goToButton.permission;
      this.goToButton.title = this.params.goToButton.title || '';
    }
  }

  editButtonHandler() {
    this.editButton.handler(this.params);
  }

  goToButtonHandler() {
    this.goToButton.handler(this.params);
  }
}
