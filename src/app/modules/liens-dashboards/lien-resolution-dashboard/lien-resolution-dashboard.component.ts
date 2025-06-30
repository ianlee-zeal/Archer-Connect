/* eslint-disable no-return-assign */
/// NOTES
/// legend https://www.fusioncharts.com/features/label-management
/// events https://www.fusioncharts.com/dev/api/fusioncharts/fusioncharts-events#event-labelClick
/// subcaptions and titles https://www.fusioncharts.com/features/label-management#captions-and-subcaptions
///

import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ViewRef, OnDestroy } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subject, Subscription, zip } from 'rxjs';
import { takeUntil, first, filter } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';

import { LienStatusSummary, LienPhaseSummary, LienTypeSummary, LienPhase, IdValue } from '@app/models';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { LienResolutionStage as ProductStageEnum } from '@app/models/enums/lien-resolution-stage.enum';
import { ProductCategory } from '@app/models/enums/product-category.enum';
import { KeyValuePair } from '@app/models/utils';
import { ActionBarService } from '@app/services';
import { DashboardFilters } from '@app/models/enums/dashboard-filters.enum';
import { DashboardFiltersHelper } from '@app/helpers/dashboard-filters.helper';

import { ClaimantDetailsRequest, ClaimantsListRequest } from '@app/modules/shared/_abstractions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { CreatePager, UpdatePager } from '@app/modules/shared/state/common.actions';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { DashboardComponentBase } from '../dashboard-component-base';
import { LienResolutionDashboardState } from './state/reducer';
import { actionBar } from '../../projects/state/selectors';
import { CreateOrUpdateProjectOverviewDashboardClaimantsRequest, UpdateActionBar } from '../../projects/state/actions';
import { LienResolutionDashboardClaimantsListComponent } from '../lien-resolution-dashboard-claimants-list/lien-resolution-dashboard-claimants-list.component';
import * as lienListActions from '../lien-resolution-dashboard-claimants-list/state/actions';
import * as selectors from './state/selectors';
import * as actions from './state/actions';
import { SetClaimantDetailsRequest } from '../../claimants/claimant-details/state/actions';
import { StatusChartColors } from '@app/models/enums/status-chart-colors.enum';
import { chartStylePresets } from '@app/models/fusion-charts/chart-style-presets';

@Component({
  selector: 'app-lien-resolution-dashboard',
  templateUrl: './lien-resolution-dashboard.component.html',
  styleUrls: ['./lien-resolution-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LienResolutionDashboardComponent extends
  DashboardComponentBase<
  LienResolutionDashboardState,
  ClaimantsListRequest,
  ClaimantDetailsRequest
  > implements OnInit, OnDestroy {

  relatedPage = RelatedPage.ClaimantsFromLienResolutionDashboard;
  @ViewChild(LienResolutionDashboardClaimantsListComponent)
    claimantListComponent: LienResolutionDashboardClaimantsListComponent;

  rootProductCategoryId = ProductCategory.MedicalLiens;

  public project$ = this.store$.select(selectors.projectDetails);

  private productStagesList$ = this.store$.select(selectors.productStagesList);
  private productPhasesList$ = this.store$.select(selectors.productPhasesList);

  public stagesSummary$ = this.store$.select(selectors.stagesSummary);
  public phasesSummary$ = this.store$.select(selectors.phasesSummary);
  public typesSummary$ = this.store$.select(selectors.typesSummary);

  public lienDashboardClearActionFilters$ = this.store$.select(selectors.lienDashboardClearActionFilters);

  public actionBar$ = this.store$.select(actionBar);

  selectedStages$ = this.store$.select(selectors.selectedStages);
  selectedPhases$ = this.store$.select(selectors.selectedPhases);
  public selectedTypes$ = this.store$.select(selectors.selectedTypes);

  public filtersProjectId$ = this.store$.select(selectors.filtersProjectId);
  private activeFilter$ = this.store$.select(selectors.activeFilter);

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

  public typesSummary: LienTypeSummary;
  public stagesSummary: LienStatusSummary;
  public phasesSummary: LienPhaseSummary;
  public selectedTypes: number[];

  productStageGroups = {
    finalized: {
      name: 'Finalized',
      enums: [ProductStageEnum.AgentFinalized, ProductStageEnum.SystemFinalized],
      color: StatusChartColors.Finalized,
    },
    pending: {
      name: 'Pending',
      enums: [ProductStageEnum.PendingFinalized, ProductStageEnum.Pending],
      color: StatusChartColors.Pending,
    },
  };

  constructor(
    store$: Store<LienResolutionDashboardState>,
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

    this.lienDashboardClearActionFilters$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(filters => {
      this.filters = filters;
      this.updateClearFilterOptionInActionBar(filters);
    });

    this.actionBarService.clearAllFilters.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => {
      this.clearFilters();
    });

    this.store$.dispatch(CreateOrUpdateProjectOverviewDashboardClaimantsRequest({ request: null }));

    this.actionsSubj.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$),
      ofType(lienListActions.GetClaimantsListSuccess)).subscribe(() => this.detectChanges());

    this.dataSubscription();
    this.actionBarClearFilterSubscription();
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
        const findStages = [];
        findStages.push(...this.productStageGroups.finalized.enums, ...this.productStageGroups.pending.enums);
        findStages.forEach(stageId => {
          this.allStages.push(stagesItems.find(i => i.id === stageId));
        });

        this.stagesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          this.stagesSummary = summary;
          this.stagesChart = this.getStagesChart(summary);
          this.detectChanges();
        });

        this.phasesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          this.phasesSummary = summary;
          this.phasesChart = this.getPhasesChart(summary);
          this.detectChanges();
        });

        this.typesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          // remove special characters because fusion charts converts it to html code which causes error at function typesDataplotClick()
          summary.types.forEach(i => i.name = i.name.replace(/[^\w\s\-]/g, ''));

          this.allTypes = this.getAllTypesFromTypesSummary(summary);
          this.typesSummary = summary;
          this.typesChart = this.getTypesChart(summary);
          this.detectChanges();
        });
      });
  }

  private getAllTypesFromTypesSummary(typesSummary: LienTypeSummary): IdValue[] {
    return typesSummary.types.filter(typeItem => typeItem.lienCount > 0).map(typeItem => ({id: typeItem.id, name: typeItem.name }));
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

  private initCharts() {
    zip(this.selectedStages$, this.selectedTypes$, this.selectedPhases$, this.filtersProjectId$, this.productPhasesList$, this.productStagesList$)
      .pipe(first())
      .subscribe(([selectedStages, selectedTypes, selectedPhases, filtersProjectId, productPhasesList, productStagesList]) => {
        if (filtersProjectId && filtersProjectId !== this.projectId) {
          this.clearFilters();
          return;
        }

        if (!selectedStages) { this.store$.dispatch(actions.GetStagesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienTypes: selectedTypes, lienPhases: selectedPhases })); }

        if (!selectedPhases) { this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienTypes: selectedTypes, lienPhases: selectedPhases, clientStages: selectedStages })); }

        if (!selectedTypes) { this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId, lienPhases: selectedPhases, clientStages: selectedStages })); }

        if (!productPhasesList) { this.store$.dispatch(actions.GetProductPhasesList({ productCategoryId: this.rootProductCategoryId })); }

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
    const selectedStageName = !event.dataObj.isSliced ? event.dataObj.categoryLabel : null;

    let selectedStages: number[];

    if (!!selectedStageName && this.productStageGroups.finalized.name === selectedStageName) {
      selectedStages = [...this.productStageGroups.finalized.enums];
    } else if (!!selectedStageName && this.productStageGroups.pending.name === selectedStageName) {
      selectedStages = [...this.productStageGroups.pending.enums];
    }

    this.updateChartData(DashboardFilters.Status, selectedStages, null, null);
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

  public updateActonFilters() {
    const allFilters: KeyValuePair<string, string>[] = DashboardFiltersHelper.updateDashboardActionFilters<ProductStageEnum>(this.selectedPhases, this.simplifyStagesForFilterView(this.selectedStages), this.selectedTypes, this.allPhases, this.simplifyStageNamesForFilterView(this.allStages), this.allTypes);
    this.updateFilterList(allFilters);
  }

  simplifyStagesForFilterView(selectedStages: ProductStageEnum[]): ProductStageEnum[] {
    let newSelectedStages: ProductStageEnum[] = [];

    if (!!this.selectedStages && selectedStages.length > 1) {
      newSelectedStages.push(selectedStages[0]);
    } else {
      newSelectedStages = selectedStages;
    }

    return newSelectedStages;
  }

  // only in-project of lien dashboard because lien pending consists of more than 1 stage
  simplifyStageNamesForFilterView(allStages: IdValue[]): IdValue[] {
    const newAllStages: IdValue[] = [...allStages];

    newAllStages.forEach(stageItem => {
      if (this.productStageGroups.finalized.enums.includes(stageItem.id)) {
        stageItem.name = this.productStageGroups.finalized.name;
      } else if (this.productStageGroups.pending.enums.includes(stageItem.id)) {
        stageItem.name = this.productStageGroups.pending.name;
      }
    });

    return newAllStages;
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

        if (this.activeFilter == null || this.activeFilter == DashboardFilters.Product) { this.typesChart = this.getTypesChart(this.typesSummary); }

        break;

      default:
        break;
    }

    this.updateActiveFilter(chartType);
    this.updateActonFilters();
  }

  public clearFilters(): void {
    this.claimantListComponent?.clearGridFilters();
    this.clearFields();

    this.dispatchSummaries();
    this.clearActiveFilter();
  }

  public clearOnlyChartFilters(): void {
    this.clearFields();
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
        label: this.productStageGroups.pending.name,
        value: item.pendingCount,
        isSliced: multiStages && this.selectedStages?.some(r => this.productStageGroups.pending.enums.includes(r)),
        color: this.productStageGroups.pending.color,
      });
    }

    if (item.finalizedCount > 0) {
      data.push({
        label: this.productStageGroups.finalized.name,
        value: item.finalizedCount,
        isSliced: multiStages && this.selectedStages?.some(r => this.productStageGroups.finalized.enums.includes(r)),
        color: this.productStageGroups.finalized.color,
      });
    }

    return {
      chart: { ...this.getPieChartDefinition(item, {}) },
      data,
    };
  }

  private getPhasesChart(phaseSummary: LienPhaseSummary) {
    const chartProps = { ...this.createDefaultCenterLabel(phaseSummary.lienCount, 'Liens') };

    return this.getPhasesChartDefinition(phaseSummary, chartProps, this.selectedPhases);
  }

  private getTypesChart(typeSummary: LienTypeSummary) {
    const chartProps = { canvasRightPadding: 100 };

    return this.getTypesChartDefinition(
      typeSummary,
      this.allTypes,
      this.allPhases,
      this.selectedPhases,
      this.selectedTypes,
      chartProps,
      chartStylePresets.stackedbar2dDashboard
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
    this.store$.dispatch(actions.UpdateLienDashboardClearActionFilters({ filters }));
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
