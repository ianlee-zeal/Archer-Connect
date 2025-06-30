import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-user-server-status-operation',
  templateUrl: './user-server-status-operation.component.html',
  styleUrls: ['./user-server-status-operation.component.scss'],
})
export class UserServerStatusOperationComponent implements OnInit {
  title: string;
  description: string;

  constructor(public userServerStatusOperationModal: BsModalRef) {}

  ngOnInit() {}
}
