import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EntityTypeEnum, GridId, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ActionBarService, PermissionService } from '@app/services';
import { DatePipe, WeekDay } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportSchedule } from '@app/models/projects/report-schedule';
import { ActionsSubject, Store } from '@ngrx/store';
import { filter, Subject, takeUntil } from 'rxjs';
import { AppState } from '../../state';
import * as actions from '../../state/actions';
import * as selectors from '../../state/selectors';
import { RepeatType, ScheduleFrequency } from '@app/models/enums/schedule-frequency.enum';
import { Schedule } from '@app/models/projects/schedule';
import { ofType } from '@ngrx/effects';
import { ProjectScheduleReportFormComponent } from '../project-schedule-report-form/project-schedule-report-form.component';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { SearchOptionsHelper } from '@app/helpers';
import { ContactsListReportingComponent } from '../../tabs/project-contacts-tab/contacts-list-reporting/contacts-list-reporting.component';
import { DocumentsListComponent } from '@app/modules/shared/documents-list/documents-list.component';

interface ReadSchedule {
  reportType?: string;
  active: string;
  frequency: string;
  schedule: string;
  endDate: string;
}
@Component({
  selector: 'app-project-reporting-details',
  templateUrl: './project-reporting-details.component.html',
  styleUrls: ['./project-reporting-details.component.scss']
})
export class ProjectReportingDetailsComponent implements OnInit, OnDestroy {
  @ViewChild(ProjectScheduleReportFormComponent) reportScheduleForm: ProjectScheduleReportFormComponent;
  @ViewChild(ContactsListReportingComponent) contactsListReportingComponent: ContactsListReportingComponent;
  @ViewChild(DocumentsListComponent) documentsListComponent: DocumentsListComponent;

  private ngUnsubscribe$ = new Subject<void>();

  public readonly project$ = this.store.select(selectors.item);
  public readonly reportSchedule$ = this.store.select(selectors.reportSchedule);
  readonly actionBar$ = this.store.select(selectors.actionBar);
  public projectId: number;
  public integrationId: number;
  public reportSchedule: ReportSchedule;
  public reportScheduleView: ReadSchedule;
  public canEdit = false;
  public isDeficiencyReport = false;

  public readonly gridId: GridId = GridId.IntegrationRecentReports;
  public readonly entityTypeId = EntityTypeEnum.IntegrationJob;
  public deficiencyReportFilter: FilterModel[] = [];
  public additionalPageItemsCountValues = [5];

  private actionBarActionHandlers: ActionHandlersMap = {
    cancel: {
      callback: () => this.cancelEditing(),
      hidden: () => !this.canEdit,
    },
    edit: {
      callback: () => this.startEditing(),
      hidden: () => this.canEdit,
      disabled: () => !this.reportSchedule,
      permissions: PermissionService.create(PermissionTypeEnum.ReportSettings, PermissionActionTypeEnum.Edit),
    },
    save: {
      callback: () => this.saveReportSchedule(),
      hidden: () => !this.canEdit,
      disabled: () => !this.reportScheduleForm?.isFormValid,
      awaitedActionTypes: [actions.UpdateReportScheduleSuccess.type, actions.Error.type],
    },
    back: { callback: () => this.navigateToList() },
  };

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private actionsSubj: ActionsSubject,
    private actionBarService: ActionBarService,
  ) { }

  public ngOnInit(): void {
    this.project$
      .pipe(filter(project => !!project))
      .subscribe(project => {
        this.projectId = project.id;
      })

    this.reportSchedule$.pipe(
      filter((s: ReportSchedule) => !!s),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((s: ReportSchedule) => {
      this.reportSchedule = s;
      this.setDeficiencyReportFilter();
      this.initViewScheduleDetails();
    });

    this.actionsSubj.pipe(
      ofType(actions.UpdateReportScheduleSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.cancelEditing();
    });

    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBarActionHandlers }));

    this.integrationId = Number(this.route.snapshot.params.id);
    this.store.dispatch(actions.GetReportSchedule({ id: this.integrationId }));
    this.updateClearFilterOptionInActionBar();
    this.actionBarClearAllFilterSubscription();
  }

  updateClearFilterOptionInActionBar() {
    this.actionBarService.initClearFiltersAction(
      this.actionBar$,
      [],
      true,
    ).then(actionBar => { this.store.dispatch(actions.UpdateActionBar({ actionBar: { ...actionBar } })); });
  }


  actionBarClearAllFilterSubscription() {
    this.actionBarService.clearAllFilters.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => {
      this.contactsListReportingComponent.clearGridFilters();
      this.documentsListComponent.clearGridFilters();
      this.updateClearFilterOptionInActionBar();
    });
  }

  private initViewScheduleDetails(): void {
    this.reportScheduleView = {
      active: this.reportSchedule.active ? 'Yes' : 'No',
      frequency: this.reportSchedule.schedule.frequency == ScheduleFrequency.Weekly ? 'Weekly' : 'Monthly',
      schedule: this.generateScheduleText(this.reportSchedule.schedule),
      endDate: this.datePipe.transform(this.reportSchedule.endDate, 'MM/dd/yyyy'),
      reportType: this.reportSchedule.integrationTypeName,
    };
  }

  private generateScheduleText(schedule: Schedule): string {
    if (schedule.frequency == ScheduleFrequency.Weekly) {
      return `On ${WeekDay[schedule.dayOfWeek]}`;
    }
    else if (schedule.repeatType == RepeatType.DayOfMonth) {
      return `Repeat ${schedule.dayOfMonth} Day of Every Month`;
    }
    else {
      return `On ${schedule.weekOfMonth} ${WeekDay[schedule.dayOfWeek]}`;
    }
  }

  private cancelEditing(): void {
    this.canEdit = false;
    this.store.dispatch(actions.GetReportSchedule({ id: this.reportSchedule.integrationId }));
  }

  private startEditing(): void {
    this.canEdit = true;
  }

  private saveReportSchedule(): void {
    this.reportScheduleForm.onSave();
  }

  private navigateToList(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private setDeficiencyReportFilter(): void {
    this.deficiencyReportFilter = [];
    if (this.reportSchedule.integrationTypeId === 7)
      this.deficiencyReportFilter.push(SearchOptionsHelper.getBooleanFilter('reportCc', 'boolean', 'equals', true));
    else if (this.reportSchedule.integrationTypeId === 8)
      this.deficiencyReportFilter.push(SearchOptionsHelper.getBooleanFilter('qsfReport', 'boolean', 'equals', true));
    else
      this.deficiencyReportFilter.push(SearchOptionsHelper.getBooleanFilter('deficiencyReportCc', 'boolean', 'equals', true));

    this.deficiencyReportFilter.push(SearchOptionsHelper.getNumberFilter('integrationId', 'number', 'equals', this.reportSchedule.integrationId));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ResetReportSchedule());
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
