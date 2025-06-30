/// NOTES
/// legend https://www.fusioncharts.com/features/label-management
/// events https://www.fusioncharts.com/dev/api/fusioncharts/fusioncharts-events#event-labelClick
/// subcaptions and titles https://www.fusioncharts.com/features/label-management#captions-and-subcaptions
///
// eslint-disable-next-line max-classes-per-file
/* eslint-disable max-len */
/* eslint-disable no-shadow */
/* eslint-disable no-return-assign */
import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, DoCheck, ViewRef, OnDestroy } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subject, Subscription, zip } from 'rxjs';
import { takeUntil, first, filter } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';

import { LienStatusSummary, LienPhaseSummary, LienTypeSummary, LienPhase, IdValue } from '@app/models';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { ReleaseStage as ProductStageEnum } from '@app/models/enums/release-stage.enum';
import { ProductCategory } from '@app/models/enums/product-category.enum';
import { KeyValuePair } from '@app/models/utils';
import { ActionBarService } from '@app/services';
import { DashboardFilters } from '@app/models/enums/dashboard-filters.enum';
import { DashboardFiltersHelper } from '@app/helpers/dashboard-filters.helper';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { ClaimantDetailsRequest, ClaimantsListRequest } from '@app/modules/shared/_abstractions';
import { DashboardComponentBase } from './../dashboard-component-base';
import * as actions from './state/actions';
import * as selectors from './state/selectors';
import { ReleaseDashboardClaimantsListComponent } from '../release-dashboard-claimants-list/release-dashboard-claimants-list.component';

import { ReleaseDashboardState } from './state/reducer';
import { actionBar } from '../../projects/state/selectors';
import { CreateOrUpdateProjectOverviewDashboardClaimantsRequest, UpdateActionBar } from '../../projects/state/actions';
import * as lienListActions from '../release-dashboard-claimants-list/state/actions';
import * as commonActions from '../../shared/state/common.actions';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { SetClaimantDetailsRequest } from '@app/modules/claimants/claimant-details/state/actions';
import { ReleaseInGoodOrderSummary } from '@app/models/liens/release-in-good-order-summary';
import { ReleaseInGoodOrder } from '@app/models/liens/release-in-good-order';
import { FusionPieChart } from '@app/models/fusion-charts/fusion-pie-chart';
import { PieChartDataItem } from '@app/models/fusion-charts/pie-chart-data-item';
import { StatusChartColors } from '@app/models/enums/status-chart-colors.enum';

@Component({
  selector: 'app-release-dashboard',
  templateUrl: './release-dashboard.component.html',
  styleUrls: ['./release-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReleaseDashboardComponent
  extends
  DashboardComponentBase<
  ReleaseDashboardState,
  ClaimantsListRequest,
  ClaimantDetailsRequest
  >
  implements OnInit, DoCheck, OnDestroy {
  @ViewChild(ReleaseDashboardClaimantsListComponent)
  claimantListComponent: ReleaseDashboardClaimantsListComponent;

  rootProductCategoryId = ProductCategory.Release;

  relatedPage = RelatedPage.ClaimantsFromReleaseDashboard;

  public project$ = this.store$.select(selectors.projectDetails);

  private productStagesList$ = this.store$.select(selectors.productStagesList);
  private productPhasesList$ = this.store$.select(selectors.productPhasesList);

  public stagesSummary$ = this.store$.select(selectors.stagesSummary);
  public phasesSummary$ = this.store$.select(selectors.phasesSummary);
  public releaseInGoodOrderSummary$ = this.store$.select(selectors.releaseInGoodOrderSummary);

  selectedStages$ = this.store$.select(selectors.selectedStages);
  selectedPhases$ = this.store$.select(selectors.selectedPhases);

  private selectedIsReleaseInGoodOrder$ = this.store$.select(selectors.selectedIsReleaseInGoodOrder);

  public filtersProjectId$ = this.store$.select(selectors.filtersProjectId);
  private activeFilter$ = this.store$.select(selectors.activeFilter);

  public releaseDashboardClearActionFilters$ = this.store$.select(selectors.releaseDashboardClearActionFilters);

  public actionBar$ = this.store$.select(actionBar);
  public error$ = this.store$.select(selectors.error);
  private clearFilterSubscription: Subscription;
  public ngUnsubscribe$ = new Subject<void>();

  public allTypes: IdValue[] = [];
  public allPhases: LienPhase[] = [];
  public allStages: IdValue[] = [];

  public headerElements: ContextBarElement[];
  public title: string;
  public stagesChart;
  public phasesChart;
  public typesChart;
  public releaseInGoodOrderChart;

  public activeFilter;
  public filters: KeyValuePair<string, string>[] = [];

  typesSummary: LienTypeSummary;
  releaseInGoodOrderSummary: ReleaseInGoodOrderSummary;

  private selectedTypes: number[];
  private selectedIsReleaseInGoodOrder: boolean;

  yesReleaseInGoodOrder: ReleaseInGoodOrder = {
    name: 'Yes',
    value: 0,
    color: StatusChartColors.Finalized,
    isReleaseInGoodOrder: true
  };

  noReleaseInGoodOrder: ReleaseInGoodOrder = {
    name: 'No',
    value: 0,
    color: StatusChartColors.Pending,
    isReleaseInGoodOrder: false
  };

  public get allReleaseInGoodOrderTypes(): ReleaseInGoodOrder[] {
    const results: ReleaseInGoodOrder[] = [this.yesReleaseInGoodOrder, this.noReleaseInGoodOrder];
    return results;
  }

  constructor(
    store$: Store<ReleaseDashboardState>,
    private claimantStore$: Store<ClaimantDetailsState>,
    private changeRef: ChangeDetectorRef,
    private readonly actionBarService: ActionBarService,
    private actionsSubj: ActionsSubject,
  ) {
    super(store$);
  }

  ngOnInit() {
    this.store$.dispatch(actions.GetProject({ id: this.projectId }));
    this.updateClearFilterOptionInActionBar([]);
    super.ngOnInit();
    this.initSubscriptions();
    this.initCharts();
  }

  initSubscriptions() {
    this.selectedIsReleaseInGoodOrder$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(items => this.selectedIsReleaseInGoodOrder = items);
    this.activeFilter$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(item => this.activeFilter = item);

    this.releaseDashboardClearActionFilters$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(filters => {
      this.filters = filters;
      this.updateClearFilterOptionInActionBar(filters);
    });

    this.actionBarService.clearAllFilters.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => {
      this.clearFilters();
    });

    this.store$.dispatch(CreateOrUpdateProjectOverviewDashboardClaimantsRequest({ request: null }));

    this.dataSubscription();
    this.actionBarClearFilterSubscription();

    this.actionsSubj.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$),
      ofType(lienListActions.GetClaimantsListSuccess)).subscribe(() => this.detectChanges());
  }

  dataSubscription() {
    zip(this.productPhasesList$, this.productStagesList$)
      .pipe(
        filter(([phasesItems, stagesItems]) => !!phasesItems && !!stagesItems),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(([phasesItems, stagesItems]) => {
        this.allPhases = phasesItems;

        this.allStages = [];
        this.allStages.push(stagesItems.find(i => i.id === (ProductStageEnum.Pending)));
        this.allStages.push(stagesItems.find(i => i.id === (ProductStageEnum.Finalized)));

        this.stagesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          this.stagesChart = this.getStagesChart(summary);
          this.detectChanges();
        });

        this.phasesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          this.phasesChart = this.getPhasesChart(summary);
          this.detectChanges();
        });

        this.releaseInGoodOrderSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          this.releaseInGoodOrderChart = this.getGoodOrderChartDefinition(summary);
          this.detectChanges();
        });

      });
  }

  actionBarClearFilterSubscription() {
    if (!this.clearFilterSubscription) {
      this.clearFilterSubscription = this.actionBarService
        .clearFilter
        .pipe(
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(() => {

          switch (this.activeFilter) {
            case DashboardFilters.Status:
              this.clearOnlyChartFilters();
              break;

            case DashboardFilters.Phase:
              this.clearOnlyChartFilters();
              break;

            case DashboardFilters.ReleaseInGoodOrder:
              this.clearOnlyChartFilters();
              break;
          }

        });
    }
  }

  ngDoCheck(): void {
    this.detectChanges();
  }

  private initCharts() {
    zip(this.selectedStages$, this.selectedPhases$, this.filtersProjectId$, this.productPhasesList$, this.productStagesList$, this.selectedIsReleaseInGoodOrder$)
      .pipe(first())
      .subscribe(([selectedStages, selectedPhases, filtersProjectId, productPhasesList, productStagesList, selectedIsReleaseInGoodOrder]) => {
        if (filtersProjectId && filtersProjectId !== this.projectId) {
          this.clearFilters();
          return;
        }

        if (!selectedStages) this.store$.dispatch(actions.GetStagesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases, isReleaseInGoodOrder: selectedIsReleaseInGoodOrder }));

        if (!selectedPhases) this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases, clientStages: selectedStages, isReleaseInGoodOrder: selectedIsReleaseInGoodOrder }));

        if (!productPhasesList) this.store$.dispatch(actions.GetProductPhasesList({ productCategoryId: this.rootProductCategoryId }));

        if (!productStagesList) this.store$.dispatch(actions.GetProductStagesList({ productCategoryId: this.rootProductCategoryId }));

        if (!selectedIsReleaseInGoodOrder)
          this.store$.dispatch(actions.GetReleaseInGoodOrderSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases, clientStages: selectedStages }));

      });
  }

  public get hasActiveFilter(): boolean {
    return this.hasActiveFilterCheck || !!this.selectedIsReleaseInGoodOrder;
  }

  get canClearGridFilters(): boolean {
    return this.claimantListComponent?.canClearGridFilters();
  }

  // Select Stages
  public stagesDataplotClick(event) {
    this.updateChartData(DashboardFilters.Status,
      this.getStageIdsFromPieChartEvent(event, this.allStages),
      null,
      null);
  }

  public phasesDataplotClick(event) {
    this.updateChartData(DashboardFilters.Phase,
      null,
      this.getPhaseIdsFromPieChartEvent(event, this.allPhases),
      null);
  }

  //Release in good order Chart onClick
  public releaseInGoodOrderDataplotClick(event) {

    const selectedIsReleaseInGoodOrder: boolean = !event.dataObj.isSliced ? this.allReleaseInGoodOrderTypes.find(i => i.name === event.dataObj.categoryLabel).isReleaseInGoodOrder : null;

    this.updateChartData(
      DashboardFilters.ReleaseInGoodOrder,
      null,
      null,
      null,
      selectedIsReleaseInGoodOrder);
  }

  public updateChartData(chartType: DashboardFilters, selectedStages, selectedPhases, selectedTypes, selectedIsReleaseInGoodOrder?: boolean) {
    switch (chartType) {
      case DashboardFilters.Status:

        if (this.activeFilter != null && this.activeFilter != DashboardFilters.Status) {
          this.store$.dispatch(actions.GetStagesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
        }

        this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, clientStages: selectedStages, isReleaseInGoodOrder: selectedIsReleaseInGoodOrder }));
        this.store$.dispatch(actions.GetReleaseInGoodOrderSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases, clientStages: selectedStages }));
        this.getClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, clientStages: selectedStages });


        break;

      case DashboardFilters.Phase:

        if (this.activeFilter != null && this.activeFilter != DashboardFilters.Phase) {
          this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
        }

        this.store$.dispatch(actions.GetStagesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases, isReleaseInGoodOrder: selectedIsReleaseInGoodOrder }));
        this.store$.dispatch(actions.GetReleaseInGoodOrderSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases, clientStages: selectedStages }));
        this.getClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, lienPhases: selectedPhases });

        break;

      case DashboardFilters.ReleaseInGoodOrder:

        if (this.activeFilter != null && this.activeFilter != DashboardFilters.ReleaseInGoodOrder) {
          this.store$.dispatch(actions.GetReleaseInGoodOrderSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases, clientStages: selectedStages }));
        }

        this.store$.dispatch(actions.GetStagesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienTypes: selectedTypes, lienPhases: selectedPhases, isReleaseInGoodOrder: selectedIsReleaseInGoodOrder }));
        this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienTypes: selectedTypes, lienPhases: selectedPhases, isReleaseInGoodOrder: selectedIsReleaseInGoodOrder }));
        this.getClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, lienTypes: selectedTypes, lienPhases: selectedPhases });

        break

      default:
        break;
    }

    this.updateActiveFilter(chartType);
    this.updateActonFilters();
  }

  public updateActonFilters() {
    const allFilters: KeyValuePair<string, string>[] = DashboardFiltersHelper.updateDashboardActionFilters<ProductStageEnum>(this.selectedPhases, this.selectedStages, this.selectedTypes, this.allPhases, this.allStages, this.allTypes, this.selectedIsReleaseInGoodOrder, this.allReleaseInGoodOrderTypes);
    this.updateFilterList(allFilters);
  }

  public clearFilters(): void {
    this.claimantListComponent?.clearGridFilters();
    this.clearFields();

    this.dispatchSummaries();
    this.clearActiveFilter();
  }

  public clearOnlyChartFilters(): void {
    this.clearFields();

    this.detectChanges();
    this.claimantListComponent?.refreshGrid();

    this.dispatchSummaries();
    this.clearActiveFilter();
  }

  private clearFields(): void {
    this.filters = [];
    this.updateFilterList(this.filters);

    this.selectedStages = null;
    this.selectedPhases = null;
    this.selectedTypes = null;
    this.selectedIsReleaseInGoodOrder = null;

    this.stagesChart = null;
    this.phasesChart = null;
    this.typesChart = null;
    this.releaseInGoodOrderChart = null;
  }

  private dispatchSummaries(): void {
    this.store$.dispatch(actions.GetStagesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
    this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
    this.store$.dispatch(actions.GetReleaseInGoodOrderSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
  }

  private clearActiveFilter(): void {
    this.activeFilter = null;
    this.updateActiveFilter(null);
  }

  private getStagesChart(item: LienStatusSummary) {
    const data = [];
    const multiStages = item.pendingCount > 0 && item.finalizedCount > 0;

    if (item.pendingCount > 0) {
      data.push({
        label: this.allStages.find(i => i.id === ProductStageEnum.Pending).name,
        value: item.pendingCount,
        isSliced: multiStages && this.selectedStages?.includes(ProductStageEnum.Pending),
        color: this.getStageColor(ProductStageEnum.Pending),
      });
    }

    if (item.finalizedCount > 0) {
      data.push({
        label: this.allStages.find(i => i.id === ProductStageEnum.Finalized).name,
        value: item.finalizedCount,
        isSliced: multiStages && this.selectedStages?.includes(ProductStageEnum.Finalized),
        color: this.getStageColor(ProductStageEnum.Finalized),
      });
    }

    return {
      chart: { ...this.getPieChartDefinition(item, {}) },
      data,
    };
  }

  private getPhasesChart(phaseSummary: LienPhaseSummary) {
    const chartProps = { ...this.createDefaultCenterLabel(phaseSummary.lienCount, 'Releases') };

    return this.getPhasesChartDefinition(phaseSummary, chartProps, this.selectedPhases);
  }

  private detectChanges() {
    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      setTimeout(() => this.changeRef && this.changeRef.detectChanges());
    }
  }

  public ngOnDestroy(): void {
    this.changeRef = null;
    this.store$.dispatch(actions.UpdateActionBar({ actionBar: null }));

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  getClaimantsList(payload: ClaimantsListRequest) {
    this.store$.dispatch(commonActions.UpdatePager({ pager: { payload, relatedPage: this.relatedPage } }));
    this.store$.dispatch(lienListActions.GetClaimantsList(payload));
  }

  onGoToDetails(payload: ClaimantDetailsRequest) {
    const pagerPayload = { id: payload.id, projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, lienType: this.selectedTypes, lienPhases: this.selectedPhases, clientStages: this.selectedStages };
    this.store$.dispatch(commonActions.CreatePager({
      relatedPage: this.relatedPage,
      settings: payload.navSettings,
      pager: { relatedPage: this.relatedPage, payload: pagerPayload },
    }));
    const claimantDetailsRequest: ClaimantDetailsRequest = {
      ...payload,
      clientStages: this.selectedStages,
      lienPhases: this.selectedPhases,
      lienType: this.selectedTypes,
    }
    this.claimantStore$.dispatch(SetClaimantDetailsRequest({ claimantDetailsRequest }));
    this.store$.dispatch(lienListActions.GoToClaimantDetails({ claimantDetailsRequest }));
  }

  updateActiveFilter(activeFilter: DashboardFilters) {
    this.store$.dispatch(actions.UpdateActiveFilter({ activeFilter }));
  }

  private updateFilterList(filters: KeyValuePair<string, string>[]) {
    this.store$.dispatch(actions.UpdateReleaseDashboardClearActionFilters({ filters }));
  }

  updateClearFilterOptionInActionBar(filters: KeyValuePair<string, string>[], isAlwaysEnabled = false) {
    this.actionBarService.initClearFiltersAction(
      this.actionBar$,
      filters || [],
      isAlwaysEnabled,
      this.canClearGridFilters,
    ).then(actionBar => { this.store$.dispatch(UpdateActionBar({ actionBar: { ...actionBar, ...this.claimantListComponent.actionBar } })); });
  }

  getGoodOrderChartDefinition(releaseInGoodOrderSummary: ReleaseInGoodOrderSummary): FusionPieChart {

    this.yesReleaseInGoodOrder.value = releaseInGoodOrderSummary.yesCount;
    this.noReleaseInGoodOrder.value = releaseInGoodOrderSummary.noCount;

    let optionalChartProps = {
       ...this.createDefaultCenterLabel(releaseInGoodOrderSummary.totalCount, 'Releases'),
       startingAngle: '150',
    };

    let itemYes: PieChartDataItem = {
      label: this.yesReleaseInGoodOrder.name,
      tooltext: `${this.yesReleaseInGoodOrder.name}: <b>${this.yesReleaseInGoodOrder.value.toString()}</b> ($percentValue)`,
      value: this.yesReleaseInGoodOrder.value,
      isSliced: this.selectedIsReleaseInGoodOrder != null && this.selectedIsReleaseInGoodOrder,
      color: this.yesReleaseInGoodOrder.color,
    }

    let itemNo: PieChartDataItem = {
      label: this.noReleaseInGoodOrder.name,
      tooltext: `${this.noReleaseInGoodOrder.name}: <b>${this.noReleaseInGoodOrder.value.toString()}</b> ($percentValue)`,
      value: this.noReleaseInGoodOrder.value,
      isSliced: this.selectedIsReleaseInGoodOrder != null && !this.selectedIsReleaseInGoodOrder,
      color: this.noReleaseInGoodOrder.color,
    }

    let dataArr: PieChartDataItem[] = [itemYes, itemNo];

    let pieChart = new FusionPieChart(dataArr, {...this.getPieChartDefinition(releaseInGoodOrderSummary, optionalChartProps)});
    return pieChart
  }

}


