/// NOTES
/// legend https://www.fusioncharts.com/features/label-management
/// events https://www.fusioncharts.com/dev/api/fusioncharts/fusioncharts-events#event-labelClick
/// subcaptions and titles https://www.fusioncharts.com/features/label-management#captions-and-subcaptions
///

import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ViewRef, OnDestroy } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';

import { Subject, zip } from 'rxjs';
import { takeUntil, first, filter } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';

import { LienStatusSummary, IdValue } from '@app/models';
import { ActionBarService } from '@app/services';
import { KeyValuePair } from '@app/models/utils';
import { DashboardFilters } from '@app/models/enums/dashboard-filters.enum';
import { ProductCategory } from '@app/models/enums';
import { ClaimantDetailsRequest, ClaimantsListRequest } from '@app/modules/shared/_abstractions';
import { CreatePager, UpdatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TotalPaymentChartData } from '@app/models/liens/total-payment-chart-data';
import { QsfAdminStage } from '@app/models/enums/qsf-admin-stage.enum';
import { QsfAdminPhase } from '@app/models/enums/qsf-admin-phase.enum';
import { QsfAdminPhaseSummary } from '@app/models/liens/qsf-admin-phase-summary';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DashboardComponentBase } from '../dashboard-component-base';
import { QsfAdminDashboardState } from './state/reducer';
import { QsfAdminDashboardClaimantsListComponent } from '../qsf-admin-dashboard-claimants-list/qsf-admin-dashboard-claimants-list.component';
import * as lienListActions from '../qsf-admin-dashboard-claimants-list/state/actions';
import * as selectors from './state/selectors';
import * as actions from './state/actions';
import * as projectActions from '../../projects/state/actions';
import { actionBar } from '../../projects/state/selectors';
import { CreateOrUpdateProjectOverviewDashboardClaimantsRequest, UpdateActionBar } from '../../projects/state/actions';
import { SetClaimantDetailsRequest } from '../../claimants/claimant-details/state/actions';
import { StatusChartColors } from '@app/models/enums/status-chart-colors.enum';

@Component({
  selector: 'app-qsf-admin-dashboard',
  templateUrl: './qsf-admin-dashboard.component.html',
  styleUrls: ['./qsf-admin-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QsfAdminDashboardComponent extends
  DashboardComponentBase<
  QsfAdminDashboardState,
  ClaimantsListRequest,
  ClaimantDetailsRequest
  > implements OnInit, OnDestroy {
  @ViewChild(QsfAdminDashboardClaimantsListComponent) claimantListComponent: QsfAdminDashboardClaimantsListComponent;

  rootProductCategoryId = ProductCategory.QSFAdministration;
  relatedPage = RelatedPage.ClaimantsFromQsfDashboard;

  public stagesSummary$ = this.store$.select(selectors.statusesSummary);
  public phasesSummary$ = this.store$.select(selectors.phasesSummary);
  public totalPaymentChartData$ = this.store$.select(selectors.totalPaymentChartData);

  selectedStages$ = this.store$.select(selectors.selectedStatuses);
  selectedPhases$ = this.store$.select(selectors.selectedPhases);

  public filtersProjectId$ = this.store$.select(selectors.filtersProjectId);
  private activeFilter$ = this.store$.select(selectors.activeFilter);

  public qsfAdminDashboardClearActionFilters$ = this.store$.select(selectors.qsfAdminDashboardClearActionFilters);

  public actionBar$ = this.store$.select(actionBar);

  public readonly isDashboardLoaded$ = this.store$.select(selectors.isDashboardLoaded);

  public ngUnsubscribe$ = new Subject<void>();

  public allPhases: IdValue[] = [
    new IdValue(QsfAdminPhase.NoData, 'No F&E Data'),
    new IdValue(QsfAdminPhase.Paid, 'Total F&E Paid'),
    new IdValue(QsfAdminPhase.Unpaid, 'Total F&E Unpaid'),
  ];
  public allStages: IdValue[] = [
    new IdValue(QsfAdminStage.Pending, 'Pending'),
    new IdValue(QsfAdminStage.Finalized, 'Finalized'),
  ];

  public stagesChart;
  public phasesChart;
  public totalPaymentChart;
  public activeFilter;
  public filters: KeyValuePair<string, string>[] = [];

  totalPaymentChartSummary: TotalPaymentChartData;

  public options: SelectOption[] = [
    { id: 1, name: 'Overview Dashboard', checked: true },
  ];
  public hideChips: boolean = true;

  constructor(
    store: Store<QsfAdminDashboardState>,
    private readonly claimantStore$: Store<ClaimantDetailsState>,
    private changeRef: ChangeDetectorRef,
    private readonly actionBarService: ActionBarService,
    private readonly actionsSubj: ActionsSubject,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    super(store);
  }

  private readonly actionBar: ActionHandlersMap = {
    clearFilter: {
      callback: () => this.clearFilters(),
      disabled: () => !this.hasActiveFilter,
    },
  };

  ngOnInit(): void {
    this.activatedRoute.parent.parent.parent.params.subscribe((params: Params) => {
      this.projectId = +params.id || 0;
    });

    this.updateClearFilterOptionInActionBar([]);
    super.ngOnInit();
    this.initSubscriptions();
    this.initCharts();
  }

  public onSelectItem(): void {}
  public onSelectAll(): void {}

  initSubscriptions(): void {
    this.store$.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBar }));
    this.activeFilter$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(item => { this.activeFilter = item; });

    this.qsfAdminDashboardClearActionFilters$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(filters => {
      this.filters = filters;
      this.updateClearFilterOptionInActionBar(filters);
    });

    this.actionBarService.clearAllFilters.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => {
      this.clearFilters();
    });

    this.store$.dispatch(CreateOrUpdateProjectOverviewDashboardClaimantsRequest({ request: null }));

    this.dataSubscription();
    this.actionBarClearFilterSubscription();

    this.actionsSubj.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
      ofType(lienListActions.GetClaimantsListSuccess),
    ).subscribe(() => this.detectChanges());
  }

  dataSubscription(): void {
    this.totalPaymentChartData$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
      this.totalPaymentChartSummary = summary;
      this.totalPaymentChart = this.getTotalPaymentChart(summary);
      this.detectChanges();
    });

    this.stagesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
      this.stagesChart = this.getStagesChart(summary);
      this.detectChanges();
    });

    this.phasesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
      this.phasesChart = this.getPhasesChart(summary);
      this.detectChanges();
    });
  }

  actionBarClearFilterSubscription(): void {
    this.actionBarService
      .clearFilter
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(() => {
        switch (this.activeFilter) {
          case DashboardFilters.Status:
          case DashboardFilters.Phase:
            this.clearOnlyChartFilters();
            break;
        }
      });
  }

  ngDoCheck(): void {
    this.detectChanges();
  }

  private initCharts(): void {
    this.store$.dispatch(actions.GetTotalPaymentChartData({
      projectId: this.projectId,
      bypassSpinner: true,
    }));

    zip(this.selectedStages$, this.selectedPhases$, this.filtersProjectId$)
      .pipe(first())
      .subscribe(([selectedStatuses, selectedPhases, filtersProjectId]) => {
        if (filtersProjectId && filtersProjectId !== this.projectId) {
          this.clearFilters();
          return;
        }

        if (!selectedStatuses) { this.store$.dispatch(actions.GetStatusesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases, bypassSpinner: true })); }

        if (!selectedPhases) {
          this.store$.dispatch(actions.GetPhasesSummary({
            rootProductCategoryId: this.rootProductCategoryId,
            projectId: this.projectId,
            lienPhases: selectedPhases,
            clientStatuses: selectedStatuses,
            bypassSpinner: true,
          }));
        }
      });
  }

  public get hasActiveFilter(): boolean {
    return this.hasActiveFilterCheck;
  }

  get canClearGridFilters(): boolean {
    return this.claimantListComponent?.canClearGridFilters();
  }

  // Select Stages
  public stagesDataplotClick(event): void {
    this.updateChartData(
      DashboardFilters.Status,
      this.getStageIdsFromPieChartEvent(event, this.allStages),
      null,
    );
  }

  public phasesDataplotClick(event): void {
    this.updateChartData(
      DashboardFilters.Phase,
      null,
      this.getStageIdsFromPieChartEvent(event, this.allPhases),
    );
  }

  public updateChartData(chartType: DashboardFilters, selectedStages, selectedPhases): void {
    switch (chartType) {
      case DashboardFilters.Status:

        if (this.activeFilter != null && this.activeFilter != DashboardFilters.Status) {
          this.store$.dispatch(actions.GetStatusesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
        }

        this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, clientStatuses: selectedStages }));
        this.getClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, clientStages: selectedStages });

        break;

      case DashboardFilters.Phase:

        if (this.activeFilter != null && this.activeFilter != DashboardFilters.Phase) {
          this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
        }

        this.store$.dispatch(actions.GetStatusesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases }));
        this.getClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, lienPhases: selectedPhases });

        break;

      default:
        break;
    }

    this.updateActiveFilter(chartType);
    this.updateActonFilters();
  }

  public updateActonFilters(): void {
    const allFilters: KeyValuePair<string, string>[] = [];

    if (this.selectedPhases?.length > 0 && this.allPhases?.length > 0) {
      this.selectedPhases.forEach((phaseId: number) => {
        const phase: IdValue = this.allPhases.find(i => i.id === phaseId);
        const newFilter = { key: DashboardFilters.Phase, value: phase.name };
        allFilters.push(newFilter);
      });
    }

    if (this.selectedStages?.length > 0 && this.allStages?.length > 0) {
      this.selectedStages.forEach((stageId: number) => {
        const stage: IdValue = this.allStages.find(i => i.id === stageId);
        const newFilter = { key: DashboardFilters.Status, value: stage.name };
        allFilters.push(newFilter);
      });
    }

    this.updateFilterList(allFilters);
  }

  public clearFilters(): void {
    this.claimantListComponent?.clearGridFilters();
    this.clearFields();

    this.dispatchSummaries();
    this.clearActiveFilter();
    this.detectChanges();
  }

  public clearOnlyChartFilters(): void {
    this.clearFields();

    this.claimantListComponent?.refreshGrid();

    this.dispatchSummaries();
    this.clearActiveFilter();
    this.detectChanges();
  }

  private clearFields(): void {
    this.filters = [];
    this.updateFilterList(this.filters);

    this.selectedStages = null;
    this.selectedPhases = null;

    this.stagesChart = null;
    this.phasesChart = null;
  }

  private dispatchSummaries(): void {
    this.store$.dispatch(actions.GetStatusesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, bypassSpinner: true }));
    this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, bypassSpinner: true }));
  }

  private clearActiveFilter(): void {
    this.activeFilter = null;
    this.updateActiveFilter(null);
  }

  private getStagesChart(item: LienStatusSummary) {
    const data = [];
    const multiStatuses = item.pendingCount > 0 && item.finalizedCount > 0;

    if (item.pendingCount > 0) {
      data.push({
        label: this.allStages.find(i => i.id === QsfAdminStage.Pending).name,
        value: item.pendingCount,
        isSliced: multiStatuses && this.selectedStages?.includes(QsfAdminStage.Pending),
        color: this.getStageColor(QsfAdminStage.Pending),
      });
    }

    if (item.finalizedCount > 0) {
      data.push({
        label: this.allStages.find(i => i.id === QsfAdminStage.Finalized).name,
        value: item.finalizedCount,
        isSliced: multiStatuses && this.selectedStages?.includes(QsfAdminStage.Finalized),
        color: this.getStageColor(QsfAdminStage.Finalized),
      });
    }

    return {
      chart: { ...this.getPieChartDefinition(item, {}) },
      data,
    };
  }

  private getPhasesChart(phaseSummary: QsfAdminPhaseSummary) {
    const data = [];
    const multiStatuses = (phaseSummary.paid + phaseSummary.unpaid + phaseSummary.noData) > 0;

    const percentPaid = phaseSummary.totalCount ? Math.round((phaseSummary.paid / phaseSummary.totalCount) * 10000) / 100 : 0;
    const percentUnpaid = phaseSummary.totalCount ? Math.round((phaseSummary.unpaid / phaseSummary.totalCount) * 10000) / 100 : 0;
    const percentNoData = phaseSummary.totalCount ? Math.round((100 - percentPaid - percentUnpaid) * 100) / 100 : 0;

    if (phaseSummary.paid > 0) {
      const label = this.allPhases.find(i => i.id === QsfAdminPhase.Paid).name;
      data.push(this.getQsfPhasesChartDataItem(label, phaseSummary.paid, percentPaid, multiStatuses, QsfAdminPhase.Paid));
    }

    if (phaseSummary.unpaid > 0) {
      const label = this.allPhases.find(i => i.id === QsfAdminPhase.Unpaid).name;
      data.push(this.getQsfPhasesChartDataItem(label, phaseSummary.unpaid, percentUnpaid, multiStatuses, QsfAdminPhase.Unpaid));
    }
    if (phaseSummary.noData > 0) {
      const label = this.allPhases.find(i => i.id === QsfAdminPhase.NoData).name;
      data.push(this.getQsfPhasesChartDataItem(label, phaseSummary.noData, percentNoData, multiStatuses, QsfAdminPhase.NoData));
    }

    return {
      chart: { ...this.getPieChartDefinition(phaseSummary, {}, {}) },
      data,
    };
  }

  private getQsfPhasesChartDataItem(
    label: string,
    value: number,
    percent: number,
    multiStatuses: boolean,
    phase: QsfAdminPhase,
  ) {
    return {
      label,
      value,
      displayValue: `${label}, ${value}, ${percent}%`.replace('&', ' and '),
      isSliced: multiStatuses && this.selectedPhases?.includes(phase),
      color: this.getPhaseColor(phase),
    };
  }

  private getTotalPaymentChart(summary: TotalPaymentChartData): any {
    return this.getTotalPaymentChartDefinition(summary);
  }

  public getPhaseColor(phaseId: number): string {
    switch (phaseId) {
      case QsfAdminPhase.Paid: return StatusChartColors.Finalized;
      case QsfAdminPhase.Unpaid: return StatusChartColors.Pending;
      case QsfAdminPhase.NoData: return StatusChartColors.Default;

      default: return StatusChartColors.Default;
    }
  }

  private detectChanges(): void {
    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      setTimeout(() => this.changeRef && this.changeRef.detectChanges());
    }
  }

  public ngOnDestroy(): void {
    this.changeRef = null;
    this.store$.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.store$.dispatch(actions.ClearChartData());

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  getClaimantsList(payload: ClaimantsListRequest): void {
    this.store$.dispatch(UpdatePager({ pager: { payload, relatedPage: this.relatedPage } }));
    this.store$.dispatch(lienListActions.GetClaimantsList(payload));
  }

  onGoToDetails(payload: ClaimantDetailsRequest): void {
    const pagerPayload = {
      id: payload.id,
      projectId: this.projectId,
      rootProductCategoryId: this.rootProductCategoryId,
      lienType: [],
      lienPhases: this.selectedPhases,
      clientStages: this.selectedStages,
    };
    this.store$.dispatch(CreatePager({
      relatedPage: this.relatedPage,
      settings: payload.navSettings,
      pager: { relatedPage: this.relatedPage, payload: { ...pagerPayload } },
    }));
    const claimantDetailsRequest: ClaimantDetailsRequest = {
      ...payload,
      clientStages: this.selectedStages,
      lienPhases: this.selectedPhases,
      lienType: [],
    };
    this.claimantStore$.dispatch(SetClaimantDetailsRequest({ claimantDetailsRequest }));
    this.store$.dispatch(lienListActions.GoToClaimantDetails({ claimantDetailsRequest }));
  }

  updateActiveFilter(activeFilter: DashboardFilters): void {
    this.store$.dispatch(actions.UpdateActiveFilter({ activeFilter }));
  }

  private updateFilterList(filters: KeyValuePair<string, string>[]): void {
    this.store$.dispatch(actions.UpdateQsfAdminDashboardClearActionFilters({ filters }));
  }

  updateClearFilterOptionInActionBar(filters: KeyValuePair<string, string>[], isAlwaysEnabled = false): void {
    this.actionBarService.initClearFiltersAction(
      this.actionBar$,
      filters || [],
      isAlwaysEnabled,
      this.canClearGridFilters,
    ).then(actionBar => { this.store$.dispatch(UpdateActionBar({ actionBar: { ...actionBar, ...this.claimantListComponent.actionBar } })); });
  }
}
