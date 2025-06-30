import { Component, Input, Output, EventEmitter, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, UntypedFormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

import { CommonHelper } from '@app/helpers/common.helper';
import { BaseControl } from '../_abstractions/base-control';

@Component({
  selector: 'app-hidable-form-control',
  templateUrl: './hidable-form-control.component.html',
  styleUrls: ['./hidable-form-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HidableFormControlComponent),
      multi: true,
    },
  ],
})
export class HidableFormControlComponent extends BaseControl implements OnChanges, ControlValueAccessor {
  @Input() public model: string; // value for readonly mode
  @Input() public isEditMode: boolean;
  @Input() public isFullValueLoaded: boolean;
  @Input() public isApplyAutoFocus: boolean = true;
  @Input() public mask: string;
  @Input() public readPermissions: string | string[];
  @Input() public editPermissions: string | string[];
  @Input() public formatFunction: (value: string, showFullValue: boolean) => string;
  @Input() formGroup: UntypedFormGroup;
  @Input() formControlName: string;
  @Output() public onViewFull: EventEmitter<void> = new EventEmitter<void>();

  public value: string;
  public isEditingInProgress: boolean = false;

  private onChangeFn = (_: string) => { };
  private onTouchedFn = () => { };

  public ngOnChanges(changes: SimpleChanges): void {
    const { model, isFullValueLoaded } = this;
    const modelChange = changes[CommonHelper.nameOf({ model })];
    const isFullValueLoadedChange = changes[CommonHelper.nameOf({ isFullValueLoaded })];

    if (modelChange) {
      this.value = model;
    }

    if (isFullValueLoadedChange && isFullValueLoadedChange.currentValue) {
      this.isEditingInProgress = true;
    }
  }

  public toggleViewMode(): void {
    if (!this.isEditingInProgress) {
      this.onViewFull.emit();

      if (this.isFullValueLoaded) {
        this.isEditingInProgress = true;
      }
    } else {
      this.isEditingInProgress = false;
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
