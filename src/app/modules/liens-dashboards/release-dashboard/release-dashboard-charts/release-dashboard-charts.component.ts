import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewRef, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, zip } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { LienStatusSummary, LienPhaseSummary, LienPhase, IdValue } from '@app/models';
import { ReleaseStage as ProductStageEnum } from '@app/models/enums/release-stage.enum';
import { ProductCategory } from '@app/models/enums/product-category.enum';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { ReleaseDashboardState } from '../state/reducer';
import { ReleaseInGoodOrderSummary } from '@app/models/liens/release-in-good-order-summary';
import { ReleaseInGoodOrder } from '@app/models/liens/release-in-good-order';
import { PieChartDataItem } from '@app/models/fusion-charts/pie-chart-data-item';
import { ChartUtilsBase } from '../../chart-utils-base';
import { StatusChartColors } from '@app/models/enums/status-chart-colors.enum';
import { FusionPieChart } from '@app/models/fusion-charts/fusion-pie-chart';
import { chartStylePresets } from '@app/models/fusion-charts/chart-style-presets';

@Component({
  selector: 'app-release-dashboard-charts',
  templateUrl: './release-dashboard-charts.component.html',
  styleUrl: './release-dashboard-charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReleaseDashboardChartsComponent extends ChartUtilsBase implements OnInit, OnDestroy {
  @Input() projectId: number;
  rootProductCategoryId = ProductCategory.Release;

  private readonly productStagesList$ = this.store$.select(selectors.productStagesList);
  private readonly productPhasesList$ = this.store$.select(selectors.productPhasesList);

  public stagesSummary$ = this.store$.select(selectors.stagesSummary);
  public phasesSummary$ = this.store$.select(selectors.phasesSummary);
  public releaseInGoodOrderSummary$ = this.store$.select(selectors.releaseInGoodOrderSummary);

  public stagesChart;
  public phasesChart;
  public releaseInGoodOrderChart;

  public allPhases: LienPhase[] = [];
  public allStages: IdValue[] = [];

  public stagesSummary: LienStatusSummary;
  public phasesSummary: LienPhaseSummary;
  public ngUnsubscribe$ = new Subject<void>();

  public yesReleaseInGoodOrder: ReleaseInGoodOrder = {
    name: 'Yes',
    value: 0,
    color: StatusChartColors.Finalized,
    isReleaseInGoodOrder: true
  };

  public noReleaseInGoodOrder: ReleaseInGoodOrder = {
    name: 'No',
    value: 0,
    color: StatusChartColors.Pending,
    isReleaseInGoodOrder: false
  };

  constructor(
    private readonly store$: Store<ReleaseDashboardState>,
    private changeRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.dataSubscription();
    this.initCharts();
  }

  private dataSubscription(): void {
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
          this.stagesSummary = summary;
          this.stagesChart = this.getStagesChart(summary);
          this.detectChanges();
        });

        this.phasesSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          this.phasesSummary = summary;
          this.phasesChart = this.getPhasesChart(summary);
          this.detectChanges();
        });

        this.releaseInGoodOrderSummary$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(summary => {
          this.releaseInGoodOrderChart = this.getGoodOrderChartDefinition(summary);
          this.detectChanges();
        });

      });
  }

  private initCharts(): void {
        this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId}));

        this.store$.dispatch(actions.GetProductPhasesList({ productCategoryId: this.rootProductCategoryId }));
        this.store$.dispatch(actions.GetProductStagesList({ productCategoryId: this.rootProductCategoryId }));

        this.store$.dispatch(actions.GetReleaseInGoodOrderSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId}));
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
    const chartProps = { ...this.createDefaultCenterLabel(phaseSummary.lienCount, 'Releases', true) };
    return this.getPhasesChartDefinition(phaseSummary, chartProps, null, chartStylePresets.compact);
  }

  private detectChanges(): void {
    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      setTimeout(() => this.changeRef && this.changeRef.detectChanges());
    }
  }

  private getGoodOrderChartDefinition(releaseInGoodOrderSummary: ReleaseInGoodOrderSummary): FusionPieChart {

    this.yesReleaseInGoodOrder.value = releaseInGoodOrderSummary.yesCount;
    this.noReleaseInGoodOrder.value = releaseInGoodOrderSummary.noCount;

    const optionalChartProps = {
       ...this.createDefaultCenterLabel(releaseInGoodOrderSummary.totalCount, 'Releases', true),
       startingAngle: '150',
    };

    const itemYes: PieChartDataItem = {
      label: this.yesReleaseInGoodOrder.name,
      tooltext: `${this.yesReleaseInGoodOrder.name}: <b>${this.yesReleaseInGoodOrder.value.toString()}</b> ($percentValue)`,
      value: this.yesReleaseInGoodOrder.value,
      isSliced: false,
      color: this.yesReleaseInGoodOrder.color,
    }

    const itemNo: PieChartDataItem = {
      label: this.noReleaseInGoodOrder.name,
      tooltext: `${this.noReleaseInGoodOrder.name}: <b>${this.noReleaseInGoodOrder.value.toString()}</b> ($percentValue)`,
      value: this.noReleaseInGoodOrder.value,
      isSliced: false,
      color: this.noReleaseInGoodOrder.color,
    }

    const dataArr: PieChartDataItem[] = [itemYes, itemNo];
    const pieChart = new FusionPieChart(dataArr, {...this.getPieChartDefinition(releaseInGoodOrderSummary, optionalChartProps, chartStylePresets.compact )});
    return pieChart;
  }

  public ngOnDestroy(): void {
    this.changeRef = null;

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
