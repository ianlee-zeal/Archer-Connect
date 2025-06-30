import { Component } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
  title: string;
  message: string;
  confirmed: boolean;
  buttonOkText: string;

  constructor(
    public bsModalRef: BsModalRef,
    private bsModalService: BsModalService,
  ) { }

  respond(confirmed: boolean) {
    this.confirmed = confirmed;
    this.hideConfirmationDialog();
  }

  protected hideConfirmationDialog(): void {
    /*
      This is meant to fix the issue with a nested confirmation dialog.

      Without this, when we open a confirmation dialog from within a modal window,
      and then close the confirmation dialog, the first modal window is stuck and cannot be scrolled.
    */
    const openModalsCount = this.bsModalService.getModalsCount();
    if (openModalsCount > 1) {
      const lastId = this.bsModalService.config.id ?? openModalsCount;
      this.bsModalService.hide(lastId);
    } else {
      this.bsModalRef.hide();
    }
  }
}
