import { Component, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as actions from '../../state/actions';
import { ProjectScheduleReportFormComponent } from '../project-schedule-report-form/project-schedule-report-form.component';

@Component({
  selector: 'app-schedule-report-modal',
  templateUrl: './schedule-report-modal.component.html',
  styleUrls: ['./schedule-report-modal.component.scss'],
})
export class ScheduleReportModalComponent {

  @ViewChild(ProjectScheduleReportFormComponent) reportScheduleForm: ProjectScheduleReportFormComponent;

  public readonly awaitedActionTypes = [
    actions.CreateReportScheduleSuccess.type,
    actions.Error.type,
  ];
  constructor(
    public readonly modal: BsModalRef,
  ) { }

  onSave(): void {
    this.reportScheduleForm.onSave();
    this.modal.hide();
  }

  onCancel(): void {
    this.modal.hide();
  }
}
