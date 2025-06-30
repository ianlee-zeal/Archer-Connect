import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-variances-modal',
  templateUrl: './variances-modal.component.html',
  styleUrls: ['./variances-modal.component.scss'],
})
export class VariancesModalComponent {
  public claimantId: number;
  public disbursementGroupId?: number;

  constructor(
    private modal: BsModalRef,
  ) {}

  public onClose(): void {
    this.modal.hide();
  }
}
