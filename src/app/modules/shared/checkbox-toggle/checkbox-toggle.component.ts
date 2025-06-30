import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-checkbox-toggle',
  templateUrl: './checkbox-toggle.component.html',
  styleUrls: ['./checkbox-toggle.component.scss'],
})
export class CheckboxToggleComponent {
  @Input() id: string;
  @Input() name: string;
  @Input() checked: boolean;
  @Input() disabled: boolean = false;
  @Input() showName: boolean = true;

  @Output() public checkState = new EventEmitter<boolean>();

  public onCheck(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.checkState.emit(isChecked);
  }
}
