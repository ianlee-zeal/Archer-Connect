import { Component, Input, forwardRef, HostBinding, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControl } from '../_abstractions/base-control';

@Component({
  selector: 'app-password',
  templateUrl: './password-control.component.html',
  styleUrls: ['./password-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordControlComponent),
      multi: true,
    }
  ]
})
export class PasswordControlComponent extends BaseControl implements ControlValueAccessor {
  @Input() public isPasswordValidAndConfirmed: boolean;

  @HostBinding('attr.id') public externalId = '';

  @Output() public onFocus = new EventEmitter();
  @Output() public onBlur = new EventEmitter();

  private _password: string;
  public isPasswordHidden: boolean = true;

  private onChangeFn = (_: string) => { };
  private onTouchedFn = () => { };

  public get password(): string {
    return this._password;
  }

  public set password(value: string) {
    this._password = value;

    this.onChangeFn(value);
    this.onTouchedFn();
  }

  public writeValue(value: string): void {
    this.password = value;
  }

  public registerOnChange(fn): void {
    this.onChangeFn = fn;
  }

  public registerOnTouched(fn): void {
    this.onTouchedFn = fn;
  }

  public onFocusFn(): void {
    this.onFocus.emit();
  }

  public onBlurFn(): void {
    this.onBlur.emit();
  }

  public onChangeHandler(value: string): void {
   this.password = value;
  }
}
