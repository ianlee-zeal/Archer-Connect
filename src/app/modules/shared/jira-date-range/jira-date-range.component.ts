import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DateHelper } from '@app/helpers';
import { JiraDateRange } from '@app/models/jira/jira-date-range';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-jira-date-range',
  templateUrl: './jira-date-range.component.html',
  styleUrls: ['./jira-date-range.component.scss'],
})
export class JiraDateRangeComponent {
  @Input() dropdownLabel: string = '';
  @Output() onModelChange = new EventEmitter<JiraDateRange>();

  @ViewChild('dropdown', { static: false }) dropdown!: NgbDropdown;

  dropdownAutoClose = true;
  dropdownOpen = false;
  submitted = false;
  todaysDate: Date = new Date();
  dateRangeForm: UntypedFormGroup;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly dateValidator: DateValidator,
  ) {
    this.initializeForm();
  }

  ngAfterViewInit(): void {
    this.dropdown.openChange.subscribe(() => {
      this.dropdownOpen = this.dropdown.isOpen();
    });
  }

  private initializeForm(): void {
    this.dateRangeForm = this.fb.group({
      from: [null, [this.startDateRangeValidator.bind(this), this.dateValidator.notFutureDate]],
      to: [null, [this.endDateRangeValidator.bind(this), this.dateValidator.notFutureDate]],
    });
  }

  private startDateRangeValidator(control: AbstractControl): { error: string; } | null {
    if (!this.dateRangeForm || !this.dateRangeForm.controls.to.value) {
      return null;
    }

    const endDate: Date = this.dateRangeForm.controls.to.value;
    endDate.setHours(23, 59, 59, 999);
    const isInvalid = this.dateValidator.sameOrBefore(control, endDate);
    return isInvalid && isInvalid.invalidDateRange ? { error: 'Invalid Date Range' } : null;
  }

  private endDateRangeValidator(control: AbstractControl): { error: string; } | null {
    if (!this.dateRangeForm || !this.dateRangeForm.controls.from.value) {
      return null;
    }

    const startDate: Date = this.dateRangeForm.controls.from.value;
    startDate.setHours(0, 0, 0, 0);
    const isInvalid = this.dateValidator.sameOrAfter(control, startDate);
    return isInvalid && isInvalid.invalidDateRange ? { error: 'Invalid Date Range' } : null;
  }

  public onDatePickerClick(event): void {
    if (!event.target?.src.includes('close')) {
      this.dropdownAutoClose = false;
    }
  }

  public onDatePickerClose(): void {
    this.dropdownAutoClose = true;
  }

  public onDateChange(): void {
    this.dateRangeForm.controls.from.updateValueAndValidity();
    this.dateRangeForm.controls.to.updateValueAndValidity();
    this.dropdownAutoClose = true;
  }

  protected toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
    this.dropdownOpen ? this.dropdown.open() : this.dropdown.close();
  }

  protected get isEmpty(): boolean {
    return this.dateRangeForm.value.from === null && this.dateRangeForm.value.to === null;
  }

  protected get isUpdateDisabled(): boolean {
    return !this.dateRangeForm.valid;
  }

  protected update(): void {
    this.submitted = true;
    const dateRange: JiraDateRange = this.dateRangeToUTC(this.dateRangeForm.value);
    this.onModelChange.emit(dateRange);
    this.dropdownOpen = false;
    this.dropdown.close();
  }

  public clearDateRange(): void {
    this.dateRangeForm.reset(JiraDateRange.getDefaultDateRange());
    this.submitted = false;
    this.onModelChange.emit(JiraDateRange.getDefaultDateRange());
    this.dropdownOpen = false;
    this.dropdown.close();
  }

  private dateRangeToUTC(dateRange: JiraDateRange): JiraDateRange {
    let from = dateRange.from ? new Date(dateRange.from) : null;
    let to = dateRange.to ? new Date(dateRange.to) : null;

    if (from) {
      from.setHours(0, 0, 0, 0);
      from = new Date(DateHelper.toUtcDateString(from));
    }

    if (to) {
      to.setHours(23, 59, 59, 999);
      to = new Date(DateHelper.toUtcDateString(to));
    }
    return new JiraDateRange(from, to);
  }
}
