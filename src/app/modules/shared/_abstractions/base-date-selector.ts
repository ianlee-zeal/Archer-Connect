import { DoCheck, EventEmitter, Input, Directive, ViewChild, ElementRef } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment-timezone';

import { NgxMaskPipe } from 'ngx-mask';
import { KeyCodes } from '@app/models/enums/keycodes.enum';
import { DateFormatPipe } from '../_pipes';
import { CommonHelper } from '../../../helpers/common.helper';

const FORMAT = DateFormatPipe.format.toUpperCase();

enum MODES {
  default = 0,
  open = 1,
  disabled = 2,
}

export type DateFields = 'fromDate' | 'toDate';

@Directive()
export abstract class BaseDateSelector implements DoCheck {
  public readonly defaultMinDate = moment('1900-01-01');

  @ViewChild('dateInput') inputEl: ElementRef<HTMLInputElement>;
  @ViewChild('dpFromDate') inputElFromDate: ElementRef<HTMLInputElement>;
  @ViewChild('dpToDate') inputElToDate: ElementRef<HTMLInputElement>;

  public isDisabled: boolean;
  public placeholder: string = '';
  public isRange: boolean = false;
  public fromDate: NgbDate | null;
  public toDate: NgbDate | null;

  public abstract onDateTyped: EventEmitter<Date>;
  public abstract onChange: EventEmitter<string | Date>;

  protected _date: Date;

  public mode: number = MODES.default;

  private isOpen: boolean;
  private inputValue: string;

  constructor(
    protected mask: NgxMaskPipe,
    public formatter: NgbDateParserFormatter,
    protected calendar: NgbCalendar,
  ) {
  }

  public get fullwidth() {
    return this.isFullWidth;
  }

  @Input()
  public set fullwidth(value: any) {
    this.isFullWidth = CommonHelper.setShortBooleanProperty(value);
  }

  private isFullWidth: boolean;

  public get date(): Date {
    return this._date;
  }

  public set date(value) {
    this._date = value;
  }

  public ngDoCheck(): void {
    if (this.isDisabled) {
      this.mode = MODES.disabled;
    }
    else if (this.isOpen) {
      this.mode = MODES.open;
    }
    else {
      this.mode = MODES.default;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onChangeHandler(value: string | Date, _field: DateFields = null): void {
    const date = this.parseDate(value);

    if (date !== undefined && +this.date !== +date) {
      if (this.isInRange(date as Date)) {
        this.date = date;
      }

      if (window.event instanceof InputEvent) {
        this.onDateTyped.emit(date);
      }
    }

    this.onChange.emit(value);
  }

  protected parseDate(value: string | Date): Date {
    let date;

    if (typeof value === 'string') {
      const parsedDate = moment(value, DateFormatPipe.format, true);
      if (parsedDate.isValid()) {
        date = parsedDate.toDate();
      } else if (!parsedDate.isValid() && this.date) {
        date = null;
        const cursorPosition = this.inputEl.nativeElement.selectionStart;
        this.setValueIntoInputAfterDateReset(value, cursorPosition);
      }
    } else if (value === null || value instanceof Date) {
      date = value;
    }

    this.syncWithInput(value);
    return date;
  }

  public onDateSelect(date: NgbDate): void {
    const newDate = this.toDateFormat(date);

    if (+this.date !== +newDate && this.isInRange(newDate)) {
      this.date = newDate;
    }
  }

  public toDateFormat(date: NgbDate): Date {
    if (!date) {
      return null;
    }
    return new Date(date.year, date.month - 1, date.day, 12);
  }

  public onFocus(): void {
    this.placeholder = FORMAT;
  }

  public onBlur(): void {
    this.placeholder = '';
  }

  public onClosed(): void {
    this.isOpen = false;
  }

  public toggle(datepicker): void {
    if (this.isDisabled) {
      return;
    }

    datepicker.toggle();

    this.isOpen = !this.isOpen;
  }

  public onKeyUp(e: KeyboardEvent): void {
    if (!this.shouldIgnoreKeyEvent(e)) {
      let element = this.inputEl.nativeElement;

      if (this.isRange) {
        if (this.inputValue === this.inputElFromDate.nativeElement.value) {
          element = this.inputElFromDate.nativeElement;
        } else if (this.inputValue === this.inputElToDate.nativeElement.value) {
          element = this.inputElToDate.nativeElement;
        }
      }

      let formattedValue = this.inputValue;

      if (this.isNeedToFormat(this.inputValue)) {
        formattedValue = this.mask.transform(this.inputValue, '00/00/0000');
      }

      const parsedDate = moment(formattedValue, DateFormatPipe.format, true);
      if (parsedDate.isValid() && this.isInRange(parsedDate.toDate())) {
        this.date = parsedDate.toDate();
        this.date.setHours(12);
      }

      let cursorPosition = element.selectionStart;

      if (this.inputValue === undefined && formattedValue === undefined) {
        return;
      }

      if (this.inputValue.length < formattedValue.length && e.code !== KeyCodes.Backspace) {
        // slash has been inserted, move cursor 'after' the slash
        cursorPosition++;
      }

      element.value = formattedValue;
      // we use this to restore cursor position, after input was set
      // without this, cursor will jump to the end of the input - AC-3726
      element.selectionStart = cursorPosition;
      element.selectionEnd = cursorPosition;
    }
  }

  protected isNeedToFormat(input: string): boolean {
    return input && !input.match(/^[0-9]{0,2}\/[0-9]{0,2}\/[0-9]{0,4}$/);
  }

  private shouldIgnoreKeyEvent(e: KeyboardEvent): boolean {
    return e.code === KeyCodes.ArrowLeft
            || e.code === KeyCodes.ArrowRight
            || e.code === KeyCodes.ShiftLeft
            || e.code === KeyCodes.ShiftRight
            || e.code === KeyCodes.RCtrl
            || e.code === KeyCodes.LCtrl
            || (e.code === KeyCodes.KeyA && e.ctrlKey);
  }

  private setValueIntoInputAfterDateReset(value: string, cursorPosition: number): void {
    // when this.date is set to null, input element gets empty
    // here we restore the input value after it was cleared
    // onChangeHandler() should finish first
    setTimeout(() => {
      this.inputEl.nativeElement.value = value;
      this.inputEl.nativeElement.selectionStart = cursorPosition;
      this.inputEl.nativeElement.selectionEnd = cursorPosition;
    }, 0);
  }

  protected isInRange(date: Date): boolean {
    const isGreaterThanMin = moment(date).diff(this.defaultMinDate) > 0;
    return date === null || isGreaterThanMin;
  }

  private syncWithInput(value: string | Date): void {
    if (typeof value === 'string') {
      this.inputValue = value;
    } else if (value instanceof Date) {
      this.inputValue = moment(value, DateFormatPipe.format, true).format(DateFormatPipe.format);
    } else if (value === null) {
      this.inputValue = '';
    }
  }
}
