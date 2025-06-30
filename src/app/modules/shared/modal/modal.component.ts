import { Component, ViewEncapsulation, Output, EventEmitter, AfterContentInit, ContentChild } from '@angular/core';

import { ModalHeaderComponent } from './modal-header/modal-header.component';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements AfterContentInit {
  @ContentChild(ModalHeaderComponent) public header: ModalHeaderComponent;

  @Output() public close = new EventEmitter<void>();

  public ngAfterContentInit(): void {
    this.header.close = this.close;
  }
}
