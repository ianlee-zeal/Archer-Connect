import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewRef, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, zip } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { LienStatusSummary, LienPhaseSummary, LienPhase, IdValue, LienTypeSummary } from '@app/models';
import { ProductCategory } from '@app/models/enums/product-category.enum';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { ChartUtilsBase } from '../../chart-utils-base';
import { StatusChartColors } from '@app/models/enums/status-chart-colors.enum';
import { BankruptcyDashboardState } from '../state/reducer';
import { BankruptcyStage as ProductStageEnum } from '@app/models/enums/bankruptcy-stage.enum';
import { chartStylePresets } from '@app/models/fusion-charts/chart-style-presets';

@Component({
  selector: 'app-bankruptcy-dashboard-charts',
  templateUrl: './bankruptcy-dashboard-charts.component.html',
  styleUrl: './bankruptcy-dashboard-charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankruptcyDashboardChartsComponent extends ChartUtilsBase implements OnInit, OnDestroy {
  @Input() projectId: number;
  rootProductCategoryId = ProductCategory.Bankruptcy;

  private readonly productStagesList$ = this.store$.select(selectors.productStagesList);
  private readonly productPhasesList$ = this.store$.select(selectors.productPhasesList);
  private readonly productTypesList$ = this.store$.select(selectors.productTypesList);

  public stagesSummary$ = this.store$.select(selectors.stagesSummary);
  public phasesSummary$ = this.store$.select(selectors.phasesSummary);
  public typesSummary$ = this.store$.select(selectors.typesSummary);

  public stagesChart;
  public phasesChart;
  public typesChart;

  public allPhases: LienPhase[] = [];
  public allStages: IdValue[] = [];
  public allTypes: IdValue[] = [];

  public stagesSummary: LienStatusSummary;
  public phasesSummary: LienPhaseSummary;
  public typesSummary: LienTypeSummary;
  public ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store$: Store<BankruptcyDashboardState>,
    private changeRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.dataSubscription();
    this.initCharts();
  }

  private dataSubscription(): void {
    zip(this.productPhasesList$, this.productStagesList$, this.productTypesList$)
      .pipe(
        filter(([phasesItems, stagesItems, typesItems]) => !!phasesItems && !!stagesItems && !!typesItems),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(([phasesItems, stagesItems, typesItems]) => {
        this.allPhases = phasesItems;
        this.allTypes = typesItems;

        this.allStages = [];
        this.allStages.push(stagesItems.find(i => i.id === (ProductStageEnum.Pending)));
        this.allStages.push(stagesItems.find(i => i.id === (ProductStageEnum.Finalized)));

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
          this.typesSummary = summary;
          this.typesChart = this.getTypesChart(summary);
          this.detectChanges();
        });

      });
  }

  private initCharts(): void {
        this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId}));

        this.store$.dispatch(actions.GetProductPhasesList({ productCategoryId: this.rootProductCategoryId }));
        this.store$.dispatch(actions.GetProductStagesList({ productCategoryId: this.rootProductCategoryId }));

        this.store$.dispatch(actions.GetProductTypesList({ productCategoryId: this.rootProductCategoryId }));
        this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId}));
  }

  private getStagesChart(item: LienStatusSummary) {
    const data = [];
    const multiStages = item.pendingCount > 0 && item.finalizedCount > 0;

    const chartProps = { ...this.createDefaultCenterLabel(item.totalCount, 'Claimants', true) };

    if (item.pendingCount > 0) {
      data.push({
        label: this.allStages.find(i => i.id === ProductStageEnum.Pending).name,
        value: item.pendingCount,
        isSliced: multiStages,
        color: this.getStageColor(ProductStageEnum.Pending),
      });
    }

    if (item.finalizedCount > 0) {
      data.push({
        label: this.allStages.find(i => i.id === ProductStageEnum.Finalized).name,
        value: item.finalizedCount,
        isSliced: multiStages,
        color: this.getStageColor(ProductStageEnum.Finalized),
      });
    }

    return {
      chart: { ...this.getPieChartDefinition(item, chartProps, chartStylePresets.compact ) },
      data,
    };
  }

  private getPhasesChart(phaseSummary: LienPhaseSummary) {
    const chartProps = { ...this.createDefaultCenterLabel(phaseSummary.lienCount, 'Bankruptcies', true) };
    return this.getPhasesChartDefinition(phaseSummary, chartProps, null, chartStylePresets.compact );
  }

  private getTypesChart(typeSummary: LienTypeSummary) {
    return this.getTypesChartDefinition(
      typeSummary,
      this.allTypes,
      this.allPhases,
      null,
      null,
      {},
      chartStylePresets.orangeDash,
    );
  }

  public getStageColor(stageId: number): StatusChartColors {
    switch (stageId) {
      case ProductStageEnum.Pending: return StatusChartColors.Pending;
      case ProductStageEnum.Finalized: return StatusChartColors.Finalized;
    }
  }

  public getCombinedLegend(): { name: string, color: string }[] {
    const status = this.allStages?.map(stage => ({
      name: stage.name,
      color: this.getStageColor(stage.id)
    })) || [];

    const phases = this.phasesSummary?.phases?.map(phase => ({
      name: phase.name,
      color: phase.hexColor
    })) || [];

    return [...status, ...phases];
  }

  private detectChanges(): void {
    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      setTimeout(() => this.changeRef && this.changeRef.detectChanges());
    }
  }

  public ngOnDestroy(): void {
    this.changeRef = null;

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
