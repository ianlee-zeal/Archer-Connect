import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { AppState } from '@app/state/index';
import { GetTaskCategories } from '@app/modules/shared/state/task-details-template/actions';
import { taskDetailsTemplateSelectors } from '@app/modules/shared/state/task-details-template/selectors';
import { SelectComponent } from '@app/modules/shared/select/select.component';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { TeamToUser, Team, User, TaskWidget, TeamStats, TeamStatsWidgetData, SummaryWidgetData, OverdueWidgetData, AgingWidgetData, UsersData } from '@app/models';
import { DataType, SearchTypeEnum } from '@app/models/enums';
import { widgetTypes, TaskWidgetColors } from '@app/helpers/task-widget-constants';
import { TaskManagementDashboardBase } from './task-management-dashboard-base/task-management-dashboard-base';
import { GetUserTeams, GetTeamUsers, GetTaskWidgets } from '../../state/actions';
import { currentUserTeams, currentTeamMembers, currentWidgetsData } from '../../state/selectors';

@Component({
  selector: 'app-task-management-dashboard',
  templateUrl: './task-management-dashboard.component.html',
  styleUrls: ['./task-management-dashboard.component.scss'],
})

export class TaskManagementDashboardComponent extends TaskManagementDashboardBase implements OnInit, OnDestroy {
  @ViewChild('teamsDDL') teamsDDLRef:SelectComponent;
  @ViewChild('teamMembersDDL') teamMemDDLRef:SelectComponent;
  @ViewChild('categoriesDDL') categoriesDDLRef:SelectComponent;

  private readonly categoriesRaw$:Observable<SelectOption[]> = this.appStore.select(taskDetailsTemplateSelectors.taskCategories);
  private readonly teamsRaw$:Observable<TeamToUser[]> = this.appStore.select(currentUserTeams);
  private readonly teamMembersRaw$:Observable<User[]> = this.appStore.select(currentTeamMembers);
  private readonly stagesRaw$ = this.appStore.select(taskDetailsTemplateSelectors.stages);
  private readonly prioritiesRaw$ = this.appStore.select(taskDetailsTemplateSelectors.priorities);

  private stages = [];
  private members = [];
  private priorities = [];
  public listFilter$ = [];

  public categories$:Observable<SelectOption[]>;
  public widgets$:Observable<Array<TaskWidget>> = this.appStore.select(currentWidgetsData);
  public teamMembers$:Observable<SelectOption[]>;
  public teams$:Observable<Team[]>;

  public selectedTeamId:number;
  public selectedMemberId:number;
  public selectedCategoryId:number;
  public selectedStageId:number;
  public selectedStatus:string;
  public selectedDaysOverdue:number | null;
  public selectedPriorityId:number;
  public selectedRangeOverdue: { filter: number, filterTo: number };
  public excludeCompleted: boolean;

  public teamStatsStagesData$;
  public teamStatsStatusesData$;
  public showTeamStats$;

  public stageSummaryData$;
  public stageSummaryTotalLabel;
  public showSummaryData$;

  public overdueData$;
  public showOverdueData$;

  public agingData$;
  public showAgingData$;

  public isManager = false;
  public defaultSelectPlaceholder = 'All';

  public taskStageslegend:TeamStats[];
  public taskStatusLegend:TeamStats[];
  public taskSummaryLegend:TeamStats[];

  private ngUnsubscribe$ = new Subject<void>();

  private overdueNeme = 'overdue';
  private onTimeName = 'ontime';
  private inTolerance = 'intolerance';
  private dueToday = 'duetoday';
  private late = 'late';
  private lessThan30 = '<30days';
  private from31to60 = '31-60days';
  private from61to90 = '61-90days';
  private totalName = 'total';

  private oldSelectedTeamId: number;

  constructor(private readonly appStore: Store<AppState>) {
    super();
    this.clearAll();

    this.taskStageslegend = this.tsStages.filter(item => !this.isTotal(item.name));
    this.taskStatusLegend = this.tsStatuses.filter(item => !this.isTotal(item.name));
    this.taskSummaryLegend = this.tsStageSummary;

    this.categoriesRaw$.subscribe(categoriesRaw => {
      this.onCategoriesLoaded(categoriesRaw);
    });

    this.teamsRaw$
      .pipe(
        filter(teamsRaw => !!teamsRaw),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(teamsRaw => {
        this.onTeamsLoaded(teamsRaw);
      });

    this.teamMembersRaw$.pipe(
      filter(teamMembersRaw => !!teamMembersRaw),
      distinctUntilChanged((a, b) => (JSON.stringify(a) === JSON.stringify(b))
        && this.selectedTeamId === this.oldSelectedTeamId),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(teamMembersRaw => {
      this.oldSelectedTeamId = this.selectedTeamId;
      this.onMembersLoaded(teamMembersRaw);
    });

    this.widgets$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(widgets => {
      this.onWidgetDataLoaded(widgets);
    });

    this.stagesRaw$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(stages => {
      this.stages = stages;
    });

    this.prioritiesRaw$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(priorities => {
      this.priorities = priorities;
    });
  }

  private clearCharts() {
    this.showTeamStats$ = false;
    this.showSummaryData$ = false;
    this.showOverdueData$ = false;
    this.showAgingData$ = false;

    this.teamStatsStagesData$ = null;
    this.teamStatsStatusesData$ = null;
    this.stageSummaryData$ = null;
    this.overdueData$ = null;
    this.agingData$ = null;
  }

  private clearSelections() {
    this.teamMemDDLRef?.handleClearSelection();
    this.selectedMemberId = undefined;
    this.categoriesDDLRef?.handleClearSelection();
    this.selectedCategoryId = undefined;
  }

  private clearFilters() {
    this.listFilter$ = [];

    this.selectedStageId = undefined;
    this.selectedStatus = undefined;
    this.selectedDaysOverdue = undefined;
    this.selectedPriorityId = undefined;
    this.selectedRangeOverdue = undefined;
    this.excludeCompleted = false;
  }

  private clearAll() {
    this.clearCharts();
    this.clearSelections();
    this.clearFilters();
  }

  public clearDashFilters = () => {
    this.clearAll();
    this.teamsDDLRef?.handleClearSelection();
    this.selectedTeamId = undefined;
    this.oldSelectedTeamId = undefined;
    this.onTeamChange(null);
  };

  ngOnInit(): void {
    this.appStore.dispatch(GetTaskCategories());
    this.appStore.dispatch(GetUserTeams());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.clearDashFilters();
  }

  private onCategoriesLoaded(categories:SelectOption[]) {
    if (categories?.length) {
      this.categories$ = of([...categories.map(tm => ({ id: tm.id, name: tm.name }))]);
    }
  }

  onCategoryChange(id: number) {
    this.selectedCategoryId = id;
    this.getWidgetData(this.selectedTeamId, this.selectedMemberId, this.selectedCategoryId);
    this.setListFilter();
  }

  private onTeamsLoaded(teams: TeamToUser[]) {
    if (teams?.length) {
      this.isManager = teams.some(t => t.isManager === true);
      const managedTeams = teams.filter(t => t.isManager === true);
      this.teams$ = of([...managedTeams.map(t => t.team)]);
      this.setListFilter();
      this.getTeamMembers();
    }
  }

  onTeamChange(id: number) {
    this.clearAll();
    this.selectedTeamId = id;
    this.getTeamMembers(this.selectedTeamId);
    this.setListFilter();
  }

  private onMembersLoaded(teamMembers: User[]) {
    if (teamMembers?.length) {
      this.members = [...teamMembers.map(tm => ({ id: tm.id, name: tm.displayName }))];
      this.teamMembers$ = of(this.members);
      this.getWidgetData(this.selectedTeamId, this.selectedMemberId, this.selectedCategoryId);
    }
  }

  onMemberChange(id: number) {
    this.selectedMemberId = id;
    this.getWidgetData(this.selectedTeamId, this.selectedMemberId, this.selectedCategoryId);
    this.setListFilter();
  }

  private setListFilter() {
    const filters = [];
    if (this.selectedTeamId) {
      filters.push({
        filter: this.selectedTeamId,
        filterType: DataType.Number,
        key: 'taskTeamId',
        type: SearchTypeEnum.Equals,
      });
    }
    if (this.selectedMemberId) {
      filters.push({
        filter: this.selectedMemberId,
        filterType: DataType.Number,
        key: 'assigneeUser.id',
        type: SearchTypeEnum.Equals,
      });
    }
    if (this.selectedCategoryId) {
      filters.push({
        filter: this.selectedCategoryId,
        filterType: DataType.Number,
        key: 'taskCategory.id',
        type: SearchTypeEnum.Equals,
      });
    }
    if (this.selectedStageId) {
      filters.push({
        filter: this.selectedStageId,
        filterType: DataType.Number,
        key: 'currentStageId',
        type: SearchTypeEnum.Equals,
      });
    }
    if (this.excludeCompleted) {
      filters.push({
        filter: this.stages.find(p => p.name === 'Completed').id,
        filterType: DataType.Number,
        key: 'currentStageId',
        type: SearchTypeEnum.NotEqual,
      });
    }
    if (this.selectedStatus) {
      filters.push({
        filter: this.selectedStatus,
        filterType: DataType.Text,
        key: 'inTolerance',
        type: SearchTypeEnum.Equals,
      });
    }
    if (this.selectedDaysOverdue === 0) {
      filters.push({
        filter: this.selectedDaysOverdue,
        filterType: DataType.Number,
        key: 'daysOverdue',
        type: SearchTypeEnum.Equals,
      });
    }
    if (this.selectedPriorityId) {
      filters.push({
        filter: this.selectedPriorityId,
        filterType: DataType.Number,
        key: 'taskPriorityId',
        type: SearchTypeEnum.Equals,
      });
    }
    if (this.selectedRangeOverdue) {
      filters.push({
        filter: this.selectedRangeOverdue.filter,
        filterTo: this.selectedRangeOverdue.filterTo,
        filterType: DataType.Number,
        key: 'daysOverdue',
        type: SearchTypeEnum.InRange,
      });
    }
    this.listFilter$ = filters;
  }

  private onWidgetDataLoaded(widgets: TaskWidget[]) {
    if (widgets?.length) {
      const parsedResponse = this.getTeamStatsDataFromResponse(widgets);

      this.showTeamStats$ = parsedResponse?.categories?.length
                            && parsedResponse?.stagesDataset?.length
                            && parsedResponse?.statusesDataset?.length;

      this.showSummaryData$ = parsedResponse?.stageSummaryDataset?.length;
      this.showOverdueData$ = parsedResponse?.overdueDataset?.length;
      this.showAgingData$ = parsedResponse?.agingDataset?.length;

      this.teamStatsStagesData$ = this.getBarChart(
        '',
        'Stages',
        this.getColorPalette(this.tsStages),
        parsedResponse.categories,
        parsedResponse.stagesDataset,
        { showLabels: true },
      );
      this.teamStatsStatusesData$ = this.getBarChart(
        '',
        'Statuses',
        this.getColorPalette(this.tsStatuses),
        parsedResponse.categories,
        parsedResponse.statusesDataset,
        { showLabels: true },
      );
      this.stageSummaryTotalLabel = parsedResponse.stageSummaryTotalLabel;
      this.stageSummaryData$ = this.getPieChart(
        '',
        '',
        this.getColorPalette(this.tsStageSummary),
        parsedResponse.stageSummaryDataset,
        { showLabels: false },
      );
      this.overdueData$ = parsedResponse.overdueDataset;
      this.agingData$ = parsedResponse.agingDataset;
    }
  }

  private getWidgetData(teamId?: number, memberId?:number, categoryId?: number) {
    const taskTeamId = !teamId ? null : teamId;
    const assigneeUserId = !memberId ? null : memberId;
    const taskCategoryId = !categoryId ? null : categoryId;
    this.appStore.dispatch(GetTaskWidgets(
      {
        taskWidgetRequest: {
          taskTeamId,
          assigneeUserId,
          taskCategoryId,
          widgetTypes: [widgetTypes.teamStats, widgetTypes.stageSummary, widgetTypes.overdueTasks, widgetTypes.aging],
        },
      },
    ));
  }

  private getTeamMembers(teamId?:number) {
    this.appStore.dispatch(GetTeamUsers({ teamId }));
  }

  public teamStatsPlotClick(e) {
    const memberName = e?.dataObj?.categoryLabel;
    const stageName = e?.dataObj?.datasetName;
    if (this.isTotal(this.prepareStr(stageName))) {
      return;
    }
    if (memberName && stageName) {
      const memberId = this.getMemberId(e, memberName);
      const stageId = this.stages.find(stage => stage.name === stageName)?.id;
      if (memberId && stageId) {
        this.clearAll();
        this.selectedStageId = stageId;
        this.onMemberChange(memberId);
      }
    }
  }

  private getMemberId(e: any, memberName: any) {
    let memberId;
    const categoriesObj = e.eventObj?.sender?.options?.dataSource?.categories;
    if (Array.isArray(categoriesObj) && categoriesObj.length) {
      const membersInChart = categoriesObj[0].category;
      memberId = membersInChart?.find(mem => mem.label === memberName)?.id;
    }
    if (!memberId) {
      memberId = this.members.find(mem => mem.name === memberName)?.id;
    }
    return memberId;
  }

  public teamStatusPlotClick(e) {
    const memberName = e?.dataObj?.categoryLabel;
    const statusName = e?.dataObj?.datasetName;
    if (this.isTotal(this.prepareStr(statusName))) {
      return;
    }
    if (memberName && statusName) {
      const memberId = this.getMemberId(e, memberName);
      const status = this.prepareStr(statusName) === this.onTimeName;
      if (memberId) {
        this.clearAll();
        this.selectedStatus = status.toString();
        this.onMemberChange(memberId);
      }
    }
  }

  public teamStatsStatusLabelClick(e) {
    const memberName = e?.dataObj?.text;
    if (memberName) {
      const memberId = this.getMemberId(e, memberName);
      if (memberId) {
        this.clearAll();
        this.onMemberChange(memberId);
      }
    }
  }

  public summaryDataplotClick(e) {
    const stageName = e?.dataObj?.categoryLabel;
    if (this.prepareStr(stageName).includes(this.inTolerance)) {
      this.setSummaryFilter(null, 'true', true);
    }
    if (this.prepareStr(stageName).includes(this.dueToday)) {
      this.setSummaryFilter(0, 'false', true);
    }
    if (this.prepareStr(stageName).includes(this.late)) {
      this.setSummaryFilter(null, 'false', true);
    }
  }

  private setSummaryFilter(selectedDaysOverdue:number | null, selectedStatus:string, excludeCompleted: boolean) {
    this.clearOverdueFilter();
    this.excludeCompleted = excludeCompleted;
    this.selectedDaysOverdue = selectedDaysOverdue;
    this.selectedStatus = selectedStatus;
    this.setListFilter();
  }

  private clearSummaryFilter() {
    this.excludeCompleted = false;
    this.selectedDaysOverdue = undefined;
    this.selectedStatus = undefined;
  }

  public agingRowClick = (priorityName:string) => {
    this.selectedPriorityId = this.priorities.find(priority => this.prepareStr(priority.name) === this.prepareStr(priorityName))?.id;
    this.setListFilter();
  };

  public overdueValueClick = (overdue:string) => {
    if (this.prepareStr(overdue) === this.lessThan30) {
      this.setOverdueFilter(0, 30, 'false');
    }
    if (this.prepareStr(overdue) === this.from31to60) {
      this.setOverdueFilter(31, 60, 'false');
    }
    if (this.prepareStr(overdue) === this.from61to90) {
      this.setOverdueFilter(61, 91, 'false');
    }
  };

  private setOverdueFilter(filter:number, filterTo:number, seletcedStatus:string) {
    this.clearSummaryFilter();
    this.selectedRangeOverdue = {
      filter,
      filterTo,
    };
    this.selectedStatus = seletcedStatus;
    this.setListFilter();
  }

  private clearOverdueFilter() {
    this.selectedRangeOverdue = undefined;
    this.selectedStatus = undefined;
  }

  private tsStages:TeamStats[] = [
    { id: 1, name: 'new', color: TaskWidgetColors.New, label: 'New', valueColor: TaskWidgetColors.Gray },
    { id: 2, name: 'open', color: TaskWidgetColors.OpenInTolerance, label: 'Open', valueColor: TaskWidgetColors.White },
    { id: 3, name: 'inprogress', color: TaskWidgetColors.InProgrees, label: 'In Progress', valueColor: TaskWidgetColors.Gray },
    { id: 4, name: 'pendingqc', color: TaskWidgetColors.PendingQC, label: 'Pending QC', valueColor: TaskWidgetColors.Gray },
    { id: 5, name: 'completed', color: TaskWidgetColors.Completed, label: 'Completed', valueColor: TaskWidgetColors.Gray },
    { id: 6, name: 'total', color: TaskWidgetColors.White, label: 'Total', valueColor: TaskWidgetColors.Gray },
  ];

  private tsStatuses:TeamStats[] = [
    { id: 1, name: 'ontime', color: TaskWidgetColors.OnTime, label: 'On Time', valueColor: TaskWidgetColors.Gray },
    { id: 2, name: 'overdue', color: TaskWidgetColors.OverdueLate, label: 'Overdue', valueColor: TaskWidgetColors.White },
    { id: 3, name: 'total', color: TaskWidgetColors.White, label: 'Total', valueColor: TaskWidgetColors.Gray },
  ];

  private tsStageSummary:TeamStats[] = [
    { id: 1, name: 'intolerance', color: TaskWidgetColors.OpenInTolerance, label: 'In Tolerance' },
    { id: 2, name: 'duetoday', color: TaskWidgetColors.InProgrees, label: 'Due Today' },
    { id: 3, name: 'late', color: TaskWidgetColors.OverdueLate, label: 'Late' },
  ];

  private tsOverdueTasks:TeamStats[] = [
    { id: 1, name: '<30days', color: TaskWidgetColors.InTolerance30, label: '< 30 days' },
    { id: 2, name: '31-60days', color: TaskWidgetColors.Late60, label: '31-60 days' },
    { id: 3, name: '61-90days', color: TaskWidgetColors.Late90, label: '61-90 days' },
  ];

  private tsAgingPriority:TeamStats[] = [
    { id: 1, name: 'count', color: TaskWidgetColors.LabelGrey, label: 'Num of Tasks' },
    { id: 2, name: 'inToleranceCount', color: TaskWidgetColors.InTolerance30, label: 'In Tolerance' },
    { id: 3, name: 'isLateCount', color: TaskWidgetColors.Late60, label: 'Late' },
    { id: 4, name: 'inTimeCount', color: TaskWidgetColors.OpenInTolerance, label: 'Timely Completed' },
  ];

  private isTotal(seriesName:string):boolean {
    return this.totalName === this.prepareStr(seriesName);
  }

  private getOnTimeUserTasksNumber(user:UsersData):number | null {
    let retVal = 0;
    if (user?.inTimeCount) {
      retVal += user.inTimeCount;
    }
    if (user?.inToleranceCount) {
      retVal += user.inToleranceCount;
    }
    if (retVal === 0) {
      return null;
    }
    return retVal;
  }

  private getTeamStatsDataFromResponse(response: TaskWidget[]) {
    const high = 'high';
    const medium = 'medium';
    const low = 'low';

    const stagesDataset = [];
    const statusesDataset = [];
    const category = [];

    const stageSummaryDataset = [];
    const stageSummaryTotalLabel = '';
    const overdueDataset = [];
    const agingDataset = [];

    const retVal = {
      categories: [{ category }],
      stagesDataset,
      statusesDataset,
      stageSummaryDataset,
      stageSummaryTotalLabel,
      overdueDataset,
      agingDataset,
    };

    if (!response || !response.length) { return retVal; }
    const teamsStats = response.find(r => this.prepareStr(r.taskWidgetName) === this.prepareStr(widgetTypes.teamStats));
    const stageSummary = response.find(r => this.prepareStr(r.taskWidgetName) === this.prepareStr(widgetTypes.stageSummary));
    const overdueTasks = response.find(r => this.prepareStr(r.taskWidgetName) === this.prepareStr(widgetTypes.overdueTasks));
    const aging = response.find(r => this.prepareStr(r.taskWidgetName) === this.prepareStr(widgetTypes.aging));

    const teamStatsData = teamsStats?.taskWidgetData as TeamStatsWidgetData;
    if (teamStatsData?.users) {
      stagesDataset.push(...this.tsStages.map(stg => ({ seriesname: stg.label, data: [] })));
      statusesDataset.push(...this.tsStatuses.map(sts => ({ seriesname: sts.label, data: [] })));
      const maxTotal = teamStatsData.users.reduce((total, user) => (user.count > total ? user.count : total), 0);

      teamStatsData.users.sort((a, b) => b.count - a.count).forEach(user => {
        category.push({ label: user.text.replace(/\s+/g, ' '), id: user.entityId ? user.entityId.toString() : '' });
        stagesDataset.forEach(stg => {
          const foundStg = user.stages.find(st => this.prepareStr(st.text) === this.prepareStr(stg.seriesname));
          const colors = this.getColor(this.tsStages, stg.seriesname);
          stg.data.push({
            value: this.getMinWidth(this.isTotal(stg.seriesname) ? user.count : foundStg?.count, maxTotal, this.isTotal(stg.seriesname)),
            displayValue: this.isTotal(stg.seriesname) ? user.count.toString() : foundStg?.count?.toString(),
            color: colors.barColor,
            valueFontColor: colors.valueColor,
          });
        });

        const overdue = statusesDataset.find(st => this.prepareStr(st.seriesname) === this.overdueNeme);
        if (overdue) {
          const colors = this.getColor(this.tsStatuses, this.overdueNeme);
          overdue.data.push({
            value: this.getMinWidth(user.isLateCount, maxTotal, false),
            displayValue: user.isLateCount?.toString(),
            color: colors.barColor,
            valueFontColor: colors.valueColor,
          });
        }

        const onTime = statusesDataset.find(st => this.prepareStr(st.seriesname) === this.onTimeName);
        if (onTime) {
          const colors = this.getColor(this.tsStatuses, this.onTimeName);
          const onTimeTasksNumber = this.getOnTimeUserTasksNumber(user);
          onTime.data.push({
            value: this.getMinWidth(onTimeTasksNumber, maxTotal, false),
            displayValue: onTimeTasksNumber?.toString(),
            color: colors.barColor,
            valueFontColor: colors.valueColor,
          });
        }

        const total = statusesDataset.find(st => this.prepareStr(st.seriesname) === this.totalName);
        if (total) {
          const colors = this.getColor(this.tsStatuses, this.totalName);
          total.data.push({
            value: this.getMinWidth(user.count, maxTotal, true),
            displayValue: user.count?.toString(),
            color: colors.barColor,
            valueFontColor: colors.valueColor,
          });
        }
      });
    }

    const summaryData = stageSummary?.taskWidgetData as SummaryWidgetData;
    retVal.stageSummaryTotalLabel = `Total: ${summaryData?.totalCount}`;
    if (summaryData?.stages) {
      stageSummaryDataset.push(...summaryData.stages.map(stage => (
        {
          label: `${stage.text} (${stage.count})`,
          value: stage.count,
          showLabel: stage.count > 0,
          color: this.getColor(this.tsStageSummary, stage.text).barColor,
          showValue: false,
        }
      )));
    }

    const overdueData = overdueTasks?.taskWidgetData as OverdueWidgetData;
    if (overdueData?.overdueGroups) {
      overdueDataset.push(...overdueData.overdueGroups.map(odt => (
        {
          title: odt.text,
          count: odt.count,
          percent: (odt.percent * 100)?.toFixed(2),
          color: this.getColor(this.tsOverdueTasks, odt.text).barColor,
        }
      )));
    }

    const agingData = aging?.taskWidgetData as AgingWidgetData;
    if (agingData?.priorities && agingData?.summary) {
      const totals = agingData.summary.find(i => this.prepareStr(i.text) === this.totalName);
      const highs = agingData.priorities.find(i => this.prepareStr(i.text) === high);
      const mediums = agingData.priorities.find(i => this.prepareStr(i.text) === medium);
      const lows = agingData.priorities.find(i => this.prepareStr(i.text) === low);

      if (totals && (highs || mediums || lows)) {
        agingDataset.push(...this.tsAgingPriority.map(tsa => ({
          title: tsa.label,
          total: totals[tsa.name],
          high: highs ? highs[tsa.name] : undefined,
          medium: mediums ? mediums[tsa.name] : undefined,
          low: lows ? lows[tsa.name] : undefined,
          color: tsa.color,
        })));
      }
    }

    return retVal;
  }
}
