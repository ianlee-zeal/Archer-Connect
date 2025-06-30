/// NOTES
/// legend https://www.fusioncharts.com/features/label-management
/// events https://www.fusioncharts.com/dev/api/fusioncharts/fusioncharts-events#event-labelClick
/// subcaptions and titles https://www.fusioncharts.com/features/label-management#captions-and-subcaptions
///

import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, Input, DoCheck, ViewRef, OnDestroy } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subject, Subscription, zip } from 'rxjs';
import { takeUntil, first, filter } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';

import { LienStatusSummary, LienPhaseSummary, LienTypeSummary, LienPhase, IdValue } from '@app/models';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { BankruptcyStage as ProductStageEnum } from '@app/models/enums/bankruptcy-stage.enum';
import { ProductCategory } from '@app/models/enums/product-category.enum';
import { DashboardFilters } from '@app/models/enums/dashboard-filters.enum';
import { KeyValuePair } from '@app/models/utils';
import { ActionBarService } from '@app/services';
import { CreatePager, UpdatePager } from '@app/modules/shared/state/common.actions';
import { ClaimantsListRequest, ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { DashboardFiltersHelper } from '@app/helpers/dashboard-filters.helper';
import { DashboardComponentBase } from '../dashboard-component-base';
import { BankruptcyDashboardState } from './state/reducer';
import { BankruptcyDashboardClaimantsListComponent } from '../bankruptcy-dashboard-claimants-list/bankruptcy-dashboard-claimants-list.component';
import * as lienListActions from '../bankruptcy-dashboard-claimants-list/state/actions';
import * as selectors from './state/selectors';
import * as actions from './state/actions';
import { actionBar } from '../../projects/state/selectors';
import { CreateOrUpdateProjectOverviewDashboardClaimantsRequest, UpdateActionBar } from '../../projects/state/actions';
import { SetClaimantDetailsRequest } from '../../claimants/claimant-details/state/actions';

@Component({
  selector: 'app-bankruptcy-dashboard',
  templateUrl: './bankruptcy-dashboard.component.html',
  styleUrls: ['./bankruptcy-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankruptcyDashboardComponent extends
  DashboardComponentBase<
  BankruptcyDashboardState,
  ClaimantsListRequest,
  ClaimantDetailsRequest
  > implements OnInit, DoCheck, OnDestroy {
  @Input() projectId: number;
  @ViewChild(BankruptcyDashboardClaimantsListComponent) claimantListComponent: BankruptcyDashboardClaimantsListComponent;

  rootProductCategoryId = ProductCategory.Bankruptcy;
  relatedPage = RelatedPage.ClaimantsFromBankruptcyDashboard;

  public project$ = this.store$.select(selectors.projectDetails);

  private productStagesList$ = this.store$.select(selectors.productStagesList);
  private productPhasesList$ = this.store$.select(selectors.productPhasesList);
  private productTypesList$ = this.store$.select(selectors.productTypesList);

  public stagesSummary$ = this.store$.select(selectors.stagesSummary);
  public phasesSummary$ = this.store$.select(selectors.phasesSummary);
  public typesSummary$ = this.store$.select(selectors.typesSummary);

  selectedStages$ = this.store$.select(selectors.selectedStages);
  selectedPhases$ = this.store$.select(selectors.selectedPhases);
  public selectedTypes$ = this.store$.select(selectors.selectedTypes);

  public filtersProjectId$ = this.store$.select(selectors.filtersProjectId);
  private activeFilter$ = this.store$.select(selectors.activeFilter);

  public bankruptcyDashboardClearActionFilters$ = this.store$.select(selectors.bankruptcyDashboardClearActionFilters);

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

  public activeFilter;
  public filters: KeyValuePair<string, string>[] = [];

  typesSummary: LienTypeSummary;

  private selectedTypes: number[];

  constructor(
    store$: Store<BankruptcyDashboardState>,
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
    this.selectedTypes$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(items => this.selectedTypes = items);
    this.activeFilter$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(item => this.activeFilter = item);

    this.bankruptcyDashboardClearActionFilters$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(filters => {
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
    zip(this.productPhasesList$, this.productTypesList$, this.productStagesList$)
      .pipe(
        filter(([phasesItems, typesItems, stagesItems]) => !!phasesItems && !!typesItems && !!stagesItems),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(([phasesItems, typesItems, stagesItems]) => {
        this.allPhases = phasesItems;
        this.allTypes = typesItems;

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

        this.typesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          this.typesSummary = summary;
          this.typesChart = this.getTypesChart(summary);
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
        .subscribe(filterKey => {
          switch (this.activeFilter) {
            case DashboardFilters.Status:
              this.clearOnlyChartFilters();
              break;

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
  }

  ngDoCheck(): void {
    this.detectChanges();
  }

  private initCharts() {
    zip(this.selectedStages$, this.selectedTypes$, this.selectedPhases$, this.filtersProjectId$, this.productPhasesList$, this.productTypesList$, this.productStagesList$)
      .pipe(first())
      .subscribe(([selectedStages, selectedTypes, selectedPhases, filtersProjectId, productPhasesList, productTypesList, productStagesList]) => {
        if (filtersProjectId && filtersProjectId !== this.projectId) {
          this.clearFilters();
          return;
        }

        if (!selectedStages) { this.store$.dispatch(actions.GetStagesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienTypes: selectedTypes, lienPhases: selectedPhases })); }

        if (!selectedPhases) { this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienTypes: selectedTypes, lienPhases: selectedPhases, clientStages: selectedStages })); }

        if (!selectedTypes) { this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases, clientStages: selectedStages })); }

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

  // Select LienType and Phase
  public typesDataplotClick(event) {
    const selectedPhasesAndTypes = this.getTypesAndPhasesFromStackedChartEvent(event, this.allTypes, this.allPhases, this.selectedTypes, this.selectedPhases);
    this.updateChartData(DashboardFilters.Product, null, selectedPhasesAndTypes.selectedPhases, selectedPhasesAndTypes.selectedTypes);
  }

  // Select LienType
  public typesXAxisLabelClick(event) {
    this.updateChartData(DashboardFilters.Product,
      null,
      null,
      this.getProductFromStackedChartXAxisEvent(event, this.selectedTypes, this.allTypes));
  }

  public updateChartData(chartType: DashboardFilters, selectedStages, selectedPhases, selectedTypes) {
    switch (chartType) {
      case DashboardFilters.Status:

        if (this.activeFilter != null && this.activeFilter != DashboardFilters.Status) {
          this.store$.dispatch(actions.GetStagesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
        }

        this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, clientStages: selectedStages }));
        this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, clientStages: selectedStages }));
        this.getClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, clientStages: selectedStages });

        break;

      case DashboardFilters.Phase:

        if (this.activeFilter != null && this.activeFilter != DashboardFilters.Phase) {
          this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
        }

        this.store$.dispatch(actions.GetStagesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases }));
        this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases }));
        this.getClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, lienPhases: selectedPhases });

        break;

      case DashboardFilters.Product:

        if (this.activeFilter != null && this.activeFilter != DashboardFilters.Product) { this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId })); }

        this.store$.dispatch(actions.GetStagesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienTypes: selectedTypes, lienPhases: selectedPhases }));
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
    const allFilters: KeyValuePair<string, string>[] = DashboardFiltersHelper.updateDashboardActionFilters<ProductStageEnum>(this.selectedPhases, this.selectedStages, this.selectedTypes, this.allPhases, this.allStages, this.allTypes);
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

    this.stagesChart = null;
    this.phasesChart = null;
    this.typesChart = null;
  }

  private dispatchSummaries(): void {
    this.store$.dispatch(actions.GetStagesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
    this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
    this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
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
    const chartProps: any = { ...this.createDefaultCenterLabel(phaseSummary.lienCount, 'Bankruptcies') };
    chartProps.centerLabelFontSize = '10';

    return this.getPhasesChartDefinition(phaseSummary, chartProps, this.selectedPhases);
  }

  private getTypesChart(typeSummary: LienTypeSummary) {
    return this.getTypesChartDefinition(
      typeSummary,
      this.allTypes,
      this.allPhases,
      this.selectedPhases,
      this.selectedTypes,
      {},
    );
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
    this.store$.dispatch(UpdatePager({ pager: { payload, relatedPage: this.relatedPage } }));
    this.store$.dispatch(lienListActions.GetClaimantsList(payload));
  }

  onGoToDetails(payload: ClaimantDetailsRequest) {
    const pagerPayload = { id: payload.id, projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, lienType: this.selectedTypes, lienPhases: this.selectedPhases, clientStages: this.selectedStages };
    this.store$.dispatch(CreatePager({
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
    this.store$.dispatch(actions.UpdateBankruptcyDashboardClearActionFilters({ filters }));
  }

  updateClearFilterOptionInActionBar(filters: KeyValuePair<string, string>[], isAlwaysEnabled = false) {
    this.actionBarService.initClearFiltersAction(
      this.actionBar$,
      filters || [],
      isAlwaysEnabled,
      this.canClearGridFilters,
    ).then(actionBar => this.store$.dispatch(UpdateActionBar({ actionBar: { ...actionBar, ...this.claimantListComponent.actionBar } })));
  }
}
