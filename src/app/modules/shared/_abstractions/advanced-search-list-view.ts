import { OnInit, OnDestroy, ElementRef, Directive } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ColDef } from 'ag-grid-community';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { AppState } from '@shared/state';
import { ActionHandlersMap, ActionObject } from '@shared/action-bar/action-handlers-map';
import { AdvancedSearchState } from '@shared/state/advanced-search/reducer';
import { SaveSearch, DeleteSavedSearch, GetSavedSearch, SetLastRunDate, SwitchEditState, SaveRemovedSearches, ResetRemovedSearches, ResetCurrentSearch } from '@shared/state/saved-search/actions';
import { SaveSearchModalComponent } from '@shared/advanced-search/save-search-modal/save-search-modal.component';
import { ModalService, MessageService } from '@app/services';
import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchField } from '@app/models/advanced-search/search-field';
import { SavedSearch } from '@app/models/saved-search';
import { EntityTypeEnum } from '@app/models/enums';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import isEqual from 'lodash-es/isEqual';
import { SearchOptionsHelper } from '@app/helpers';
import { ISearchOptions } from '@app/models/search-options';
import { IGridLocalData } from '@app/state/root.state';
import { PermissionService } from '../../../services/permissions.service';
import { ListView } from './list-view';
import { RenameSearchModalComponent } from '../advanced-search/rename-search-modal/rename-search-modal.component';
import { savedSearchSelectors } from '../state/saved-search/selectors';
import * as clientsListActions from '../state/clients-list/actions';
import { IServerSideGetRowsParamsExtended } from '../_interfaces/ag-grid/ss-get-rows-params';

@Directive()
export abstract class AdvancedSearchListView extends ListView implements OnInit, OnDestroy {
  public showAdvancedSearch = false;
  public additionalColDefs: ColDef[] = [];
  public isExporting = false;
  public isActionInProgress = false;
  public orgId: number;
  public projectId: number;

  protected selectedGridColumns: ColDef[];
  public isCurrentSearchEdited$ = this.store.select(savedSearchSelectors.isCurrentSearchEdited);
  public removedSearches$ = this.store.select(savedSearchSelectors.removedSearches);
  public removedSearches: SearchState[] = [];

  public isCurrentSearchEdited: boolean;

  public abstract searchFields: SearchField[];
  constructor(
    public store: Store<AppState>,
    public modalService: ModalService,
    public messageService: MessageService,
    public route: ActivatedRoute,
    protected elementRef: ElementRef,
    protected router: Router,
    protected readonly permissionService: PermissionService,
  ) {
    super(router, elementRef);
  }

  public searchState: SearchState[] = [
    new SearchState(),
  ];

  public savedSearch: SearchState[];

  public get isSearchSaved() {
    return isEqual(this.searchState, this.savedSearch);
  }

  public currentSearch: SavedSearch;
  protected currentSearchBeforeChanges: SavedSearch;

  public abstract advancedSearch$: Observable<AdvancedSearchState>;
  protected abstract entityType: EntityTypeEnum;
  protected abstract saveAdvancedSearch(): void;
  public advancedSearchId: number;

  protected readonly savedSearchActionBar: ActionHandlersMap = {
    saveSearch: {
      hidden: () => !this.showAdvancedSearch,
      disabled: () => this.isSaveAsActionDisabled() && this.isEdited(),
      options: [{
        name: 'Save As',
        disabled: () => this.isSaveAsActionDisabled(),
        callback: () => this.saveSearchAs(this.orgId),
      },
      {
        name: 'Save',
        callback: () => this.saveSearch(this.orgId),
        disabled: () => this.isEdited(),
      },
      {
        name: 'Rename',
        callback: () => this.renameSavedSearch(),
        disabled: () => !this.isOnSavedSearch,
      },
      {
        name: 'Discard Changes',
        callback: () => {
          this.switchIsEditStateTo(false);
          this.store.dispatch(GetSavedSearch({ id: this.advancedSearchId, entityType: this.entityType }));
        },
        hidden: () => !this.isOnSavedSearch || !this.isCurrentSearchEdited,
      },
      ],
    },
  };

  public ngOnInit(): void {
    super.ngOnInit();
    this.route.params.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((params: Params) => {
      this.advancedSearchId = params?.id;
      if (this.advancedSearchId) {
        this.store.dispatch(GetSavedSearch({ id: this.advancedSearchId, entityType: this.entityType }));
      }
    });
    this.isCurrentSearchEdited$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(isEdited => { this.isCurrentSearchEdited = isEdited; });

    this.advancedSearch$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(({ searchParams }) => !!(searchParams && searchParams.length)),
      distinctUntilChanged((a, b) => isEqual(a, b)),
    ).subscribe(({ searchParams, isVisible }) => {
      this.restoreAdvancedSearch(searchParams, isVisible);
    });

    this.removedSearches$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(removedSearches => !!removedSearches),
    ).subscribe(removedSearches => { this.removedSearches = removedSearches; });
  }

  protected toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  protected restoreAdvancedSearch(searchParams: SearchState[], isVisible: boolean): void {
    this.searchState = searchParams;
    this.showAdvancedSearch = isVisible;
  }

  public switchIsEditStateTo(isEdited: boolean) {
    this.store.dispatch(SwitchEditState({ isEdited }));
  }

  public isEdited(): boolean {
    if (this.isOnSavedSearch) {
      return !this.isCurrentSearchEdited;
    }
    return this.isStateEmpty();
  }

  public isSaveAsActionDisabled(): boolean {
    return this.isStateEmpty() || !this.isOnSavedSearch;
  }

  public markAsEdited(): void {
    if (this.isOnSavedSearch) {
      this.switchIsEditStateTo(true);
    }
  }

  public initSavedSearch(savedSearch: SavedSearch, withSubmit = true): void {
    if (savedSearch && savedSearch.searchModel) {
      this.saveInitialSearch(savedSearch);
      this.searchState = this.mapSearchState(savedSearch.searchModel);
      this.currentSearch = savedSearch;
      this.setAdvancedSearchVisible(true);
      if (withSubmit) {
        this.advancedSearchSubmit();
      }
    }
  }

  public setAdvancedSearchVisible(isVisible: boolean): void {
    this.store.dispatch(clientsListActions.SaveAdvancedSearchVisibility({ isVisible }));
    this.showAdvancedSearch = isVisible;
  }

  public mapSearchState(searchStates: SearchState[]): SearchState[] {
    const removedSearches: SearchState[] = [];
    const result = searchStates.map((searchState: SearchState) => {
      const currentField: SearchField = this.searchFields.find(s => !!s && s.name === searchState.field?.name && s.key === searchState.field.key);
      if (!currentField) {
        removedSearches.push({ ...searchState });
      }
      // eslint-disable-next-line no-param-reassign
      searchState.field = currentField;
      if (searchState.additionalFields) {
        searchState.additionalFields.forEach(entry => {
          // eslint-disable-next-line no-param-reassign
          entry.field = searchState.field.additionalFieldKeys
            .find(s => !!s && s.name === entry.field.name && s.key === entry.field.key);
        });
      }
      return searchState;
    }).filter(n => n.field);

    if (removedSearches.length) {
      this.store.dispatch(SaveRemovedSearches({ removedSearches }));
    }

    return result;
  }

  protected advancedSearchAction(): ActionObject {
    return {
      callback: () => this.toggleAdvancedSearch(),
      hidden: () => this.showAdvancedSearch,
    };
  }

  protected basicSearchAction(): ActionObject {
    return {
      callback: () => {
        this.clearFilters();
        this.toggleAdvancedSearch();
      },
      hidden: () => !this.showAdvancedSearch,
    };
  }
  public bsModalRef: BsModalRef;

  protected mergeSearchFilters(agGridParams: IServerSideGetRowsParamsExtended) {
    // TODO: May want to get with product and find out how we want advanced search to work with existing functionality
    // NOTE: this method COMBINES the aggrid column heading search boxes with advanced search
    // we could easily just have advanced search override, whatever we want if we do it this way
    const filterModels: FilterModel[] = [];
    this.searchState.forEach(obj => {
      const advancedFilterModels: FilterModel[] = SearchState.getFilterModel(obj);
      if (advancedFilterModels.length > 0) {
        advancedFilterModels.forEach(item => {
          filterModels.push(item);
        });
      }
    });
    Object.entries(agGridParams.request.filterModel).forEach(obj => {
      filterModels.push(obj[1] as FilterModel);
    });
    return {
      ...agGridParams,
      request: {
        ...agGridParams.request,
        filterModel: [
          ...filterModels,
        ],
      },
    } as IServerSideGetRowsParamsExtended;
  }

  public isStateEmpty(): boolean {
    return this.searchState.every(search => !search.field);
  }

  public get isOnSavedSearch(): boolean {
    return !!this.advancedSearchId;
  }

  public advancedSearchSubmit() {
    if (this.currentSearch?.id) {
      this.store.dispatch(SetLastRunDate({ id: this.currentSearch.id }));
    }

    if (this.gridApi) {
      this.gridApi.onFilterChanged();
    }
    this.saveAdvancedSearch();
  }

  public saveSearchAs(orgId: number): void {
    this.bsModalRef = this.modalService.show(SaveSearchModalComponent, {
      initialState: {
        searchId: this.currentSearch?.id,
        currentSelectedOrgId: orgId,
        entityType: this.entityType,
        searchState: this.searchState,
        projectId: this.projectId,
      },
      class: 'modal-md',
    });
  }

  public renameSavedSearch(): void {
    this.bsModalRef = this.modalService.show(RenameSearchModalComponent, {
      initialState: {
        currentSearch: this.currentSearch,
        searchState: this.searchState.map(search => SearchState.toDto(search)),
      },
      class: 'modal-md',
    });
  }

  public saveSearch(orgId: number): void {
    const searchModel = [
      ...this.removedSearches,
      ...this.searchState,
    ];

    if (!this.isOnSavedSearch) {
      this.saveSearchAs(orgId);
    } else {
      this.store.dispatch(SaveSearch({
        search: {
          entityType: this.entityType,
          name: this.currentSearch.name,
          searchModel: searchModel.map(n => SearchState.toDto(n)),
          id: this.currentSearch.id,
          orgId: this.currentSearch.orgId,
          users: this.currentSearch.users,
          advancedSearchType: this.currentSearch.advancedSearchType,
        } as SavedSearch,
      }));
    }
  }

  public deleteSearch(searchId: number): void {
    if (!searchId) {
      return;
    }
    this.messageService
      .showDeleteConfirmationDialog('Delete Search', 'Are you sure you want to delete this search?')
      .subscribe(answer => {
        if (!answer) {
          return;
        }

        this.store.dispatch(DeleteSavedSearch({ id: searchId, entityType: this.entityType }));
        this.clearFilters();
      });
  }

  public clearFilters(): void {
    super.clearFilters();
    this.searchState = [new SearchState()];
    this.saveAdvancedSearch();
    this.store.dispatch(ResetCurrentSearch({ entityType: this.entityType }));
  }

  protected canClearFilters(): boolean {
    if (super.canClearFilters() || this.searchState.length > 1) {
      return true;
    }

    return (this.searchState.length === 1) ? !!this.searchState[0].field : false;
  }

  public ngOnDestroy(): void {
    this.saveAdvancedSearch();
    this.store.dispatch(ResetRemovedSearches({ entityType: this.entityType }));
    super.ngOnDestroy();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  protected getStandardExportParams(gridLocalData: IGridLocalData): ISearchOptions {
    const searchOptions = SearchOptionsHelper.createSearchOptions(gridLocalData, this.gridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    return searchOptions;
  }

  /**
   * Copies saved search into the local field for later usage
   *
   * @protected
   * @param {SavedSearch} savedSearch - source search object
   * @memberof AdvancedSearchListView
   */
  protected saveInitialSearch(savedSearch: SavedSearch) {
    this.currentSearchBeforeChanges = { ...savedSearch, searchModel: savedSearch.searchModel.map(m => ({ ...m })) };
  }
}
