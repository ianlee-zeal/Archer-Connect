import { Input, OnInit, Directive } from '@angular/core';
import { Store } from '@ngrx/store';

import { RelatedPage } from '@app/modules/shared/grid-pager';
import { KeyValuePair } from '@app/models/utils';
import { IdValue, LienPhase } from '@app/models';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartUtilsBase } from './chart-utils-base';

/**
 * Base class for dashboard components
 *
 * @export
 * @abstract
 * @class DashboardComponentBase
 * @template TState
 * @template TListPayload
 * @template TDetailsPayload
 */

@Directive()
export abstract class DashboardComponentBase<TState, TListPayload, TDetailsPayload> extends ChartUtilsBase implements OnInit {
  /**
   * Gets or sets current project id
   *
   * @type {number}
   * @memberof DashboardComponentBase
   */
  @Input()
    projectId: number;

  public abstract selectedStages$: Observable<number[]>;
  public abstract selectedPhases$: Observable<number[]>;

  public selectedStages: number[];
  public selectedPhases: number[];

  public abstract claimantListComponent;

  public ngUnsubscribe$ = new Subject<void>();
  /**
   * Property containing value describing to which page related current dashboard.
   *
   * @abstract
   * @type {RelatedPage}
   * @memberof DashboardComponentBase
   */
  abstract readonly relatedPage: RelatedPage;

  /**
   * Creates an instance of DashboardComponentBase.
   * @param {Store<TState>} store$ - current store
   * @memberof DashboardComponentBase
   */
  constructor(
    protected readonly store$: Store<TState>,
  ) {
    super();
  }

  /**
   * When implemented by inherited class, should load claimants list.
   *
   * @abstract
   * @param {TListPayload} payload
   * @memberof DashboardComponentBase
   */
  abstract getClaimantsList(payload: TListPayload);

  /**
   * When implemented by inherited class, should open claimant details page.
   *
   * @abstract
   * @param {TDetailsPayload} payload
   * @memberof DashboardComponentBase
   */
  abstract onGoToDetails(payload: TDetailsPayload);

  /**
   * When implemented by inherited class, must update clear filter option in action bar.
   *
   * @abstract
   * @param {KeyValuePair<string, string>[]} filters - provided array of filters.
   * @param {boolean} isAlwaysEnabled - flag indicates whether clear filter option is always enabled or not.
   * @memberof DashboardComponentBase
   */
  abstract updateClearFilterOptionInActionBar(filters: KeyValuePair<string, string>[], isAlwaysEnabled: boolean);

  /**
   * Event handler for the grid filters changed event.
   *
   * @memberof DashboardComponentBase
   */

  ngOnInit(): void {
    this.subscriptions();
  }

  private subscriptions(): void {
    this.selectedStages$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(items => this.selectedStages = items);
    this.selectedPhases$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(items => this.selectedPhases = items);
  }

  onGridFiltersChanged(): void {
    this.updateClearFilterOptionInActionBar([], true);
  }

  get hasActiveFilterCheck(): boolean {
    return this.claimantListComponent.canClearGridFilters() || !!this.selectedStages || !!this.selectedPhases;
  }

  getStageIdsFromPieChartEvent(event, allStages: IdValue[]): number[] {
    const selectedStageId = !event.dataObj.isSliced
      ? allStages.find(i => i.name === event.dataObj.categoryLabel).id
      : null;

    const selectedStages: number[] = selectedStageId ? [selectedStageId] : [];
    return selectedStages;
  }

  getPhaseIdsFromPieChartEvent(event, allPhases: LienPhase[]): number[] {
    const selectedPhases: number[] = !event.dataObj.isSliced
      ? [allPhases.find(i => i.shortName === event.dataObj.categoryLabel).id]
      : null;

    return selectedPhases;
  }

  getTypesAndPhasesFromStackedChartEvent(event, allTypes: IdValue[], allPhases: LienPhase[], selectedTypes: number[], selectedPhases: number[]) {
    const selectedType = allTypes.find(i => i.name === event.dataObj.categoryLabel);
    const selectedPhase = allPhases.find(i => i.name === event.dataObj.datasetName);

    let newSelectedTypes = [selectedType.id];
    let newSelectedPhases = [selectedPhase.id];

    if (selectedTypes && selectedTypes.includes(selectedType.id) && (selectedPhases && selectedPhases.includes(selectedPhase.id))) {
      // Selected phase was unchecked
      newSelectedTypes = null;
      newSelectedPhases = null;
    }

    return {
      selectedTypes: newSelectedTypes,
      selectedPhases: newSelectedPhases,
    }
  }

  getProductFromStackedChartXAxisEvent(event, selectedTypes: number[], allTypes: IdValue[]): number[] {
    // Normalize splitted type string
    const selectedTypeName = this.normalizeTypeName(event.dataObj.text);

    const selectedTypeId: number = selectedTypeName !== event.dataObj.text
      ? allTypes.find(i => i.name.startsWith(selectedTypeName)).id
      : allTypes.find(i => i.name === selectedTypeName).id;

    const newSelectedTypes = selectedTypes && selectedTypes.includes(selectedTypeId)
      ? null // Selected type was unchecked
      : [selectedTypeId];

    return newSelectedTypes;
  }

  // Workaround
  // There is no way to use dataplot.id as selected element. We need to use lebles and compare by strings
  // When label is too long and splited to multiple lines or trimmed by three dots fusioncharts changed value inside label directly
  // We need this method to remove line splitting and trim three dots to be able to compare selected labels
  private normalizeTypeName(typeName: string) {
    return typeName
      .replace('<br />', ' ')
      .replace('...', '');
  }
}
