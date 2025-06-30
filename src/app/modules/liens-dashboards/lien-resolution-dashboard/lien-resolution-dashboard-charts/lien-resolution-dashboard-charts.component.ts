import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewRef } from '@angular/core';
import { IdValue, LienPhase, LienPhaseSummary, LienStatusSummary, LienTypeSummary } from '@app/models';
import { LienResolutionStage as ProductStageEnum } from '@app/models/enums/lien-resolution-stage.enum';
import { ProductCategory } from '@app/models/enums/product-category.enum';
import { StatusChartColors } from '@app/models/enums/status-chart-colors.enum';
import { Store } from '@ngrx/store';
import { combineLatest, Subject, zip } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ChartUtilsBase } from '../../chart-utils-base';
import * as actions from '../state/actions';
import { LienResolutionDashboardState } from '../state/reducer';
import * as selectors from '../state/selectors';
import { chartStylePresets } from '@app/models/fusion-charts/chart-style-presets';

@Component({
  selector: 'app-lien-resolution-dashboard-charts',
  templateUrl: './lien-resolution-dashboard-charts.component.html',
  styleUrl: './lien-resolution-dashboard-charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LienResolutionDashboardChartsComponent extends ChartUtilsBase implements OnInit, OnDestroy {
  @Input() projectId: number;
  private readonly rootProductCategoryId = ProductCategory.MedicalLiens;

  private readonly productStagesList$ = this.store$.select(selectors.productStagesList);
  private readonly productPhasesList$ = this.store$.select(selectors.productPhasesList);

  public stagesSummary$ = this.store$.select(selectors.stagesSummary);
  public phasesSummary$ = this.store$.select(selectors.phasesSummary);
  public typesSummary$ = this.store$.select(selectors.typesSummary);

  public stagesChart;
  public phasesChart;
  public typesChart;

  public allStages: IdValue[] = [];
  public allPhases: LienPhase[] = [];
  public allTypes: IdValue[] = [];

  public stagesSummary: LienStatusSummary;
  public phasesSummary: LienPhaseSummary;
  public typesSummary: LienTypeSummary;
  public ngUnsubscribe$ = new Subject<void>();

  public productStageGroups = {
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
    private readonly store$: Store<LienResolutionDashboardState>,
    private changeRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.dataSubscription();
    this.initCharts();
  }

  private dataSubscription() {
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

        combineLatest([
          this.stagesSummary$,
          this.phasesSummary$,
          this.typesSummary$,
        ]).pipe(
          filter(([stagesSummary, phasesSummary, typesSummary]) => !!stagesSummary && !!phasesSummary && !!typesSummary),
          takeUntil(this.ngUnsubscribe$),
        ).subscribe(([stagesSummary, phasesSummary, typesSummary]) => {

            this.stagesSummary = stagesSummary;
            this.phasesSummary = phasesSummary;

            // remove special characters because fusion charts converts it to html code which causes error at function typesDataplotClick()
            typesSummary.types.forEach(i => i.name = i.name.replace(/[^\w\s\-]/g, ''));
            this.allTypes = this.getAllTypesFromTypesSummary(typesSummary);
            this.typesSummary = typesSummary;

            this.stagesChart = this.getStagesChart(stagesSummary);
            this.phasesChart = this.getPhasesChart(phasesSummary);
            this.typesChart = this.getTypesChart(typesSummary);

            this.detectChanges();
        });
      });
  }

  private getAllTypesFromTypesSummary(typesSummary: LienTypeSummary): IdValue[] {
    return typesSummary.types.filter(typeItem => typeItem.lienCount > 0).map(typeItem => ({id: typeItem.id, name: typeItem.name }));
  }

  private initCharts(): void {
        this.store$.dispatch(actions.GetPhasesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId}));
        this.store$.dispatch(actions.GetTypesSummary({ rootProductCategoryId: this.rootProductCategoryId, projectId: this.projectId }));

        this.store$.dispatch(actions.GetProductPhasesList({ productCategoryId: this.rootProductCategoryId }));
        this.store$.dispatch(actions.GetProductStagesList({ productCategoryId: this.rootProductCategoryId }));
  }

  private getStagesChart(item: LienStatusSummary) {
    const data = [];
    const multiStages = item.pendingCount > 0 && item.finalizedCount > 0;

    const chartProps = { ...this.createDefaultCenterLabel(item.totalCount, 'Claimants', true) };

    if (item.pendingCount > 0) {
      data.push({
        label: this.productStageGroups.pending.name,
        value: item.pendingCount,
        isSliced: multiStages,
        color: this.productStageGroups.pending.color,
      });
    }

    if (item.finalizedCount > 0) {
      data.push({
        label: this.productStageGroups.finalized.name,
        value: item.finalizedCount,
        isSliced: multiStages,
        color: this.productStageGroups.finalized.color,
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
    const chartProps = { canvasRightPadding: 100 };

    return this.getTypesChartDefinition(typeSummary, this.allTypes, this.phasesSummary?.phases, null, null, chartProps, chartStylePresets.stackedbar2dDashboard);
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
