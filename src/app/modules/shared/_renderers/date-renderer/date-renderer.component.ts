import { Component, ElementRef, ViewChild } from '@angular/core';
import { KeyCodes } from '@app/models/enums/keycodes.enum';
import { NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date';

import { ICellRendererParams } from 'ag-grid-community';
import moment from 'moment-timezone';
import { NgxMaskPipe } from 'ngx-mask';
import { DateFormatPipe } from '../../_pipes';
import { EditorRendererBase } from '../_base/editor-renderer-base';

export interface IDateRendererParams {
  value: Date;
  maxWidth: number;
}

const FORMAT = DateFormatPipe.format.toUpperCase();

enum MODES {
  default = 0,
  open = 1,
  disabled = 2,
}

/**
 * Component for rendering of date in grid.
 *
 * In readonly mode shows formatted text value.
 * In editable mode shows date input for value editing.
 *
 * @export
 * @class DateRendererComponent
 * @extends {EditorRendererBase<string>}
 */
@Component({
  selector: 'app-date-renderer',
  templateUrl: './date-renderer.component.html',
  styleUrls: ['./date-renderer.component.scss'],
})
export class DateRendererComponent extends EditorRendererBase<string> {
  constructor(
    private mask: NgxMaskPipe,
    public formatter: NgbDateParserFormatter,
    protected calendar: NgbCalendar,
  ) {
    super();
  }

  public onChangeHandler(value: string | Date): void {
    const date = this.parseDate(value);
    if (!!date && +this.date !== +date) {
      if (this.isInRange(date as Date)) {
        this.date = date;
        this.params.node.setDataValue(this.colId, value);
      }
    }
  }

  agInit(params: ICellRendererParams): void {
    super.agInit(params);
  }

  public minDate: Date;
  public maxDate: Date;
  public maxWidth: number = 110;
  public isDisabled: boolean;

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

  public get date(): Date {
    return this.pdate;
  }

  public set date(value) {
    if (value !== this.pdate) {
      this.pdate = value;
    }
  }

  public writeValue(value): void {
    this.pdate = value;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  public readonly defaultMinDate = moment('1900-01-01');

  @ViewChild('dateInput') inputEl: ElementRef<HTMLInputElement>;
  @ViewChild('dpFromDate') inputElFromDate: ElementRef<HTMLInputElement>;
  @ViewChild('dpToDate') inputElToDate: ElementRef<HTMLInputElement>;

  public placeholder: string = '';
  public fromDate: NgbDate | null;
  public toDate: NgbDate | null;

  protected pdate: Date;

  public mode: number = MODES.default;

  private isOpen: boolean;
  private inputValue: string;

  public ngDoCheck(): void {
    if (this.isDisabled) {
      this.mode = MODES.disabled;
    } else if (this.isOpen) {
      this.mode = MODES.open;
    } else {
      this.mode = MODES.default;
    }
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
      const element = this.inputEl.nativeElement;

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

  private isNeedToFormat(input: string): boolean {
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

  onChange() {}
}
