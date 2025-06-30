import { Component } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import { ModalService } from '@app/services/modal.service';

@Component({
  selector: 'app-generate-user-login-report-modal',
  templateUrl: './generate-user-login-report-modal.component.html',
  styleUrls: ['./generate-user-login-report-modal.component.scss']
})
export class GenerateUserLoginReportModalComponent extends ValidationForm{

  title: string;
  generateHandler: (dateFrom: Date, dateTo: Date) => void = null;

  public todaysDate: Date = new Date();

  form: UntypedFormGroup;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  protected get isSaveDisabled(): boolean {
    return !this.form.valid;
  }

  constructor(
    public readonly modalService: ModalService,
    private dateValidator: DateValidator,
    private fb: UntypedFormBuilder
  ) {
    super();
    this.initializeDates();
  }

  private initializeDates(): void {
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setMonth(startDate.getMonth() - 5);

    const endDate = new Date();

    this.form = this.fb.group({
      startDate: [startDate, [Validators.required, this.startDateRangeValidator.bind(this), this.dateValidator.notFutureDate]],
      endDate: [endDate, [Validators.required, this.endDateRangeValidator.bind(this), this.dateValidator.notFutureDate]],
    });
  }

  public startDateRangeValidator(control: AbstractControl): {
    error: string;
  } | null {
    if(!this.form){
      return null;
    }

    let endDate: Date = this.form.value.endDate;
    endDate.setHours(23, 59, 59, 999);
    return this.dateValidator.sameOrBefore(control, endDate)
      ? { error: 'Start Date cannot be after End Date' }
      : null;
  }

  public endDateRangeValidator(control: AbstractControl): {
    error: string;
  } | null {
    if(!this.form){
      return null;
    }

    let startDate: Date = this.form.value.startDate;
    startDate.setHours(0, 0, 0, 0);
    return this.dateValidator.sameOrAfter(control, startDate)
      ? { error: 'End Date cannot be prior to Start Date' }
      : null;
  }

  public startDateChanged(): void {
    const date = this.form.value.startDate as Date;

    if (!date) {
      return;
    }

    this.form.patchValue({ startDate: date });
    this.form.get('endDate').updateValueAndValidity();
  }

  public endDateChanged(): void {
    const date = this.form.value.endDate as Date;

    if (!date) {
      return;
    }

    this.form.get('startDate').updateValueAndValidity();
  }

  onGenerate(): void {
    if (this.generateHandler) {
      const startDate = this.form.value.startDate as Date;
      const endDate = this.form.value.endDate as Date;

      this.generateHandler(startDate, endDate);
      this.modalService.hide();
    }
  }

  public onCancel(): void {
    this.modalService.hide();
  }
}
