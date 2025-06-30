import { Component } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { ValidationService } from '@app/services';

@Component({
  selector: 'app-confirmation-with-note-dialog',
  templateUrl: './confirmation-with-note-dialog.component.html',
  styleUrls: ['./confirmation-with-note-dialog.component.scss'],
})
export class ConfirmationWithNoteDialogComponent extends ConfirmationDialogComponent {
  note: string;
  public form = new UntypedFormGroup({ note: new UntypedFormControl(null, [Validators.required, ValidationService.noEmptyStringInHTMLValidator]) });

  constructor(
    public bsModalRef: BsModalRef,
    bsModalService: BsModalService,
  ) {
    super(bsModalRef, bsModalService)
  }

  get isOkBtnDisabled(): boolean {
    return this.form.get('note').invalid;
  }

  respond(confirmed: boolean) {
    this.confirmed = confirmed;
    this.note = this.form.value.note;
    this.hideConfirmationDialog();
  }
}
