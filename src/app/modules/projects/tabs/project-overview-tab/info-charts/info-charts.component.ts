import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LienStatusSummary } from '@app/models';
import { ProjectTabWidgetColors } from '@app/models/enums';
import { ProductCategory } from '@app/models/enums/product-category.enum';

import { stagesSummary as resolutionStageSummary } from '@app/modules/liens-dashboards/release-dashboard/state/selectors';
import { ReleaseDashboardState } from '@app/modules/liens-dashboards/release-dashboard/state/reducer';
import { GetStagesSummary as GetReleaseStagesSummary } from '@app/modules/liens-dashboards/release-dashboard/state/actions';

import { stagesSummary as lienResolutionStageSummary } from '@app/modules/liens-dashboards/lien-resolution-dashboard/state/selectors';
import { GetStagesSummary as GetLienResolutionStagesSummary } from '@app/modules/liens-dashboards/lien-resolution-dashboard/state/actions';
import { LienResolutionDashboardState } from '@app/modules/liens-dashboards/lien-resolution-dashboard/state/reducer';

import { stagesSummary as bankruptcyStageSummary } from '@app/modules/liens-dashboards/bankruptcy-dashboard/state/selectors';
import { GetStagesSummary as GetBankruptcyStagesSummary } from '@app/modules/liens-dashboards/bankruptcy-dashboard/state/actions';
import { BankruptcyDashboardState } from '@app/modules/liens-dashboards/bankruptcy-dashboard/state/reducer';

import { statusesSummary as probateStageSummary } from '@app/modules/liens-dashboards/probate-dashboard/state/selectors';
import { GetStatusesSummary as GetProbateStagesSummary } from '@app/modules/liens-dashboards/probate-dashboard/state/actions';
import { ProbateDashboardState } from '@app/modules/liens-dashboards/probate-dashboard/state/reducer';

import { statusesSummary as qsfAdminStageSummary } from '@app/modules/liens-dashboards/qsf-admin-dashboard/state/selectors';
import { GetStatusesSummary as GetQsfAdminStagesSummary } from '@app/modules/liens-dashboards/qsf-admin-dashboard/state/actions';
import { QsfAdminDashboardState } from '@app/modules/liens-dashboards/qsf-admin-dashboard/state/reducer';

import { formatNumber } from '@angular/common';

@Component({
  selector: 'app-info-charts',
  templateUrl: './info-charts.component.html',
  styleUrls: ['./info-charts.component.scss'],
})

export class InfoChartsComponent implements OnChanges, OnDestroy {
  @Input()
    projectId: number;

  public releaseAdminChart;
  public releaseAdminEngaged;

  public lienResolutionChart;
  public lienResolutionEngaged;

  public bankruptcyChart;
  public bankruptcyEngaged;

  public probateChart;
  public probateEngaged;

  public qsfAdminChart;
  public qsfAdminEngaged;

  public legendItems;
  public showLegend;

  private readonly resolutionStageSummary$ = this.releaseStore.select(resolutionStageSummary);
  private readonly lienResolutionStageSummary$ = this.lienResolutionStore.select(lienResolutionStageSummary);
  private readonly bankruptcyStageSummary$ = this.bankruptcyDashboardState.select(bankruptcyStageSummary);
  private readonly probateStageSummary$ = this.probateDashboardState.select(probateStageSummary);
  private readonly qsfAdminStageSummary$ = this.qsfAdminDashboardState.select(qsfAdminStageSummary);

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly releaseStore: Store<ReleaseDashboardState>,
    private readonly lienResolutionStore: Store<LienResolutionDashboardState>,
    private readonly bankruptcyDashboardState: Store<BankruptcyDashboardState>,
    private readonly probateDashboardState: Store<ProbateDashboardState>,
    private readonly qsfAdminDashboardState: Store<QsfAdminDashboardState>,
  ) {
    this.clear();
    this.legendItems = this.getLegend();

    this.resolutionStageSummary$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((resolutionSS: LienStatusSummary) => {
      const releaseAdminChart = this.getChart(resolutionSS);
      this.releaseAdminChart = releaseAdminChart?.chartData;
      this.releaseAdminEngaged = releaseAdminChart?.isEngaged;
      this.showLegend = this.showLegend || releaseAdminChart?.isEngaged;
    });

    this.lienResolutionStageSummary$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((lienResolutionSS: LienStatusSummary) => {
      const lienResolutionChart = this.getChart(lienResolutionSS);
      this.lienResolutionChart = lienResolutionChart?.chartData;
      this.lienResolutionEngaged = lienResolutionChart?.isEngaged;
      this.showLegend = this.showLegend || lienResolutionChart?.isEngaged;
    });

    this.bankruptcyStageSummary$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((bankruptcySS: LienStatusSummary) => {
      const bankruptcyChart = this.getChart(bankruptcySS);
      this.bankruptcyChart = bankruptcyChart?.chartData;
      this.bankruptcyEngaged = bankruptcyChart?.isEngaged;
      this.showLegend = this.showLegend || bankruptcyChart?.isEngaged;
    });

    this.probateStageSummary$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((probateSS: LienStatusSummary) => {
      const probateChart = this.getChart(probateSS);
      this.probateChart = probateChart?.chartData;
      this.probateEngaged = probateChart?.isEngaged;
      this.showLegend = this.showLegend || probateChart?.isEngaged;
    });

    this.qsfAdminStageSummary$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((qsfAdminSS: LienStatusSummary) => {
      const qsfAdminChart = this.getChart(qsfAdminSS);
      this.qsfAdminChart = qsfAdminChart?.chartData;
      this.qsfAdminEngaged = qsfAdminChart?.isEngaged;
      this.showLegend = this.showLegend || qsfAdminChart?.isEngaged;
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.clear();

    if (changes?.projectId?.currentValue) {
      const projectId = changes.projectId.currentValue;
      this.releaseStore.dispatch(GetReleaseStagesSummary({ rootProductCategoryId: ProductCategory.Release, projectId, bypassSpinner: true }));
      this.lienResolutionStore.dispatch(GetLienResolutionStagesSummary({ rootProductCategoryId: ProductCategory.MedicalLiens, projectId, bypassSpinner: true }));
      this.bankruptcyDashboardState.dispatch(GetBankruptcyStagesSummary({ rootProductCategoryId: ProductCategory.Bankruptcy, projectId, bypassSpinner: true }));
      this.probateDashboardState.dispatch(GetProbateStagesSummary({ rootProductCategoryId: ProductCategory.Probate, projectId, bypassSpinner: true }));
      this.qsfAdminDashboardState.dispatch(GetQsfAdminStagesSummary({ rootProductCategoryId: ProductCategory.QSFAdministration, projectId, bypassSpinner: true }));
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private clear(): void {
    this.showLegend = false;
    this.releaseAdminChart = null;
    this.releaseAdminEngaged = false;
    this.lienResolutionChart = null;
    this.lienResolutionEngaged = false;
    this.bankruptcyChart = null;
    this.bankruptcyEngaged = false;
    this.probateChart = null;
    this.probateEngaged = false;
    this.qsfAdminChart = null;
    this.qsfAdminEngaged = false;
  }

  private getLegend() {
    const legend = [];
    legend.push({ label: 'Finalized', color: ProjectTabWidgetColors.Finalized });
    legend.push({ label: 'Pending', color: ProjectTabWidgetColors.Pending });
    return legend;
  }

  private getChart(statusSummary: LienStatusSummary) {
    const chartData = (statusSummary?.finalizedCount === 0 && statusSummary?.pendingCount === 0)
      ? null
      : this.getChartBase(
        this.getData(statusSummary?.finalizedCount, statusSummary?.pendingCount),
        { defaultCenterLabel: `Claimants ${formatNumber(statusSummary?.totalCount, 'en-US')}` },
      );
    const isEngaged = statusSummary?.isEngaged;
    return { chartData, isEngaged };
  }

  private getData(finalized:number, pending:number) {
    const retVal = [];
    retVal.push({
      value: finalized,
      label: 'Finalized',
      color: ProjectTabWidgetColors.Finalized,
    }, {
      value: pending,
      label: 'Pending',
      color: ProjectTabWidgetColors.Pending,
    });
    return retVal;
  }

  private getChartBase(dataset:Array<any>, other?) {
    return {
      chart: {
        theme: 'fusion',
        animation: true,
        enableMultiSlicing: false,
        labelDistance: 0,
        pieRadius: 80,
        showLegend: false,
        showTooltip: true,
        showLabels: true,
        startingAngle: 90,
        toolTipBgAlpha: 90,
        canvasPadding: 10,
        labelFontSize: 11,
        centerLabelFontSize: 11,
        valueFontSize: 11,
        centerLabelBold: true,
        decimals: 0,
        labelFontColor: ProjectTabWidgetColors.Label,
        maxLabelHeight: 25,
        plotToolText: '$label: <b>$dataValue</b>',
        slicingDistance: 15,
        ...other,
      },
      data: dataset,
    };
  }
}
