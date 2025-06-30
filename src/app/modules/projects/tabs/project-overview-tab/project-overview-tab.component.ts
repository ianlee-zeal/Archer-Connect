import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { first, filter, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';

import { ProjectOverviewDashboardConfig, DashboardData, DashboardEventData, FinalizationCount } from '@app/models/dashboards';
import { DashboardRow, ProjectOverviewDashboardSearchOptions, InfoBlockItem } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { RelatedPage } from '@app/modules/shared/grid-pager';

import * as commonActions from '@app/modules/shared/state/common.actions';
import * as rootActions from '@app/state/root.actions';
import { GridId } from '@app/models/enums/grid-id.enum';
import { IDictionary } from '@app/models/utils/dictionary';
import { DeficienciesWidgetData } from '@app/models/dashboards/deficiencies-response';
import * as actions from '../../state/actions';
import * as fromProjects from '../../state';
import * as selectors from '../../state/selectors';

import * as lrdActions from '../../../liens-dashboards/lien-resolution-dashboard/state/actions';
import * as bdActions from '../../../liens-dashboards/bankruptcy-dashboard/state/actions';
import * as pdActions from '../../../liens-dashboards/probate-dashboard/state/actions';
import * as rdActions from '../../../liens-dashboards/release-dashboard/state/actions';

/**
 * Main component for showing of project overview data
 *
 * @export
 * @class ProjectOverviewTabComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-project-overview-tab',
  templateUrl: './project-overview-tab.component.html',
  styleUrls: ['./project-overview-tab.component.scss'],
})
export class ProjectOverviewTabComponent implements OnInit, OnDestroy {
  public dashboardData: DashboardData;
  public dashboardDataByPhase: DashboardData;
  public projectOverviewStatistics: InfoBlockItem[];
  public recentFinalizationsCounts: IDictionary<number, FinalizationCount>;
  public deficienciesWidgetData: DeficienciesWidgetData;
  private isExpanded = true;

  private actionBar: ActionHandlersMap;

  public readonly isDashboardStatisticsLoaded$ = this.store.select(selectors.isDashboardStatisticsLoaded);

  private ngUnsubscribe$ = new Subject<void>();

  /**
   * Current project id
   *
   * @public
   * @type {number}
   * @memberof ProjectOverviewTabComponent
   */
  public projectId: number;

  /**
   * Gets the observable of the project dashboard data
   *
   * @memberof ProjectOverviewTabComponent
   */
  readonly dashboardData$ = this.store.select(selectors.projectOverviewDashboard);
  readonly dashboardDataByPhase$ = this.store.select(selectors.projectOverviewDashboardByPhase);
  readonly recentFinalizationsCounts$ = this.store.select(selectors.recentFinalizationsCounts);
  readonly deficienciesWidgetData$ = this.store.select(selectors.deficienciesWidgetData);

  /**
   * Gets the observable of currently selected project
   *
   * @memberof ProjectOverviewTabComponent
   */
  readonly item$ = this.store.select(selectors.item);

  /**
   * Gets the observable of current action bar
   *
   * @memberof ProjectOverviewTabComponent
   */
  readonly actionBar$ = this.store.select(selectors.actionBar);

  /**
   * Gets the observable of expanded
   *
   * @memberof ProjectOverviewTabComponent
   */
  readonly isExpanded$ = this.store.select(selectors.isExpanded);

  /**
   * Gets the project overview dashboard config
   *
   * @memberof ProjectOverviewTabComponent
   */
  readonly config = new ProjectOverviewDashboardConfig(true);

  private canToggleCollapsibility: boolean;

  /**
   * Creates an instance of ProjectOverviewTabComponent.
   * @param {Store<fromProjects.AppState>} _store - current app state
   * @param {Router} router - the router object
   * @memberof ProjectOverviewTabComponent
   */
  constructor(
    private readonly store: Store<fromProjects.AppState>,
    private readonly router: Router,
  ) {}

  /** @inheritdoc */
  ngOnInit(): void {
    combineLatest([this.item$, this.dashboardDataByPhase$])
      .pipe(
        filter(([item, dashboardDataByPhase]) => item && dashboardDataByPhase && item.id === dashboardDataByPhase.projectId),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(([, dashboardDataByPhase]) => {
        this.dashboardDataByPhase = dashboardDataByPhase;
        this.canToggleCollapsibility = dashboardDataByPhase.rows?.length > 0;
        this.store.dispatch(actions.UpdateActionBar({ actionBar: this.getActionBar(this.actionBar, dashboardDataByPhase.expandable) }));
      });

    combineLatest([this.item$, this.recentFinalizationsCounts$])
      .pipe(
        filter(([item, recentFinalizationsCounts]) => item && !!recentFinalizationsCounts),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(([, recentFinalizationsCounts]) => {
        this.recentFinalizationsCounts = recentFinalizationsCounts;
      });

    combineLatest([this.item$, this.deficienciesWidgetData$])
      .pipe(
        filter(([item, deficienciesWidgetData]) => item && !!deficienciesWidgetData),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(([, deficienciesWidgetData]) => {
        this.deficienciesWidgetData = deficienciesWidgetData;
      });

    this.item$.pipe(
      filter(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(item => {
      this.projectId = item.id;

      if (!this.dashboardDataByPhase || this.projectId !== this.dashboardDataByPhase.projectId) {
        // this.store.dispatch(actions.GetProjectOverviewDashboardClaimantDetails({ projectId: this.projectId }));
        this.store.dispatch(actions.GetProjectOverviewDashboardClaimantDetailsByPhase({ projectId: this.projectId, bypassSpinner: true }));
        //this.store.dispatch(actions.GetFinalizationCounts({ projectId: this.projectId }));
        this.store.dispatch(actions.GetDeficienciesWidgetData({ projectId: this.projectId, bypassSpinner: true }));
      } else {
        // this.store.dispatch(rootActions.LoadingFinished({ actionName: actions.GetProjectOverviewDashboardClaimantDetails.type }));
        this.store.dispatch(rootActions.LoadingFinished({ actionName: actions.GetProjectOverviewDashboardClaimantDetailsByPhase.type }));
      }
      this.store.dispatch(actions.GetProjectOverviewDashboardClaimantStatistic({ projectId: this.projectId, bypassSpinner: true }));
      this.store.dispatch(actions.CreateOrUpdateProjectOverviewDashboardClaimantsRequest({ request: null }));
    });

    this.actionBar$.pipe(
      first(),
    ).subscribe(actionBar => {
      if (actionBar?.new) {
        delete actionBar?.new;
      }
      this.actionBar = actionBar;
      this.store.dispatch(actions.UpdateActionBar({ actionBar: this.getActionBar(this.actionBar, this.dashboardDataByPhase?.expandable) }));
    });

    this.isExpanded$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(expand => {
      this.isExpanded = expand;
    });
  }

  onFinalizationWidgetChange = (e: any) => {
    this.store.dispatch(actions.GetFinalizationCountsByDates({
      projectId: this.projectId,
      productCategoryId: e.productCategoryId,
      from: e.from,
      to: e.to,
    }));
  };

  /** @inheritdoc */
  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  /**
   * Event handler for expand \ collapse action for selected row in a table
   *
   * @param {DashboardRow} toggledSection
   * @memberof ProjectOverviewTabComponent
   */
  onToggleSection(toggledSection: DashboardRow) {
    this.store.dispatch(actions.ToggleSectionAtProjectOverviewDashboardClaimantDetails({
      expand: !toggledSection.expanded,
      toggledSection,
    }));
  }

  /**
   * Event handler for dashboard value click
   *
   * @param {DashboardEventData} event - data of the click event
   * @memberof ProjectOverviewTabComponent
   */
  onDashboardValueClick(event: DashboardEventData) {
    const request: ProjectOverviewDashboardSearchOptions = {
      ...new ProjectOverviewDashboardSearchOptions(),
      projectId: this.projectId,
      fieldId: event.field.id,
      filterParameter: event.field.filterParameter,
      filterValue: event.field.filterValue,
      filters: event.path,
      summaryFieldId: event.summaryFieldId,
    };
    this.store.dispatch(actions.CreateOrUpdateProjectOverviewDashboardClaimantsRequest({ request }));

    this.store.dispatch(commonActions.UpdatePager({ pager: { relatedPage: RelatedPage.ClaimantsFromProjectDashboard, payload: request } }));
    this.store.dispatch(commonActions.ActivatePager({ relatedPage: RelatedPage.ClaimantsFromProjectDashboard }));

    // all of these dispatches reset the project services grid filters and graphs
    this.resetGridFilters(GridId.ProjectClaimantsOverview);
    this.resetGridFilters(GridId.LienResolutionDashboardClaimantsList);
    this.resetGridFilters(GridId.BankruptcyDashboardClaimantsList);
    this.resetGridFilters(GridId.ProbateDashboardClaimantsList);
    this.resetGridFilters(GridId.ReleaseDashboardClaimantsList);

    this.store.dispatch(lrdActions.ResetFilters());
    this.store.dispatch(bdActions.ResetFilters());
    this.store.dispatch(pdActions.ResetFilters());
    this.store.dispatch(rdActions.ResetFilters());
    this.router.navigate(['projects', this.projectId, 'claimants', 'tabs', 'overview']);
  }

  private resetGridFilters(gridId: GridId): void {
    this.store.dispatch(rootActions.SetGridLocalData({ gridId, gridLocalData: { filters: null } }));
  }

  private toggleExpanded(expand: boolean): void {
    this.isExpanded = expand;
    this.store.dispatch(actions.ToggleLevelsAtProjectOverviewDashboardClaimantDetails({
      expand,
    }));
  }

  private getActionBar(actionBar: ActionHandlersMap, expandable: boolean): ActionHandlersMap {
    return {
      ...actionBar,
      collapseAll: {
        callback: () => this.toggleExpanded(false),
        hidden: () => !this.isExpanded || !expandable,
        disabled: () => !this.canToggleCollapsibility,
      },
      expandAll: {
        callback: () => this.toggleExpanded(true),
        hidden: () => this.isExpanded || !expandable,
        disabled: () => !this.canToggleCollapsibility,
      },
      back: () => this.store.dispatch(commonActions.GotoParentView('projects')),
    };
  }
}
