/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, OnDestroy, EventEmitter, Input, Output, ElementRef, OnChanges, SimpleChange, HostListener } from '@angular/core';
import { GridApi, GridOptions, ColDef, RowNode, RowDoubleClickedEvent, ColumnMovedEvent, GridReadyEvent, ColumnVisibleEvent, Column, ColumnState, ColumnPinnedType } from 'ag-grid-community';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { Store } from '@ngrx/store';
import { filter, takeUntil, first, pairwise } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { BehaviorSubject, Subject } from 'rxjs';
import { GridId } from '@app/models/enums/grid-id.enum';
import { KeyboardEventService } from '@app/services';
import { KeyCodes } from '@app/models/enums/keycodes.enum';
import { Dictionary, IDictionary, KeyValuePair } from '@app/models/utils';
import * as fromAuth from '@app/modules/auth/state/index';
import { CommonHelper, SearchOptionsHelper } from '@app/helpers';
import { User } from '@app/models';
import { GridDateSelectorComponent } from './grid-date-selector/grid-date-selector.component';
import { CustomTextColumnFilterComponent } from './custom-text-column-filter/custom-text-column-filter.component';
import { CustomSetColumnFilterComponent } from './custom-set-column-filter/custom-set-column-filter.component';
import { DropdownColumnFilterComponent } from './dropdown-column-filter/dropdown-column-filter.component';
import { AppState } from '../../../state';

import { IGridLocalData, IGridSettings, IGridColumn, IGridStorageData, ISortModel } from '../../../state/root.state';
import { NoRowsOverlay } from './no-rows-overlay/no-rows-overlay.component';
import { CustomLoadingCellRenderer } from '../_renderers/сustom-loading-cell-renderer/сustom-loading-cell-renderer.component';
import { Pager } from '../grid-pager/pager';
import { PAGES_COUNTS } from '../records-per-page/records-per-page.component';
import { MultiselectDropdownColumnFilterComponent } from './multiselect-dropdown-column-filter/multiselect-dropdown-column-filter.component';
import { IServerSideGetRowsParamsExtended } from '../_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public gridOptions: GridOptions;
  @Input() public rowData: any;
  @Input() public gridId: GridId;
  @Input() public entityLabel: string;
  @Input() public isSelectedVisible: boolean;
  @Input() public disallowHighlighting: boolean;
  @Input('class') class: string;
  @Input('height') height: string;
  @Input() public canReorderColumns = false;
  @Input() public saveGridDataOnModelUpdate = false;
  @Input() public isPagerEnabled = true;
  @Input() public enabledAutoHeight = true;
  @Input() public isContentAutoHeight = false;
  @Input() public hideTopStatusbar = false;
  @Input() public hideBottomStatusbar = false;
  @Input() public skipSetContentHeight = false;
  @Input() public idColumnName = 'id';
  @Input() public noRowsMessage = 'No Records.';
  @Input() public additionalPageItemsCountValues: [];
  @Input() public defaultViewportHeight = 65;

  @Output() public loadData: EventEmitter<IServerSideGetRowsParamsExtended> = new EventEmitter();
  @Output() public gridReady: EventEmitter<GridApi> = new EventEmitter();
  @Output() public newRecord: EventEmitter<void> = new EventEmitter();

  public options: GridOptions;
  public pager: Pager;
  public loading: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public selected: number = 0;
  public skipNextDataLoad = false;
  public extendedFilterModel: { [key: string]: any } = {};

  private ngUnsubscribe$ = new Subject<void>();
  private gridSettings: IGridSettings;
  private gridApi: GridApi;
  private highlightedIndex: number = null;
  private gridLocalData: IGridLocalData;

  private gridStorageData: IGridStorageData;
  private gridStorageId: string;
  private columnsOrder: IDictionary<string, number>;
  private columnMoved: KeyValuePair<string, number>;
  private readonly currentUser$ = this.store.select<any>(fromAuth.authSelectors.getUserDetails);
  private gridSettingsStorageId: string;

  /**
   * Gets or sets the flag which indicates whether to show the grid component or not
   *
   * @memberof GridComponent
   */
  hidden = false;

  /**
   * Gets or sets the flag which indicates that grid has some removed columns
   *
   * @memberof GridComponent
   */
  hasHiddenColumns = false;

  /**
   * Returns column definition where indicator about deleted columns should be shown.
   *
   * @readonly
   * @type {ColDef}
   * @memberof GridComponent
   */
  get indicatedColumn(): ColDef {
    const column = this.options?.columnDefs?.find((col: ColDef) => !col.hide && !col.checkboxSelection);
    return column as ColDef;
  }

  public selectedGridColumns: ColDef[];

  private defaultGridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    onGridSizeChanged: this.onGridSizeChanged.bind(this),
    onGridReady: this.onGridReady.bind(this),
    onPaginationChanged: this.onPaginationChanged.bind(this),
    onColumnPinned: this.onColumnPinned.bind(this),
    onModelUpdated: this.onModelUpdated.bind(this),
    onFilterChanged: this.onFilterChanged.bind(this),
    onRowSelected: this.onRowSelected.bind(this),
    getContextMenuItems: AGGridHelper.getHideContextMenuFunction('actions'),
  };

  public noRowsOverlayComponentParams;
  public columnMenu;

  constructor(
    private readonly store: Store<AppState>,
    private readonly keyboardEventService: KeyboardEventService,
    private readonly elementRef: ElementRef,
  ) { }

  public ngOnChanges(param: any): void {
    this.updateNoRowsOverlayParams(param);
  }

  setGridContentHeight(): void {
    if (this.height || this.skipSetContentHeight) {
      return;
    }
    this.height = this.isContentAutoHeight ? '' : `${this.defaultViewportHeight}vh`;
    if (this.isContentAutoHeight) {
      this.gridApi.setGridOption('domLayout', 'autoHeight');
    }
  }

  public ngOnInit(): void {
    if (!this.gridId) {
      throw Error('gridId is required input parameter of app-grid component and should be specified');
    }

    this.currentUser$.pipe(
      first((user: User) => !!user),
    ).subscribe((user: User) => {
      this.gridSettingsStorageId = `gridSettings__${user.id}_${this.gridId}`;
      this.store.dispatch(rootActions.GetGridSettings({ key: this.gridSettingsStorageId }));
    });

    this.subscribeOnLoading();
    this.subscribeOnGridLocalData();
    this.subscribeOnGridSettings();
    this.subscribeOnKeyUpPress();

    this.options = {
      ...this.defaultGridOptions,
      ...this.gridOptions,
      components: {
        agDateInput: GridDateSelectorComponent,
        customTextColumnFilter: CustomTextColumnFilterComponent,
        customLoadingCellRenderer: CustomLoadingCellRenderer,
        dropdownColumnFilter: DropdownColumnFilterComponent,
        multiselectDropdownColumnFilter: MultiselectDropdownColumnFilterComponent,
        customSetColumnFilter: CustomSetColumnFilterComponent,
        noRowsOverlay: NoRowsOverlay,
        ...this.gridOptions.components,
      },
      loadingCellRenderer: 'customLoadingCellRenderer',
      noRowsOverlayComponent: 'noRowsOverlay',
      defaultColDef: {
        ...this.defaultGridOptions.defaultColDef,
        ...this.gridOptions?.defaultColDef,
        menuTabs: this.canReorderColumns ? ['generalMenuTab', 'columnsMenuTab'] : ['generalMenuTab'],
      },
      columnMenu: 'legacy',
    };

    if (this.canReorderColumns) {
      this.enableColumnReorder();
    }

    this.noRowsOverlayComponentParams = {
      newRecord: (): void => {
        this.newRecord.emit();
      },
      showNewRecordLink: () => this.newRecord.observers.length,
      showByAdvancedSearch: false,
      shouldDisplayOverlay: true,
      noRowsMessageFunc: () => this.noRowsMessage,
    };

    this.elementRef.nativeElement.setAttribute('data-test-status-spec', 'loading|loaded');
  }

  @HostListener('document:click', ['$event'])
  public checkMenuVisibility(_event: Event): void {
    if (this.columnMenu) {
      const columnMenuIsInDom = document.body.contains(this.columnMenu);
      if (!columnMenuIsInDom) {
        this.columnMenu = null;

        if (this.gridApi) {
          this.gridApi.refreshHeader();
          this.gridApi.redrawRows();
        }
      }
    }
  }

  public postProcessPopup = (params: any): void => {
    this.columnMenu = params.ePopup;
  };

  private keyUpPressed(event: KeyboardEvent): void {
    event.preventDefault();

    switch (event.code) {
      case KeyCodes.ArrowDown:
        this.highlightNextRow();
        break;
      case KeyCodes.ArrowUp:
        this.highlightPrevRow();
        break;
      case KeyCodes.Enter:
        this.openHighlightedRow();
        break;
      default:
    }
  }

  private subscribeOnKeyUpPress(): void {
    this.keyboardEventService.getSubscription(this.elementRef)
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(
        (event: KeyboardEvent) => this.keyUpPressed(event),
      );
  }

  private subscribeOnLoading(): void {
    let isFirstLoading = false;

    this.loading
      .pipe(
        pairwise(),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(([prevValue, loading]: [boolean, boolean]) => {
        if (isFirstLoading && prevValue && !loading && this.highlightedIndex !== null) {
          this.selectRow(this.highlightedIndex);
        } else if (prevValue === false && loading) {
          this.clearRowSelection();
          this.resetHighlightedRow();
        }

        isFirstLoading = prevValue === null;
        this.elementRef.nativeElement.setAttribute('data-test-status', loading ? 'loading' : 'loaded');
      });
  }

  private subscribeOnGridLocalData(): void {
    this.store.select(rootSelectors.gridLocalDataByGridId({ gridId: this.gridId }))
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((gridLocalData: IGridLocalData) => {
        this.highlightedIndex = Number.isInteger(gridLocalData.highlightedRowIndex) ? gridLocalData.highlightedRowIndex : null;
        this.gridLocalData = { ...gridLocalData };

        if (this.highlightedIndex !== null && this.gridLocalData?.selectedRecordsIds) {
          this.selectRow(this.highlightedIndex);
        }
      });
  }

  private subscribeOnGridSettings(): void {
    this.store.select(rootSelectors.gridSettingByGridId({ gridId: this.gridSettingsStorageId }))
      .pipe(
        filter((item: IGridSettings) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((gridSettings: IGridSettings) => {
        this.gridSettings = gridSettings;
      });
  }

  public toPage(pageNumber: number): void {
    this.gridApi.paginationGoToPage(pageNumber - 1);
  }

  public onItemsPerPageChange(itemsPerPage: number): void {
    this.gridApi.setGridOption('paginationPageSize', itemsPerPage);
    this.gridApi.paginationGoToFirstPage();
    this.setGridSettings();
  }

  private onFilterChanged(): void {
    this.noRowsOverlayComponentParams = {
      ...this.noRowsOverlayComponentParams,
      ...{ showByAdvancedSearch: true },
    };
  }

  onRowSelected(event): void {
    if (event.node.selected) {
      this.saveHighlightedRow(event.rowIndex);
      this.selected++;
    } else {
      this.selected--;
    }

    if (event.node.rowIndex !== null) {
      this.saveRows(event.node);
    }
  }

  private onGridReady(params: GridReadyEvent): void {
    const scope = this;
    this.gridApi = params.api as GridApi;

    this.setGridContentHeight();
    this.applySavedSettings();
    this.gridApi.sizeColumnsToFit();

    // Restore columns order if it was saved before
    if (this.canReorderColumns && this.gridStorageData && this.gridStorageData.columnOrder?.length > 0) {
      this.gridStorageData
        .columnOrder
        .forEach((columnOrder: KeyValuePair<string, number>) => {
          this.gridApi.moveColumns([columnOrder.key], columnOrder.value);
        });
    }

    if (this.canReorderColumns && this.gridStorageData && this.gridStorageData.columnVisibility?.length > 0) {
      this.gridStorageData.columnVisibility.forEach((column: KeyValuePair<string, boolean>) => {
        this.gridApi.setColumnsVisible([column.key], column.value);
      });
    }

    if (this.gridSettings?.colsPinned) {
      this.gridSettings.colsPinned.forEach((column: IGridColumn) => {
        this.gridApi.setColumnsPinned([column.colId], column.pinned?.toString() as ColumnPinnedType);
      });
    }

    if (this.canReorderColumns) {
      this.gridApi.refreshHeader();
    }

    this.gridReady.emit(this.gridApi);

    if (this.options.rowModelType === AGGridHelper.ROW_MODEL_TYPE_SERVER_SIDE) {
      this.gridApi.setGridOption('serverSideDatasource', {
        getRows(params: IServerSideGetRowsParamsExtended) {
          if (!scope.skipNextDataLoad) {
            params.request.filterModel = { ...params.request.filterModel, ...scope.extendedFilterModel };
            params.request.filterModel = AGGridHelper.agGridParamsToFilterModels(params);
            scope.saveGridSearchParams();
            scope.loadData.emit(params);
          } else {
            scope.skipNextDataLoad = false;
          }
        },
      });
    }
  }

  public onModelUpdated(event: any): void {
    if (this.gridApi) {
      if (this.gridApi.getDisplayedRowCount() === 0) {
        this.gridApi.showNoRowsOverlay();
      } else if (!event?.keepUndoRedoStack) {
        this.gridApi.redrawRows();
        this.gridApi.hideOverlay();
        this.gridApi.sizeColumnsToFit();
        document.dispatchEvent(new Event('gridRedrawn'));
      }

      this.loading.next(this.isLoadingProcessInProgress());

      if (this.saveGridDataOnModelUpdate) {
        this.saveGridSearchParams();
      }
    }
    if (this.gridSettings) {
      this.setGridSettings();
    }
    this.setSelectedToNode();
  }

  private onGridSizeChanged(params): void {
    if (params.clientWidth) params.api.sizeColumnsToFit();
  }

  private onColumnPinned(event): void {
    const allCols: ColDef[] = event.api.getAllGridColumns();
    const colsPinned = allCols
      .map((item: ColDef) => ({
        colId: item.colId,
        pinned: item.pinned,
      } as IGridColumn));

    const gridSettings: IGridSettings = {
      colsPinned,
      itemsOnPage: this.gridApi.paginationGetPageSize(),
    };

    this.store.dispatch(rootActions.SetGridSettings({ key: this.gridSettingsStorageId, gridSettings }));

    this.gridApi.refreshHeader();
    this.gridApi.redrawRows();
  }

  private onPaginationChanged(): void {
    if (!this.gridApi || !this.isPagerEnabled) {
      return;
    }
    let pageSizes = PAGES_COUNTS;

    if (this.additionalPageItemsCountValues?.length > 0) {
      pageSizes = pageSizes.concat(...this.additionalPageItemsCountValues);
    }

    this.pager = {
      currentPage: this.gridApi.paginationGetCurrentPage() + 1,
      pageSize: this.gridApi.paginationGetPageSize(),
      totalCount: this.gridApi.paginationGetRowCount() || this.rowData?.length,
      entityLabel: this.entityLabel || '',
      isForceDefaultBackNav: false,
    };

    const hasSelectedPageSize = pageSizes.find((p: number) => p === this.pager.pageSize);

    if (!hasSelectedPageSize) {
      this.pager = { ...this.pager, pageSize: Math.min(...pageSizes) };
    }

    this.markRowsAsSelected();
  }

  private markRowsAsSelected(): void {
    const isAllRowSelected = this.gridLocalData?.isAllRowSelected;
    const rowNodes = this.gridLocalData?.selectedRecordsIds;
    if (this.gridApi) {
      this.gridApi.forEachNode((node: RowNode) => {
        if (node.data) {
          const id = node.data[this.idColumnName];
          const isSelected = rowNodes?.get(id) || (isAllRowSelected && !rowNodes?.has(id)) || false;
          node.setSelected(isSelected, false);
        }
      });
    }
  }

  private setGridSettings(itemsOnPage = this.gridApi ? this.gridApi.paginationGetPageSize() : null): void {
    const gridSettings: IGridSettings = {
      colsPinned: this.gridSettings ? this.gridSettings.colsPinned : [],
      itemsOnPage,
    };

    this.store.dispatch(rootActions.SetGridSettings({ key: this.gridSettingsStorageId, gridSettings }));
  }

  applySavedSettings(): void {
    this.applyGridSettings();
    this.applySavedGridSearchParams();
  }

  private applyGridSettings(): void {
    this.store.select(rootSelectors.gridSettingByGridId({ gridId: this.gridSettingsStorageId }))
      .pipe(
        filter((item: IGridSettings) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((gridSettings: IGridSettings) => {
        this.gridSettings = gridSettings;

        if (gridSettings && gridSettings.itemsOnPage) {
          this.gridApi.updateGridOptions({ paginationPageSize: gridSettings.itemsOnPage });
        }

        if (gridSettings && gridSettings.colsPinned) {
          gridSettings.colsPinned.forEach((column: IGridColumn) => {
            this.gridApi.setColumnsPinned([column.colId], column.pinned?.toString() as ColumnPinnedType);
          });
        }
      });
  }

  private applySavedGridSearchParams(): void {
    if (this.gridLocalData) {
      if (this.gridLocalData.filters) {
        this.gridApi.setFilterModel(this.gridLocalData.filters);
      }
      if (this.gridLocalData.sort) {
        const sort = [...this.gridLocalData.sort];
        // Timeout fixes issue with the AG Grid error 'Cannot read property 'sortModel' of undefined' even after grid initialization
        setTimeout(() => {
          const currentState = this.gridApi.getColumnState();
          this.gridApi.applyColumnState({
            state: currentState.map((columnState: ColumnState) => {
              const sorted = sort.find((s: ISortModel) => s.colId === columnState.colId);
              // eslint-disable-next-line no-param-reassign
              columnState.sort = sorted ? (sorted.sort as 'asc' | 'desc') : undefined;
              return columnState;
            }),
            defaultState: {
              // clear sort on all other columns
              sort: null,
            },
          });
        }, 1);
      }
    }
  }

  // when ag-grid loads data from the server it replaces all rows with one stub row with loading icon (in current implementation we hid it using css but it still exist)
  // https://www.ag-grid.com/javascript-grid-row-node/
  private isLoadingProcessInProgress(): boolean {
    const renderedNodes = this.gridApi.getRenderedNodes();

    if (renderedNodes) {
      return renderedNodes[0] ? renderedNodes[0].stub : false;
    }

    return false;
  }

  public selectRow(index: number): void {
    if (!this.gridApi || this.disallowHighlighting) {
      return;
    }

    const fn = (node: RowNode, idx: number): void => {
      if (node.data) {
        const id = node.data[this.idColumnName];

        if (idx === index && this.gridLocalData?.selectedRecordsIds?.get(id)) {
          node.setSelected(true, !this.options.suppressRowClickSelection);
        }
      }
    };

    if (this.options.rowModelType === AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE) {
      this.gridApi.forEachNodeAfterFilterAndSort(fn);
    } else {
      this.gridApi.forEachNode(fn);
    }
  }

  private clearRowSelection(): void {
    if (!this.gridApi) {
      return;
    }

    this.gridApi.deselectAll();
  }

  public openRow(index: number): void {
    if (!this.gridApi) {
      return;
    }

    this.gridApi.forEachNode((node: RowNode, idx: number) => {
      if (idx === index) {
        if (this.options.onRowDoubleClicked) {
          this.options.onRowDoubleClicked({
            node,
            data: node.data,
            rowIndex: index,
            rowPinned: null,
          } as unknown as RowDoubleClickedEvent);
        }
      }
    });
  }

  private highlightNextRow(): void {
    if (!this.pager) {
      return;
    }
    const { totalCount, pageSize, currentPage } = this.pager;
    const lastPageNumber = Math.ceil(totalCount / pageSize);
    const itemsOnCurrentPage = (currentPage === lastPageNumber) ? (totalCount % pageSize) : pageSize;
    let newHighLightedIndex: number = this.highlightedIndex;

    if (newHighLightedIndex === null) {
      // initializing row selection functionality and starting from the first row
      newHighLightedIndex = 0;
    } else if (newHighLightedIndex < itemsOnCurrentPage - 1) {
      newHighLightedIndex++;
    }

    // this.selectRow(newHighLightedIndex);
    this.saveHighlightedRow(newHighLightedIndex);
  }

  private highlightPrevRow(): void {
    let newHighLightedIndex: number = this.highlightedIndex;

    if (newHighLightedIndex === null) {
      return;
    } if (newHighLightedIndex) {
      newHighLightedIndex--;
    }

    // this.selectRow(newHighLightedIndex);
    this.saveHighlightedRow(newHighLightedIndex);
  }

  private openHighlightedRow(): void {
    this.openRow(this.highlightedIndex);
  }

  private saveHighlightedRow(index: number): void {
    const gridLocalData: Partial<IGridLocalData> = { highlightedRowIndex: index };

    this.store.dispatch(rootActions.SetGridLocalData({ gridId: this.gridId, gridLocalData }));
  }

  private saveRows({ data, selected }: {
    data: any;
    selected: any;
  }): void {
    if (!data) {
      return;
    }
    const id = data[this.idColumnName];
    const selectedRecordsIds = this.gridLocalData?.selectedRecordsIds || new Map<string, boolean>();
    if (!CommonHelper.isNullOrUndefined(id)) {
      selectedRecordsIds.set(id, selected);
      this.store.dispatch(rootActions.GridRowToggleCheckbox({ gridId: this.gridId, selectedRecordsIds }));

      if (this.saveGridDataOnModelUpdate) {
        this.saveGridSearchParams();
      }
    }
  }

  private setSelectedToNode(): void {
    if (!this.gridApi || !this.gridLocalData?.selectedRecordsIds) {
      return;
    }

    const { containIds, notContainIds } = SearchOptionsHelper.createSearchOptions(this.gridLocalData);
    const setSelected = containIds.length > 0;
    const ids = setSelected ? containIds : notContainIds;

    ids.forEach((id: number) => {
      this.gridApi.forEachNode((node: RowNode) => {
        if (node.data && node.data[this.idColumnName] === id) {
          node.setSelected(setSelected);
        }
      });
    });
  }

  private resetHighlightedRow(): void {
    this.saveHighlightedRow(null);
  }

  // #endregion Row Selection functionality

  saveGridSearchParams(filterModel?: { [key: string]: any }): void {
    const sorts = this.gridApi.getColumnState().filter((c: ColumnState) => c.sort != null);
    this.store.dispatch(rootActions.SetGridLocalData({
      gridId: this.gridId,
      gridLocalData: {
        filters: filterModel || { ...this.gridApi.getFilterModel(), ...this.extendedFilterModel },
        sort: sorts.map((c: ColumnState) => ({ colId: c.colId, sort: c.sort })),
      },
    }));
  }

  private updateNoRowsOverlayParams(param: any): void {
    if (this.options && param.rowData && this.options.rowModelType === AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE) {
      const rowDataChange: SimpleChange = param.rowData;

      if (rowDataChange.currentValue === null) {
        // data is null in the state, because it is being fetched from the API at the moment
        // if we get empty [] from the api, we will display "No Records" overlay
        this.noRowsOverlayComponentParams = {
          ...this.noRowsOverlayComponentParams,
          shouldDisplayOverlay: false,
        };
      } else if (rowDataChange.currentValue instanceof Array && rowDataChange.currentValue?.length === 0) {
        this.noRowsOverlayComponentParams = {
          ...this.noRowsOverlayComponentParams,
          shouldDisplayOverlay: true,
        };
      }
    }
  }

  private enableColumnReorder(): void {
    // Load grid settings from storage using grid id combined with user id (so each user would have he's own grid settings)
    this.currentUser$.pipe(
      first((user: User) => !!user),
    ).subscribe((user: User) => {
      this.gridStorageId = `${user.id}_${this.gridId}`;
      this.store.dispatch(rootActions.LoadFromStorage({ key: this.gridStorageId }));
    });

    // Subscribe to grid storage data changes in store
    this.store.select(rootSelectors.getGridStorageData)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((gridStorageData: IGridStorageData) => {
        this.gridStorageData = gridStorageData;
        let columnsOrder: KeyValuePair<string, number>[];
        if (gridStorageData) {
          columnsOrder = gridStorageData.columnOrder;
        }
        this.columnsOrder = new Dictionary<string, number>(columnsOrder);

        // If there are some hidden columns, show special menu icon for the first column in the grid
        // https://archersystems.atlassian.net/browse/AC-15374
        if (gridStorageData) {
          this.hasHiddenColumns = gridStorageData.columnVisibility?.length > 0;
          if (this.hasHiddenColumns && this.indicatedColumn) {
            this.options.suppressMenuHide = true;
            this.indicatedColumn.icons = { menu: '<i title="There are hidden columns in this grid. Click here to see them." class="fa fa-solid fa-circle orange" />' };
          }
        }
      });

    // Enable column reordering for grid
    this.options.defaultColDef.suppressMovable = false;
    this.options.suppressColumnMoveAnimation = true;
    this.options.suppressDragLeaveHidesColumns = true;

    // Subscribe to move events
    this.options.onDragStarted = (): void => {
      this.columnMoved = null;
    };
    this.options.onColumnMoved = (event: ColumnMovedEvent): void => {
      if (event.column) {
        this.columnMoved = new KeyValuePair(event.column.getColId(), event.toIndex);
      }
    };
    this.options.onDragStopped = (): void => {
      this.gridApi.refreshHeader();

      if (this.columnMoved) {
        this.columnsOrder.setValue(this.columnMoved.key, this.columnMoved.value);
        const gridColumns = this.gridApi.getAllGridColumns();
        for (let i = 0; i < gridColumns.length; i++) {
          const colId = gridColumns[i].getColId();
          if (this.columnsOrder.containsKey(colId)) {
            this.columnsOrder.setValue(colId, i);
          }
        }
        const gridStorageData: IGridStorageData = {
          ...this.gridStorageData,
          columnOrder: this.columnsOrder.items(),
        };
        this.store.dispatch(rootActions.SaveToStorage({ key: this.gridStorageId, data: gridStorageData }));
      }
    };

    this.options.onColumnVisible = (event: ColumnVisibleEvent): void => {
      const colId = event.columns[0].getColId();
      const isVisible = event.columns[0].isVisible();
      const visibleColumns = event.api.getColumns().filter((b: Column) => b.isVisible());
      if (visibleColumns.length === 0) {
        this.gridApi.setColumnsVisible([colId], true);
      }

      const gridStorageData: IGridStorageData = {
        ...this.gridStorageData,
        columnVisibility: this.gridStorageData?.columnVisibility?.filter((item: KeyValuePair<string, boolean>) => item.key !== colId) || [],
      };

      gridStorageData.columnVisibility.push({ key: colId, value: isVisible });
      this.store.dispatch(rootActions.SaveToStorage({ key: this.gridStorageId, data: gridStorageData }));
    };
  }

  public getCustomizedMenuItems(params) {
    const items = params.defaultItems.filter(item => item !== 'resetColumns');
    items.push({
      name: 'Reset Columns',
      action: () => {
        this.gridApi.resetColumnState();
        this.gridApi.sizeColumnsToFit();
        this.store.dispatch(rootActions.ClearStorage({ key: this.gridStorageId }));

        if (this.hasHiddenColumns && this.indicatedColumn) {
          this.hidden = true;
          delete this.indicatedColumn.icons;
          setTimeout(() => {
            this.hidden = false;
          });
        }
      },
    });
    return items;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    window.onresize = null;
  }
}
