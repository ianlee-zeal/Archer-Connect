import { Component, ViewEncapsulation, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'dialog-header',
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DialogHeaderComponent {
  @Output() public close = new EventEmitter<void>();
  @Input() public hideCloseButton: boolean = false;

  public onClose(): void {
    this.close.emit();
  }
}
