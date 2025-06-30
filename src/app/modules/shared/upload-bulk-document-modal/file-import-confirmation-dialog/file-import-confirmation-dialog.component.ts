import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-file-import-confirmation-dialog',
  templateUrl: './file-import-confirmation-dialog.component.html',
  styleUrls: ['./file-import-confirmation-dialog.component.scss'],
})
export class FileImportConfirmationDialog {
  title: string;
  message: string;
  confirmed: boolean;
  buttonOkText: string;

  constructor(
    public bsModalRef: BsModalRef,
  ) { }

  respond(confirmed: boolean) {
    this.confirmed = confirmed;
    this.hideConfirmationDialog();
  }

  private hideConfirmationDialog(): void {
    this.bsModalRef.hide();
  }
}
