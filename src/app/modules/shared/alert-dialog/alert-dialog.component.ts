import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
})
export class AlertDialogComponent {
  title: string;
  message: string;
  buttonOkText: string;
  confirmed: boolean;

  constructor(
    public bsModalRef: BsModalRef,
  ) { }

  public ok(): void {
    this.confirmed = true;
    this.bsModalRef.hide();
  }
}
