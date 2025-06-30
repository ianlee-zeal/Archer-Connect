import { Component, Input, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, UntypedFormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

import { CommonHelper } from '@app/helpers/common.helper';
import { BaseControl } from '../_abstractions/base-control';

@Component({
  selector: 'app-warning-form-control',
  templateUrl: './warning-form-control.component.html',
  styleUrls: ['./warning-form-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WarningFormControlComponent),
      multi: true,
    },
  ],
})
export class WarningFormControlComponent extends BaseControl implements OnChanges, ControlValueAccessor {
  @Input() public model: string;
  @Input() public showWarning: boolean;
  @Input() public isEditMode: boolean;
  @Input() public isFullValueLoaded: boolean;
  @Input() public isApplyAutoFocus: boolean = false;
  @Input() public readPermissions: string | string[];
  @Input() public editPermissions: string | string[];
  @Input() formGroup: UntypedFormGroup;
  @Input() formControlName: string;

  public value: string;
  public isEditingInProgress: boolean = false;

  private onChangeFn = (_: string) => { };
  private onTouchedFn = () => { };

  public ngOnChanges(changes: SimpleChanges): void {
    const { model } = this;
    const modelChange = changes[CommonHelper.nameOf({ model })];

    if (modelChange) {
      this.value = model;
    }
  }

  public onChange(newValue: string): void {
    this.onChangeFn(newValue);
    this.onTouchedFn();
  }

  public writeValue(value: string): void {
    this.value = value;
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }
}
