import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IdValue } from '@app/models';
import { IntegrationTypes, IntegrationTypesValues } from '@app/models/enums/integration-types.enum';
import { RepeatType, ScheduleFrequency, ScheduleFrequencyValues } from '@app/models/enums/schedule-frequency.enum';
import { ReportSchedule } from '@app/models/projects/report-schedule';
import { Schedule } from '@app/models/projects/schedule';
import { WeekDays } from '@app/models/week-days';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { AppState } from '../../state';
import * as actions from '../../state/actions';
import * as selectors from '../../state/selectors';

export interface ReportScheduleFormValue {
  reportType?: IdValue
  active: boolean,
  scheduleFrequency: string, // weekly or monthly
  dayOfWeek?: IdValue | number,
  repeatType?: string, // DayOfMonth or WeekOfMonth
  dayOfMonth?: number,
  weekOfMonth?: number,
  endDate?: Date,
}
@Component({
  selector: 'app-project-schedule-report-form',
  templateUrl: './project-schedule-report-form.component.html',
  styleUrls: ['./project-schedule-report-form.component.scss']
})
export class ProjectScheduleReportFormComponent extends ValidationForm implements OnInit, OnDestroy {
  @Input() reportSchedule: ReportSchedule;

  private ngUnsubscribe$ = new Subject<void>();

  public readonly project$ = this.store.select(selectors.item);
  public projectId: number;
  public isEditingReportSchedule = false;

  public today: Date;
  public monthlyDays: IdValue[] = [];
  public monthlyWeeks: IdValue[] = [];
  public readonly businessDaysShort: IdValue[] = WeekDays.businessDaysShort;
  public readonly businessDays: IdValue[] = WeekDays.businessDays;
  public reportTypes = [
    { id: IntegrationTypes.DeficiencyReport, name: IntegrationTypesValues[IntegrationTypes.DeficiencyReport] },
    { id: IntegrationTypes.LienStatusReport, name: IntegrationTypesValues[IntegrationTypes.LienStatusReport] },
    { id: IntegrationTypes.MDWExport, name: IntegrationTypesValues[IntegrationTypes.MDWExport] },
  ];

  public scheduleForm: UntypedFormGroup;

  public get validationForm(): UntypedFormGroup {
    return this.scheduleForm;
  }

  constructor(
    private store: Store<AppState>,
    private fb: UntypedFormBuilder,
    private dateValidator: DateValidator,
  ) {
    super();
    this.initializeForm();
  }

  public ngOnInit(): void {
    this.project$.subscribe(project => {
      this.projectId = project.id;
    })

    this.isEditingReportSchedule = !!this.reportSchedule;
    if (this.isEditingReportSchedule) {
      this.scheduleForm.addControl('endDate', this.fb.control(null));
      this.scheduleForm.controls.endDate.setValidators([this.endDateValidator.bind(this)]);
      this.initEditFormSchedule();
    }

    this.subscribeToFormValueChange();
  }

  public endDateValidator(control: AbstractControl): {
    error: string;
  } | null {
    return !!this.scheduleForm
    && control.value
    && this.dateValidator.notPastDate(control)
      ? { error: 'You cannot set an ‘End Date’ in the past.  Update the ‘End Date’ for today or a future date.' }
      : null;
  }

  private subscribeToFormValueChange(): void {
    this.scheduleForm.get('scheduleFrequency').valueChanges.subscribe(() => this.updateValidators());
  }

  private initializeForm(): void {
    this.today = new Date();

    this.monthlyDays = this.generateIdNamePairs(1, 28);
    this.monthlyWeeks = this.generateIdNamePairs(1, 4);

    this.scheduleForm = this.fb.group({
      reportType: [this.reportTypes[0], [Validators.required]],
      active: [true],
      scheduleFrequency: [ScheduleFrequencyValues[ScheduleFrequency.Monthly], Validators.required],
      dayOfWeek: [this.businessDays[0].id, [Validators.required]],
      repeatType: [RepeatType.DayOfMonth, [Validators.required]],
      dayOfMonth: [1, [Validators.required, Validators.min(1), Validators.max(28)]],
      weekOfMonth: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
    });
  }

  private updateValidators(): void {
    const scheduleFrequency = this.scheduleForm.get('scheduleFrequency').value;

    if (scheduleFrequency === ScheduleFrequencyValues[ScheduleFrequency.Weekly]) {
      this.scheduleForm.patchValue({dayOfWeek: this.businessDaysShort[0]});
    }
    else {
      this.scheduleForm.patchValue({dayOfWeek: this.businessDays[0].id});
    }

    this.scheduleForm.get('scheduleFrequency').markAsDirty();
    this.scheduleForm.updateValueAndValidity();
  }

  get scheduleFrequency(): string {
    return this.scheduleForm.get('scheduleFrequency')?.value;
  }

  setScheduleFrequency(frequency: string): void {
    this.scheduleForm.get('scheduleFrequency')?.setValue(frequency);
  }

  private generateIdNamePairs(start: number, count: number): IdValue[] {
    return Array.from({ length: count }, (_, index) => {
      const value = start + index;
      return {
        id: value,
        name: value.toString(),
      };
    });
  }

  private initEditFormSchedule(): void {
    let scheduleObject: ReportScheduleFormValue;
    if (this.reportSchedule.schedule.frequency === ScheduleFrequency.Weekly) {
      scheduleObject = {
        active: this.reportSchedule.active,
        scheduleFrequency: ScheduleFrequencyValues[ScheduleFrequency.Weekly],
        dayOfWeek: this.businessDaysShort.find(d => d.id === this.reportSchedule.schedule.dayOfWeek),
      };
    } else {
      scheduleObject = {
        active: this.reportSchedule.active,
        scheduleFrequency: ScheduleFrequencyValues[ScheduleFrequency.Monthly],
        repeatType: this.reportSchedule.schedule.repeatType,
        ...(this.reportSchedule.schedule.repeatType === RepeatType.DayOfMonth
          ? { dayOfMonth: this.reportSchedule.schedule.dayOfMonth }
          : { weekOfMonth: this.reportSchedule.schedule.weekOfMonth, dayOfWeek: this.reportSchedule.schedule.dayOfWeek })
      }
    }
    scheduleObject.reportType = new IdValue(this.reportSchedule.integrationTypeId, this.reportSchedule.integrationTypeName);
    scheduleObject.endDate = this.reportSchedule.endDate;

    this.scheduleForm.patchValue(scheduleObject)
    this.scheduleForm.updateValueAndValidity();

  }

  public get isFormValid(): boolean {
    return this.scheduleForm.valid
    && this.scheduleForm.dirty;
  }

  public onSave(): void {
    this.validate();

    if (!this.scheduleForm.valid) {
      return;
    }

    if(this.reportSchedule) {
      this.updateReportSchedule();
    } else {
      this.createReportSchedule();
    }
  }

  private createReportSchedule(): void {
    const reportSchedule = this.constructReportSchedule();
    this.store.dispatch(actions.CreateReportSchedule({ reportSchedule }));
  }

  private updateReportSchedule(): void {
    const reportSchedule = this.constructReportSchedule();
    reportSchedule.integrationId = this.reportSchedule.integrationId;
    reportSchedule.endDate = this.scheduleForm.value.endDate;
    this.store.dispatch(actions.UpdateReportSchedule({ reportSchedule }));
  }

  private constructReportSchedule(): ReportSchedule {
    let scheduleObject: Schedule;
    if (this.scheduleFrequency === ScheduleFrequencyValues[ScheduleFrequency.Weekly]) {
      scheduleObject = {
        frequency: ScheduleFrequency.Weekly,
        dayOfWeek: this.scheduleForm.value.dayOfWeek.id,
      };
    } else {
      scheduleObject = {
        frequency: ScheduleFrequency.Monthly,
        repeatType: this.scheduleForm.value.repeatType,
        ...(this.scheduleForm.value.repeatType === RepeatType.DayOfMonth
          ? { dayOfMonth: this.scheduleForm.value.dayOfMonth }
          : { weekOfMonth: this.scheduleForm.value.weekOfMonth, dayOfWeek: this.scheduleForm.value.dayOfWeek })
      }
    }

    const reportSchedule: ReportSchedule = {
      projectId: this.projectId,
      active: this.scheduleForm.value.active,
      schedule: scheduleObject,
      integrationTypeId: this.scheduleForm.value.reportType.id,
      integrationName: `${this.scheduleForm.value.reportType.name} for Project ${this.projectId}`
    };

    return reportSchedule;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
