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

import { LienStatusSummary, LienPhaseSummary, LienTypeSummary, LienPhase, IdValue } from '@app/models';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { ProbateStage as ProductStageEnum } from '@app/models/enums/probate-stage.enum';
import { ActionBarService } from '@app/services';
import { KeyValuePair } from '@app/models/utils';
import { DashboardFilters } from '@app/models/enums/dashboard-filters.enum';
import { DashboardFiltersHelper } from '@app/helpers/dashboard-filters.helper';
import { ProductCategory } from '@app/models/enums';
import { ClaimantDetailsRequest, ClaimantsListRequest } from '@app/modules/shared/_abstractions';
import { CreatePager, UpdatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { DashboardComponentBase } from '../dashboard-component-base';
import { ProbateDashboardState } from './state/reducer';
import { DashboardClaimantsListComponent } from '../dashboard-claimants-list/dashboard-claimants-list.component';
import * as lienListActions from '../dashboard-claimants-list/state/actions';
import * as selectors from './state/selectors';
import * as actions from './state/actions';
import { actionBar } from '../../projects/state/selectors';
import { CreateOrUpdateProjectOverviewDashboardClaimantsRequest, UpdateActionBar } from '../../projects/state/actions';
import { SetClaimantDetailsRequest } from '../../claimants/claimant-details/state/actions';
import { chartStylePresets } from '@app/models/fusion-charts/chart-style-presets';

@Component({
  selector: 'app-probate-dashboard',
  templateUrl: './probate-dashboard.component.html',
  styleUrls: ['./probate-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProbateDashboardComponent extends
  DashboardComponentBase<
  ProbateDashboardState,
  ClaimantsListRequest,
  ClaimantDetailsRequest
  > implements OnInit, OnDestroy {
  @ViewChild(DashboardClaimantsListComponent) claimantListComponent: DashboardClaimantsListComponent;

  rootProductCategoryId = ProductCategory.Probate;
  relatedPage = RelatedPage.ClaimantsFromProbateDashboard;

  public project$ = this.store$.select(selectors.projectDetails);

  private productStagesList$ = this.store$.select(selectors.productStagesList);
  private productPhasesList$ = this.store$.select(selectors.productPhasesList);
  private productTypesList$ = this.store$.select(selectors.productTypesList);

  public stagesSummary$ = this.store$.select(selectors.statusesSummary);
  public phasesSummary$ = this.store$.select(selectors.phasesSummary);
  public typesSummary$ = this.store$.select(selectors.typesSummary);

  selectedStages$ = this.store$.select(selectors.selectedStatuses);
  selectedPhases$ = this.store$.select(selectors.selectedPhases);
  public selectedTypes$ = this.store$.select(selectors.selectedTypes);

  public filtersProjectId$ = this.store$.select(selectors.filtersProjectId);
  private activeFilter$ = this.store$.select(selectors.activeFilter);

  public probateDashboardClearActionFilters$ = this.store$.select(selectors.probateDashboardClearActionFilters);

  public actionBar$ = this.store$.select(actionBar);

  public error$ = this.store$.select(selectors.error);

  public ngUnsubscribe$ = new Subject<void>();

  public allTypes: IdValue[] = [];
  public allPhases: LienPhase[] = [];
  public allStages: IdValue[] = [];
  public headerElements: ContextBarElement[];
  public title: string;
  public stagesChart;
  public phasesChart;
  public typesChart;
  public activeFilter;
  public filters: KeyValuePair<string, string>[] = [];

  // For workaround to higlight selected phase in types chart
  typesSummary: LienTypeSummary;

  private selectedTypes: number[];

  constructor(
    store: Store<ProbateDashboardState>,
    private readonly claimantStore$: Store<ClaimantDetailsState>,
    private changeRef: ChangeDetectorRef,
    private readonly actionBarService: ActionBarService,
    private readonly actionsSubj: ActionsSubject,
  ) {
    super(store);
  }

  ngOnInit() {
    this.store$.dispatch(actions.GetProject({ id: this.projectId }));
    this.updateClearFilterOptionInActionBar([]);
    super.ngOnInit();
    this.initSubscriptions();
    this.initCharts();
  }

  initSubscriptions() {
    this.selectedTypes$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(items => this.selectedTypes = items);
    this.activeFilter$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(item => this.activeFilter = item);

    this.probateDashboardClearActionFilters$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(filters => {
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

  dataSubscription() {
    zip(this.productPhasesList$, this.productTypesList$, this.productStagesList$)
      .pipe(
        filter(([phasesItems, typesItems, stagesItems]) => !!phasesItems && !!typesItems && !!stagesItems),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(([phasesItems, typesItems, stagesItems]) => {
        this.allPhases = phasesItems;
        this.allTypes = typesItems;

        this.allStages = [];
        this.allStages.push(stagesItems.find(i => i.id === (ProductStageEnum.pending)));
        this.allStages.push(stagesItems.find(i => i.id === (ProductStageEnum.finalized)));

        this.stagesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          this.stagesChart = this.getStagesChart(summary);
          this.detectChanges();
        });

        this.phasesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          this.phasesChart = this.getPhasesChart(summary);
          this.detectChanges();
        });

        this.typesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          this.typesSummary = summary;
          this.typesChart = this.getTypesChart(summary);
          this.detectChanges();
        });
      });
  }

  actionBarClearFilterSubscription() {
    this.actionBarService
      .clearFilter
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(filterKey => {
        switch (this.activeFilter) {
          case DashboardFilters.Status:
          case DashboardFilters.Phase:
            this.clearOnlyChartFilters();
            break;
          case DashboardFilters.Product:
            switch (filterKey) {
              case DashboardFilters.Phase:
                this.selectedPhases = [];
                if (this.selectedTypes?.length > 0) {
                  this.updateChartData(DashboardFilters.Product, null, null, this.selectedTypes);
                } else {
                  this.clearOnlyChartFilters();
                }
                break;
              case DashboardFilters.Product:
                this.selectedTypes = [];
                if (this.selectedPhases?.length > 0) {
                  this.updateChartData(DashboardFilters.Phase, null, this.selectedPhases, null);
                } else {
                  this.clearOnlyChartFilters();
                }
                break;
            }

            break;
        }
      });
  }

  ngDoCheck(): void {
    this.detectChanges();
  }

  private initCharts() {
    zip(this.selectedStages$, this.selectedTypes$, this.selectedPhases$, this.filtersProjectId$, this.productPhasesList$, this.productTypesList$, this.productStagesList$)
      .pipe(first())
      .subscribe(([selectedStatuses, selectedTypes, selectedPhases, filtersProjectId, productPhasesList, productTypesList, productStagesList]) => {
        if (filtersProjectId && filtersProjectId !== this.projectId) {
          this.clearFilters();
          return;
        }

        if (!selectedStatuses) { this.store$.dispatch(actions.GetStatusesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienTypes: selectedTypes, lienPhases: selectedPhases })); }

        if (!selectedPhases) {
          this.store$.dispatch(actions.GetPhasesSummary({
            rootProductCategoryId: this.rootProductCategoryId,
            projectId: this.projectId,
            lienTypes: selectedTypes,
            lienPhases: selectedPhases,
            clientStatuses: selectedStatuses,
          }));
        }

        if (!selectedTypes) {
          this.store$.dispatch(actions.GetTypesSummary({
            rootProductCategoryId: this.rootProductCategoryId,
            projectId: this.projectId,
            lienPhases: selectedPhases,
            clientStatuses: selectedStatuses,
          }));
        }

        if (!productPhasesList) { this.store$.dispatch(actions.GetProductPhasesList({ productCategoryId: this.rootProductCategoryId })); }

        if (!productTypesList) { this.store$.dispatch(actions.GetProductTypesList({ productCategoryId: this.rootProductCategoryId })); }

        if (!productStagesList) { this.store$.dispatch(actions.GetProductStagesList({ productCategoryId: this.rootProductCategoryId })); }
      });
  }

  public get hasActiveFilter(): boolean {
    return this.hasActiveFilterCheck || !!this.selectedTypes;
  }

  get canClearGridFilters(): boolean {
    return this.claimantListComponent?.canClearGridFilters();
  }

  // Select Stages
  public stagesDataplotClick(event) {
    this.updateChartData(
      DashboardFilters.Status,
      this.getStageIdsFromPieChartEvent(event, this.allStages),
      null,
      null,
    );
  }

  public phasesDataplotClick(event) {
    this.updateChartData(
      DashboardFilters.Phase,
      null,
      this.getPhaseIdsFromPieChartEvent(event, this.allPhases),
      null,
    );
  }

  // Select LienType and Phase
  public typesDataplotClick(event) {
    const selectedPhasesAndTypes = this.getTypesAndPhasesFromStackedChartEvent(event, this.allTypes, this.allPhases, this.selectedTypes, this.selectedPhases);
    this.updateChartData(DashboardFilters.Product, null, selectedPhasesAndTypes.selectedPhases, selectedPhasesAndTypes.selectedTypes);
  }

  // Select LienType
  public typesXAxisLabelClick(event) {
    this.updateChartData(
      DashboardFilters.Product,
      null,
      null,
      this.getProductFromStackedChartXAxisEvent(event, this.selectedTypes, this.allTypes),
    );
  }

  public updateChartData(chartType: DashboardFilters, selectedStages, selectedPhases, selectedTypes) {
    switch (chartType) {
      case DashboardFilters.Status:

        if (this.activeFilter != null && this.activeFilter != DashboardFilters.Status) {
          this.store$.dispatch(actions.GetStatusesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
        }

        this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, clientStatuses: selectedStages }));
        this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, clientStatuses: selectedStages }));
        this.getClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, clientStages: selectedStages });

        break;

      case DashboardFilters.Phase:

        if (this.activeFilter != null && this.activeFilter != DashboardFilters.Phase) {
          this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
        }

        this.store$.dispatch(actions.GetStatusesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases }));
        this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases }));
        this.getClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, lienPhases: selectedPhases });

        break;

      case DashboardFilters.Product:

        if (this.activeFilter != null && this.activeFilter != DashboardFilters.Product) { this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId })); }

        this.store$.dispatch(actions.GetStatusesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienTypes: selectedTypes, lienPhases: selectedPhases }));
        this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienTypes: selectedTypes, lienPhases: selectedPhases }));
        this.getClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, lienTypes: selectedTypes, lienPhases: selectedPhases });

        if (this.activeFilter == null || this.activeFilter == DashboardFilters.Product) {
          this.typesChart = this.getTypesChart(this.typesSummary);
          this.detectChanges();
        }

        break;

      default:
        break;
    }

    this.updateActiveFilter(chartType);
    this.updateActonFilters();
  }

  public updateActonFilters() {
    const allFilters: KeyValuePair<string, string>[] = DashboardFiltersHelper.updateDashboardActionFilters<ProductStageEnum>(
      this.selectedPhases,
      this.selectedStages,
      this.selectedTypes,
      this.allPhases,
      this.allStages,
      this.allTypes,
    );
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
    this.selectedTypes = null;

    this.stagesChart = null;
    this.phasesChart = null;
    this.typesChart = null;
  }

  private dispatchSummaries(): void {
    this.store$.dispatch(actions.GetStatusesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
    this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
    this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
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
        label: this.allStages.find(i => i.id === ProductStageEnum.pending).name,
        value: item.pendingCount,
        isSliced: multiStatuses && this.selectedStages?.includes(ProductStageEnum.pending),
        color: this.getStageColor(ProductStageEnum.pending),
      });
    }

    if (item.finalizedCount > 0) {
      data.push({
        label: this.allStages.find(i => i.id === ProductStageEnum.finalized).name,
        value: item.finalizedCount,
        isSliced: multiStatuses && this.selectedStages?.includes(ProductStageEnum.finalized),
        color: this.getStageColor(ProductStageEnum.finalized),
      });
    }

    return {
      chart: { ...this.getPieChartDefinition(item, {}) },
      data,
    };
  }

  private getPhasesChart(phaseSummary: LienPhaseSummary) {
    const chartProps = { ...this.createDefaultCenterLabel(phaseSummary.lienCount, 'Probates') };

    return this.getPhasesChartDefinition(phaseSummary, chartProps, this.selectedPhases);
  }

  private getTypesChart(typeSummary: LienTypeSummary) {
    return this.getTypesChartDefinition(typeSummary, this.allTypes, this.allPhases, this.selectedPhases, this.selectedTypes, null, chartStylePresets.stackedcolumn2dDashboard);
  }

  private detectChanges() {
    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      setTimeout(() => this.changeRef && this.changeRef.detectChanges());
    }
  }

  public updateDashboardData() {
    this.store$.dispatch(actions.GetPhasesSummary({
      rootProductCategoryId: this.rootProductCategoryId,
      projectId: this.projectId,
      lienTypes: this.selectedTypes,
      lienPhases: this.selectedPhases,
      clientStatuses: this.selectedStages,
    }));
    this.store$.dispatch(actions.GetStatusesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienTypes: this.selectedTypes, lienPhases: this.selectedPhases }));
    this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: this.selectedPhases, clientStatuses: this.selectedStages }));
    this.store$.dispatch(lienListActions.GetClaimantsList({
      projectId: this.projectId,
      rootProductCategoryId: this.rootProductCategoryId,
      lienTypes: this.selectedTypes,
      lienPhases: this.selectedPhases,
      clientStatuses: this.selectedStages,
    }));
  }

  public ngOnDestroy(): void {
    this.changeRef = null;
    this.store$.dispatch(actions.UpdateActionBar({ actionBar: null }));

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  getClaimantsList(payload: ClaimantsListRequest) {
    this.store$.dispatch(UpdatePager({ pager: { payload, relatedPage: this.relatedPage } }));
    this.store$.dispatch(lienListActions.GetClaimantsList(payload));
  }

  onGoToDetails(payload: ClaimantDetailsRequest) {
    const pagerPayload = { id: payload.id, projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, lienType: this.selectedTypes, lienPhases: this.selectedPhases, clientStages: this.selectedStages };
    this.store$.dispatch(CreatePager({
      relatedPage: this.relatedPage,
      settings: payload.navSettings,
      pager: { relatedPage: this.relatedPage, payload: { ...pagerPayload } },
    }));
    const claimantDetailsRequest: ClaimantDetailsRequest = {
      ...payload,
      clientStages: this.selectedStages,
      lienPhases: this.selectedPhases,
      lienType: this.selectedTypes,
    };
    this.claimantStore$.dispatch(SetClaimantDetailsRequest({ claimantDetailsRequest }));
    this.store$.dispatch(lienListActions.GoToClaimantDetails({ claimantDetailsRequest }));
  }

  updateActiveFilter(activeFilter: DashboardFilters) {
    this.store$.dispatch(actions.UpdateActiveFilter({ activeFilter }));
  }

  private updateFilterList(filters: KeyValuePair<string, string>[]) {
    this.store$.dispatch(actions.UpdateProbateDashboardClearActionFilters({ filters }));
  }

  updateClearFilterOptionInActionBar(filters: KeyValuePair<string, string>[], isAlwaysEnabled = false) {
    this.actionBarService.initClearFiltersAction(
      this.actionBar$,
      filters || [],
      isAlwaysEnabled,
      this.canClearGridFilters,
    ).then(actionBar => { this.store$.dispatch(UpdateActionBar({ actionBar: { ...actionBar, ...this.claimantListComponent.actionBar } })); });
  }
}
