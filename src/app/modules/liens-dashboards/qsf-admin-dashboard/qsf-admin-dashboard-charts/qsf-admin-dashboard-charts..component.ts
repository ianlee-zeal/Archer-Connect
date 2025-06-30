import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewRef, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { LienStatusSummary, IdValue, LienTypeSummary } from '@app/models';
import { ProductCategory } from '@app/models/enums/product-category.enum';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { ChartUtilsBase } from '../../chart-utils-base';
import { QsfAdminDashboardState } from '../state/reducer';
import { QsfAdminStage } from '@app/models/enums/qsf-admin-stage.enum';
import { QsfAdminPhase } from '@app/models/enums/qsf-admin-phase.enum';
import { QsfAdminPhaseSummary } from '@app/models/liens/qsf-admin-phase-summary';
import { TotalPaymentChartData } from '@app/models/liens/total-payment-chart-data';
import { chartStylePresets } from '@app/models/fusion-charts/chart-style-presets';
import { StatusChartColors } from '@app/models/enums/status-chart-colors.enum';

@Component({
    selector: 'app-qsf-admin-dashboard-charts',
    templateUrl: './qsf-admin-dashboard-charts.component.html',
    styleUrl: './qsf-admin-dashboard-charts.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QsfAdminDashboardChartsComponent extends ChartUtilsBase implements OnInit, OnDestroy {
    @Input() projectId: number;
    rootProductCategoryId = ProductCategory.Bankruptcy;

    public stagesSummary$ = this.store$.select(selectors.statusesSummary);
    public phasesSummary$ = this.store$.select(selectors.phasesSummary);
    public totalPaymentChartData$ = this.store$.select(selectors.totalPaymentChartData);

    public stagesChart;
    public phasesChart;
    public totalPaymentChart;

    public allPhases: IdValue[] = [
        new IdValue(QsfAdminPhase.Paid, 'Total F&E Paid'),
        new IdValue(QsfAdminPhase.Unpaid, 'Total F&E Unpaid'),
        new IdValue(QsfAdminPhase.NoData, 'No F&E Data'),
    ];
    public allStages: IdValue[] = [
        new IdValue(QsfAdminStage.Pending, 'Pending'),
        new IdValue(QsfAdminStage.Finalized, 'Finalized'),
    ];

    public allTypes: IdValue[] = [];

    public stagesSummary: LienStatusSummary;
    public phasesSummary: QsfAdminPhaseSummary;
    public typesSummary: LienTypeSummary;
    public totalPaymentChartSummary: TotalPaymentChartData;
    public ngUnsubscribe$ = new Subject<void>();

    constructor(
        private readonly store$: Store<QsfAdminDashboardState>,
        private changeRef: ChangeDetectorRef,
    ) {
        super();
    }

    ngOnInit(): void {
        this.dataSubscription();
        this.initCharts();
    }

    private dataSubscription(): void {
        combineLatest([this.stagesSummary$, this.phasesSummary$, this.totalPaymentChartData$])
            .pipe(
                filter(([stagesItems, phasesItems, totalPaymentChartData]) => !!stagesItems && !!phasesItems && !!totalPaymentChartData),
                takeUntil(this.ngUnsubscribe$),
            )
            .subscribe(([stagesItems, phasesItems, totalPaymentChartData]) => {

                this.stagesSummary = stagesItems;
                this.phasesSummary = phasesItems;
                this.totalPaymentChartSummary = totalPaymentChartData;

                this.stagesChart = this.getStagesChart(stagesItems);
                this.phasesChart = this.getPhasesChart(phasesItems);
                this.totalPaymentChart = this.getTotalPaymentChart(totalPaymentChartData);

                this.detectChanges();
            });
    }

    private initCharts(): void {
        this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));
    }

    private getStagesChart(item: LienStatusSummary): any {
        const data = [];
        const multiStatuses = item.pendingCount > 0 && item.finalizedCount > 0;

        const chartProps = { ...this.createDefaultCenterLabel(item.totalCount, 'Claimants', true) };

        if (item.pendingCount > 0) {
            data.push({
                label: this.allStages.find(i => i.id === QsfAdminStage.Pending).name,
                value: item.pendingCount,
                isSliced: multiStatuses,
                color: this.getStageColor(QsfAdminStage.Pending),
            });
        }

        if (item.finalizedCount > 0) {
            data.push({
                label: this.allStages.find(i => i.id === QsfAdminStage.Finalized).name,
                value: item.finalizedCount,
                isSliced: multiStatuses,
                color: this.getStageColor(QsfAdminStage.Finalized),
            });
        }

        return {
            chart: { ...this.getPieChartDefinition(item, chartProps, chartStylePresets.compact ) },
            data,
        };
    }

    private getPhasesChart(phaseSummary: QsfAdminPhaseSummary) {
        const data = [];
        const phaseSummaryCount = phaseSummary.paid + phaseSummary.unpaid + phaseSummary.noData;
        const multiStatuses = phaseSummaryCount > 0;

        const chartProps = { ...this.createDefaultCenterLabel(phaseSummaryCount, 'Claimants', true) };

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
            chart: { ...this.getPieChartDefinition(phaseSummary, chartProps, chartStylePresets.compact) },
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
            isSliced: multiStatuses,
            color: this.getPhaseColor(phase),
        };
    }

    public getPhaseColor(phaseId: number): StatusChartColors {
        switch (phaseId) {
            case QsfAdminPhase.Paid: return StatusChartColors.Finalized;
            case QsfAdminPhase.Unpaid: return StatusChartColors.Pending;
            case QsfAdminPhase.NoData: return StatusChartColors.Default;

            default: return StatusChartColors.Default;
        }
    }

    private getTotalPaymentChart(summary: TotalPaymentChartData): any {
        return this.getTotalPaymentChartDefinition(summary);
    }

    public getStageColor(stageId: number): StatusChartColors {
        switch (stageId) {
            case QsfAdminStage.Pending: return StatusChartColors.Pending;
            case QsfAdminStage.Finalized: return StatusChartColors.Finalized;
        }
    }

    public getCombinedLegend(): { name: string, color: string }[] {
        const status = this.allStages?.map(stage => ({
            name: stage.name,
            color: this.getStageColor(stage.id)
        })) || [];

        const phases = this.allPhases?.map(phase => ({
             name: phase.name,
             color: this.getPhaseColor(phase.id)
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
