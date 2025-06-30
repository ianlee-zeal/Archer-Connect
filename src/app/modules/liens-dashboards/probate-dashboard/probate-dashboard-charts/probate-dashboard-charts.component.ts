import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewRef, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { Subject, zip } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { LienStatusSummary, LienPhaseSummary, LienTypeSummary, LienPhase, IdValue } from '@app/models';
import { ProbateStage as ProductStageEnum } from '@app/models/enums/probate-stage.enum';
import { ProductCategory } from '@app/models/enums';
import { ProbateDashboardState } from '../state/reducer';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { ChartUtilsBase } from '../../chart-utils-base';
import { StatusChartColors } from '@app/models/enums/status-chart-colors.enum';
import { chartStylePresets } from '@app/models/fusion-charts/chart-style-presets';

@Component({
  selector: 'app-probate-dashboard-charts',
  templateUrl: './probate-dashboard-charts.component.html',
  styleUrls: ['./probate-dashboard-charts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProbateDashboardChartsComponent extends ChartUtilsBase implements OnInit, OnDestroy {
  @Input() projectId: number;

  rootProductCategoryId = ProductCategory.Probate;

  private readonly productStagesList$ = this.store$.select(selectors.productStagesList);
  private readonly productPhasesList$ = this.store$.select(selectors.productPhasesList);
  private readonly productTypesList$ = this.store$.select(selectors.productTypesList);

  public stagesSummary$ = this.store$.select(selectors.statusesSummary);
  public phasesSummary$ = this.store$.select(selectors.phasesSummary);
  public typesSummary$ = this.store$.select(selectors.typesSummary);

  public ngUnsubscribe$ = new Subject<void>();

  public allTypes: IdValue[] = [];
  public allPhases: LienPhase[] = [];
  public allStages: IdValue[] = [];
  public stagesChart;
  public phasesChart;
  public typesChart;

  public stagesSummary: LienStatusSummary;
  public phasesSummary: LienPhaseSummary;
  public typesSummary: LienTypeSummary;

  constructor(
    private readonly store$: Store<ProbateDashboardState>,
    private changeRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
    this.dataSubscription();
    this.initCharts();
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
        this.allStages.push(stagesItems.find(i => i.id === (ProductStageEnum.finalized)));
        this.allStages.push(stagesItems.find(i => i.id === (ProductStageEnum.pending)));

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

  private initCharts() {
    this.store$.dispatch(actions.GetPhasesSummary({
      rootProductCategoryId: this.rootProductCategoryId,
      projectId: this.projectId
    }));

    this.store$.dispatch(actions.GetTypesSummary({
      rootProductCategoryId: this.rootProductCategoryId,
      projectId: this.projectId
    }));

    this.store$.dispatch(actions.GetProductPhasesList({ productCategoryId: this.rootProductCategoryId }));

    this.store$.dispatch(actions.GetProductTypesList({ productCategoryId: this.rootProductCategoryId }));

    this.store$.dispatch(actions.GetProductStagesList({ productCategoryId: this.rootProductCategoryId }));
  }

  private getStagesChart(item: LienStatusSummary) {
    const data = [];
    const multiStatuses = item.pendingCount > 0 && item.finalizedCount > 0;

    const chartProps = { ...this.createDefaultCenterLabel(item.totalCount, 'Claimants', true) };

    if (item.pendingCount > 0) {
      data.push({
        label: this.allStages.find(i => i.id === ProductStageEnum.pending).name,
        value: item.pendingCount,
        isSliced: multiStatuses,
        color: this.getStageColor(ProductStageEnum.pending),
      });
    }

    if (item.finalizedCount > 0) {
      data.push({
        label: this.allStages.find(i => i.id === ProductStageEnum.finalized).name,
        value: item.finalizedCount,
        isSliced: multiStatuses,
        color: this.getStageColor(ProductStageEnum.finalized),
      });
    }

    return {
      chart: { ...this.getPieChartDefinition(item, chartProps, chartStylePresets.compact) },
      data,
    };
  }

  private getPhasesChart(phaseSummary: LienPhaseSummary) {

    const chartProps = { ...this.createDefaultCenterLabel(phaseSummary.lienCount, 'Liens', true) };

    return this.getPhasesChartDefinition(phaseSummary, chartProps, null, chartStylePresets.compact);

  }

  private getTypesChart(typeSummary: LienTypeSummary) {
    return this.getTypesChartDefinition(typeSummary, this.allTypes, this.allPhases, null, null, null, chartStylePresets.stackedcolumn2dDashboard);
  }


  public getStageColor(stageId: number): StatusChartColors {
    switch (stageId) {
      case ProductStageEnum.pending: return StatusChartColors.Pending;
      case ProductStageEnum.finalized: return StatusChartColors.Finalized;
    }
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
