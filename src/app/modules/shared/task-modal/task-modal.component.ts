import { Component, ViewChild } from '@angular/core';
import { ModalDirective, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.scss'],
})
export class TaskModalComponent {
  @ViewChild('task_modal') error_modal: ModalDirective;

  constructor(
    public bsModalRef: BsModalRef,
  ) { }
}
