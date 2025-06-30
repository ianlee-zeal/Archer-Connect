import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjectContactReference } from '@app/models/project-contact-reference';

@Component({
  selector: 'view-contact-modal',
  templateUrl: './view-contact-modal.component.html',
  styleUrls: ['./view-contact-modal.component.scss'],
})
export class ViewContactModalComponent {
  public contact: ProjectContactReference;

  constructor(
    public modal: BsModalRef,
  ) {
  }

  onCancel() {
    this.modal.hide();
  }
}
