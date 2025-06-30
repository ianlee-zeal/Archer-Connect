import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

import { CommonHelper } from '@app/helpers/common.helper';
import { AGGridHelper } from '../../../../helpers/ag-grid.helper';

import { BaseDateSelector, DateFields } from '../../_abstractions/base-date-selector';

@Component({
  selector: 'app-date-selector-template-driven',
  templateUrl: './date-selector-template-driven.component.html',
  styleUrls: ['./date-selector-template-driven.component.scss'],
})
export class DateSelectorTemplateDrivenComponent extends BaseDateSelector implements OnChanges {
  @Input() public model: Date;
  @Input() public isAutofocused: boolean;
  @Input() public isRange: boolean;

  @Output() public onChange = new EventEmitter<string | Date>();
  @Output() public onDateTyped = new EventEmitter<Date>();
  @Output() public onDateSelected = new EventEmitter<Date | Date[]>();

  public fromDateModel: Date;
  public toDateModel: Date;

  hoveredDate: NgbDate | null = null;

  public tabToNextInput: Function = AGGridHelper.tabToNextInput;

  public ngOnChanges(changes: SimpleChanges): void {
    const { model } = this;
    const modelChanges = changes[CommonHelper.nameOf({ model })];

    if (modelChanges && this.date !== modelChanges.currentValue) {
      this.date = this.model;
    }
  }

  public onChangeHandler(value: string | Date, field: DateFields = null): void {
    if (!this.isRange || !field) {
      super.onChangeHandler(value);
    } else if (field && window.event instanceof InputEvent) {
      let date = this.parseDate(value);
      let formattedValue;
      if (!date && typeof value === 'string' && value?.length > 0) {
        formattedValue = value.replace(/[^0-9//]/g, ''); // remove invalid symbols
        if (this.isNeedToFormat(formattedValue)) {
          formattedValue = this.mask.transform(formattedValue, '00/00/0000');
        }
        const element = (field === 'fromDate') ? this.inputElFromDate.nativeElement : this.inputElToDate.nativeElement;
        element.value = formattedValue;
        date = this.parseDate(formattedValue);
      }

      if (date) {
        const ngbDate = new NgbDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
        this[field] = ngbDate;
        this.onDateSelected.emit([this.toDateFormat(this.fromDate), this.toDateFormat(this.toDate)]);
      }
    }
  }

  public onDateSelect(date: NgbDate): void {
    super.onDateSelect(date);
    if (this.isRange) {
      if (!this.fromDate && !this.toDate) {
        this.fromDate = date;
      } else if (this.fromDate && !this.toDate && date && (date.after(this.fromDate) || date.equals(this.fromDate))) {
        this.toDate = date;
      } else {
        this.toDate = null;
        this.fromDate = date;
      }

      if (this.fromDate && !this.toDate) {
        this.onDateSelected.emit(this.date);
      }

      if (this.fromDate && this.toDate) {
        this.onDateSelected.emit([this.toDateFormat(this.fromDate), this.toDateFormat(this.toDate)]);
      }
    } else {
      this.onDateSelected.emit(this.date);
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isDateRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
}
