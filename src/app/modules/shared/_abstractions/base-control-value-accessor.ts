import { Input, Output, EventEmitter, Directive } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Directive()
export abstract class BaseControlValueAccessor implements ControlValueAccessor {
  @Input() public disabled: boolean = false;
  @Output() public change: EventEmitter<any> = new EventEmitter();

  protected onChangeCallback: any = () => {};
  protected onTouchedCallback: any = () => {};
  protected touched: boolean = false;

  abstract writeValue(val: any): void;

  public registerOnChange(onChangeCallback: any): void {
    this.onChangeCallback = onChangeCallback;
  }

  public registerOnTouched(onTouchedCallback: any): void {
    this.onTouchedCallback = onTouchedCallback;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected markAsTouched() {
    if (!this.touched) {
      this.onTouchedCallback();
      this.touched = true;
    }
  }
}
