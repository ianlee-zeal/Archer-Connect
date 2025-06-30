import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { GridApi } from 'ag-grid-community';
import { Subject, combineLatest } from 'rxjs';
import { filter, takeUntil, startWith, distinctUntilChanged } from 'rxjs/operators';

import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { AppState } from '@shared/state';
import * as fromShared from '@shared/state';
import { NavigationSettings } from '@app/modules/shared/action-bar/navigation-settings';
import { ClientListComponent } from '@app/modules/shared/client-list/client-list.component';
import { SideNavMenuService } from '@app/services/navigation/side-nav-menu.service';
import { SavedSearch } from '@app/models/saved-search';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { ResetCurrentSearch } from '@app/modules/shared/state/saved-search/actions';
import { GridId } from '@app/models/enums/grid-id.enum';
import { HashTable } from '@app/models/hash-table';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { EntityTypeEnum } from '@app/models/enums';
import { AGGridHelper } from '@app/helpers';
import { gridLocalDataByGridId } from '@app/state';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { IGridLocalData } from '@app/state/root.state';
import * as commonActions from '../state/actions';
import * as selectors from '../state/selectors';
import { ClaimantsState } from '../state/reducer';
import { savedSearchSelectors } from '../../shared/state/saved-search/selectors';
import { ContextBarElement } from '../../../entities/context-bar-element';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

/** Defines names of editable properties at saved search object */
type SavedSearchEditedFields = 'searchName' | 'lastModifiedDate' | 'userName';

@Component({
  selector: 'app-claimants-list',
  templateUrl: './claimants-list.component.html',
  styleUrls: ['./claimants-list.component.scss'],
})
export class ClaimantsListComponent implements OnInit, AfterViewInit, OnDestroy {
  private isCurrentSearchEdited = false;
  private savedSearch: SavedSearch;
  entityType: EntityTypeEnum = EntityTypeEnum.Clients;

  @ViewChild(ClientListComponent) clientListComponent: ClientListComponent;

  public readonly error$ = this.sharedStore.select(fromShared.sharedSelectors.commonSelectors.error);
  public readonly actionBar$ = this.store.select(selectors.actionBar);
  public readonly savedSearchItems$ = this.store.select(savedSearchSelectors.savedSearchList);
  public readonly savedSearch$ = this.store.select(savedSearchSelectors.currentSearchByEntityType({ entityType: this.entityType }));
  private readonly clientsActionBar$ = this.store.select(fromShared.sharedSelectors.clientsListSelectors.actionBar);
  private readonly isCurrentSearchEdited$ = this.store.select(savedSearchSelectors.isCurrentSearchEdited);

  private ngUnsubscribe$ = new Subject<void>();

  public elements: ContextBarElement[];
  public readonly gridId: GridId = GridId.Claimants;
  private readonly gridLocalData$ = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));

  constructor(
    private readonly sharedStore: Store<AppState>,
    private readonly store: Store<ClaimantsState>,
    private readonly sideNavMenuService: SideNavMenuService,
    private readonly dateFormatPipe: DateFormatPipe,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.subscribeToClientsActionBar();
    this.subscribeToSavedSearch();
    this.subscribeToIsCurrentSearchEdited();
  }

  public ngAfterViewInit(): void {
    this.subscribeToGridUpdates();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  // Subscribe to clients' action bar updates
  private subscribeToClientsActionBar(): void {
    this.clientsActionBar$
      .pipe(
        filter((actionBar: ActionHandlersMap) => !!actionBar),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((actionBar: ActionHandlersMap): void => {
        this.store.dispatch(commonActions.UpdateClaimantsActionBar({ actionBar }));
      });
  }

  // Subscribe to saved search updates
  private subscribeToSavedSearch(): void {
    this.savedSearch$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((savedSearch: SavedSearch) => {
        this.savedSearch = savedSearch;
        this.elements = this.savedSearch ? [
          { column: 'Search Name', valueGetter: () => this.getEditedFieldValue('searchName') },
          { column: 'Last Modified Date', valueGetter: () => this.getEditedFieldValue('lastModifiedDate') },
          { column: 'Last Modified By', valueGetter: () => this.getEditedFieldValue('userName') },
        ] : null;
      });
  }

  // Subscribe to isCurrentSearchEdited updates
  private subscribeToIsCurrentSearchEdited(): void {
    this.isCurrentSearchEdited$
      .pipe(
        filter((isCurrentSearchEdited: boolean) => isCurrentSearchEdited !== null),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((isCurrentSearchEdited: boolean) => {
        this.isCurrentSearchEdited = isCurrentSearchEdited;
      });
  }

  private subscribeToGridUpdates(): void {
    combineLatest([
      this.route.queryParams.pipe(
        startWith(this.route.snapshot.queryParams),
      ),
      this.gridLocalData$,
      this.clientListComponent.gridReady$,
    ]).pipe(
      distinctUntilChanged((a: [Params, IGridLocalData, GridApi], b: [Params, IGridLocalData, GridApi]) => JSON.stringify(a[0]) === JSON.stringify(b[0])),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(([queryParams, gridLocalData]: [Params, IGridLocalData, GridApi]) => {
      const gridFilters = AGGridHelper.extractFiltersFromQueryParams(queryParams, {
        id: 'number',
        firstName: 'string',
        lastName: 'string',
        searchTerm: 'string',
      });
      if (gridFilters.searchTerm && gridFilters.searchTerm.filter) {
        this.clientListComponent.setAdvancedSearch(String(gridFilters.searchTerm.filter));
      } else {
        this.applyGridFilters({ ...gridFilters, ...gridLocalData?.filters });
      }
    });
  }

  private applyGridFilters(gridFilters: HashTable<FilterModel>): void {
    this.clientListComponent.getGridApi()?.setFilterModel(gridFilters);
  }

  public onFiltersCleared(): void {
    this.store.dispatch(commonActions.GoToClaimantsListPage());
    this.store.dispatch(ResetCurrentSearch({ entityType: this.entityType }));
  }

  public onRowDoubleClicked(data): void {
    const navSettings = <NavigationSettings>{
      current: this.clientListComponent.getGridApi().getSelectedNodes()[0].rowIndex,
      count: this.clientListComponent.getGridApi().paginationGetRowCount(),
    };

    const relatedPage = !this.savedSearch ? RelatedPage.ClaimantsFromSearch : RelatedPage.ClaimantsFromSavedSearch;
    this.store.dispatch(CreatePager({ relatedPage, settings: navSettings, pager: { relatedPage } }));
    this.store.dispatch(commonActions.GoToClaimantDetails({ id: data.id, navSettings }));
  }

  public onDataChanged(gridParamsRequest: IServerSideGetRowsRequestExtended): void {
    this.store.dispatch(commonActions.UpdateClaimantListDataSource({ gridParamsRequest }));
  }

  private getEditedFieldValue(editedField: SavedSearchEditedFields): string {
    if (!this.savedSearch) {
      return null;
    }
    switch (editedField) {
      case 'searchName':
        return `${this.savedSearch.name} ${this.isCurrentSearchEdited ? ' (Edited)' : ''}`;
      case 'lastModifiedDate':
        return this.dateFormatPipe.transform(this.savedSearch.lastModifiedDate, false, null, null, true);
      case 'userName':
        return this.savedSearch.lastModifiedBy?.userName;
      default:
        return null;
    }
  }
}
