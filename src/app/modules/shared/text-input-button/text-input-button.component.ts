import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControlValueAccessor } from '@app/modules/shared/_abstractions/base-control-value-accessor';

@Component({
  selector: 'app-text-input-button',
  templateUrl: './text-input-button.component.html',
  styleUrls: ['./text-input-button.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: TextInputButtonComponent,
    },
  ],
})
export class TextInputButtonComponent extends BaseControlValueAccessor {
  @Input() public propertyNameForInputText: string = '';
  @Input() public id: string = '';
  @Input() public placeholder: string = '';
  @Input() public isClearable: boolean = false;
  @Output() public onClick: EventEmitter<any> = new EventEmitter();
  @Output() public clear: EventEmitter<any> = new EventEmitter();

  public displayedInputText: string = '';

  public writeValue(formValue: any): void {
    if (formValue) {
      this.displayedInputText = formValue[this.propertyNameForInputText] ?? '';
    } else {
      this.displayedInputText = '';
    }
  }

  public emittClick(): void {
    if (!this.disabled) {
      this.onClick.emit();
    }
  }

  public onClear(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.disabled) {
      this.markAsTouched();
      this.clear.emit();
    }
  }
}
