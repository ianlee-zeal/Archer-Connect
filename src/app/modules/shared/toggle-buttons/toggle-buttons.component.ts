import { Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IdValue } from '@app/models';
import { BaseControlValueAccessor } from '../_abstractions/base-control-value-accessor';

@Component({
  selector: 'app-toggle-buttons',
  templateUrl: './toggle-buttons.component.html',
  styleUrls: ['./toggle-buttons.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: ToggleButtonsComponent,
    },
  ],
})
export class ToggleButtonsComponent extends BaseControlValueAccessor {
  @Input() canUntoggle: boolean = false;
  @Input() options: IdValue[] = [];
  @Input() selectedOption: IdValue;

  public writeValue(option: IdValue): void {
    this.selectedOption = option;
  }

  public onOptionClick(option: IdValue): void {
    if (this.disabled) {
      return;
    }

    this.markAsTouched();

    if (this.canUntoggle && this.selectedOption && this.selectedOption.id === option.id) {
      this.selectedOption = null;
    } else {
      this.selectedOption = option;
    }

    this.onChangeCallback(this.selectedOption);
    this.change.emit(this.selectedOption);
  }
}
