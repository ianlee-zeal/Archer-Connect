import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-view-note-modal',
  templateUrl: './view-note-modal.component.html',
  styleUrls: ['./view-note-modal.component.scss'],
})
export class ViewNoteModalComponent {
  note: string;

  constructor(
    public bsModalRef: BsModalRef,
  ) { }

  public onClose() {
    this.bsModalRef.hide();
  }
}
