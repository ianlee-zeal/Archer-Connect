import { Component, Input, forwardRef, HostBinding, EventEmitter, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgModel } from '@angular/forms';

import { BaseDateSelector, DateFields } from '../_abstractions/base-date-selector';

@Component({
  selector: 'app-date-selector',
  templateUrl: './date-selector.component.html',
  styleUrls: ['./date-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateSelectorComponent),
      multi: true,
    },
  ],
})
export class DateSelectorComponent extends BaseDateSelector implements ControlValueAccessor {
  @HostBinding('attr.id') public externalId = '';
  @ViewChild('dateModel') dateModel: NgModel;

  // ngbDatepicker does not require a min/max, null will have no restrictions. To enforce a min or max, pass an object formatted as such { year: ####, month: ##, day: ## }
  @Input() public minDate: Date;
  @Input() public maxDate: Date;
  @Input() public maxWidth: number = 300;
  @Input() public showClearButton: boolean = false;
  @Input('disabled') public isDisabled: boolean;

  public get internalMinDate() {
    if (!this.minDate) {
      return { year: this.defaultMinDate.year(), month: this.defaultMinDate.month() + 1, day: this.defaultMinDate.day() };
    }

    return { year: this.minDate.getFullYear(), month: this.minDate.getMonth() + 1, day: this.minDate.getDate() };
  }

  public get internalMaxDate() {
    if (!this.maxDate) {
      return null;
    }

    return { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() };
  }

  @Output() public onDateTyped = new EventEmitter<Date>();
  @Output() public onChange = new EventEmitter<any>();
  @Output() public onClose = new EventEmitter<any>();
  @Output() public onClear = new EventEmitter<any>();
  @Output() public isValid = new EventEmitter<boolean>();

  @Input()
  public set id(id: string) {
    this._id = id;
    this.externalId = null;
  }

  private _customPlaceholder: string = null;
  @Input()
  public set customPlaceholder(value: string) {
    this._customPlaceholder = value;
    value ? this.placeholder = value : null;
  }

  public get id(): string {
    return this._id;
  }

  private _id: string;

  private onChangeFn = _ => { };
  private onTouchedFn = () => { };

  public get date(): Date {
    return this._date;
  }

  public set date(value) {
    if (value !== this._date) {
      this._date = value;

      this.onChangeFn(value);
    }

    this.onTouchedFn();
  }

  public writeValue(value): void {
    this._date = value;
  }

  public registerOnChange(fn): void {
    this.onChangeFn = fn;
  }

  public registerOnTouched(fn): void {
    this.onTouchedFn = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  public onFocus() {
    super.onFocus();
    if (this._customPlaceholder) {
      this.placeholder = this._customPlaceholder;
    }
  }

  public onBlur(): void {
    super.onBlur();
    this.isValid.emit(this.dateModel.valid || this.dateModel.pristine);
    if (this._customPlaceholder) {
      this.placeholder = this._customPlaceholder;
    }
    this.onClose.emit();
  }

  public onClosed(): void {
    super.onClosed();
    this.onClose.emit();
  }

  onChangeHandler(value: string | Date, _field: DateFields = null) {
    this.dateModel.valid ? this.isValid.emit(true) : null;
    super.onChangeHandler(value, _field);
  }

  public clear(): void {
    this.date = null;
    this.onClear.emit();
  }

  public shouldShowClearButton(): boolean {
    return this.showClearButton && this.date !== null;
  }
}
