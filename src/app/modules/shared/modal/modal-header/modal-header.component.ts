import { Component, ViewEncapsulation, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'modal-header',
  templateUrl: './modal-header.component.html',
  styleUrls: ['./modal-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalHeaderComponent {
  @Output() public close = new EventEmitter<void>();

  @Input() public headerStyle: 'warning' | 'normal' = 'normal';
  @Input() public additionalInfo: string;

  public onClose(): void {
    this.close.emit();
  }
}
