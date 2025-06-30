/* eslint-disable no-param-reassign */
import { ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { DateHelper } from '@app/helpers/date.helper';
// import { DefaultGlobalSearchTypeHelper } from '@app/helpers/default-global-search-type.helper';
// import { RouteReuseStrategyHelper } from '@app/helpers/route-reuse-strategy.helper';
import { DefaultGlobalSearchType } from '@app/models/enums/default-global-search-type.enum';
import { SearchTypeEnum } from '@app/models/enums/filter-type.enum';
import { GridId } from '@app/models/enums/grid-id.enum';
import { KeyCodes } from '@app/models/enums/keycodes.enum';
import { GridApi, GridOptions, SuppressKeyboardEventParams, LoadSuccessParams, ColDef } from 'ag-grid-community';
import { Channel } from 'pusher-js';
import { Subject } from 'rxjs';

import { ActionObject } from '../action-bar/action-handlers-map';
import { GridComponent } from '../grid/grid.component';
import { IServerSideGetRowsParamsExtended } from '../_interfaces/ag-grid/ss-get-rows-params';

@Directive()
export abstract class ListView implements OnInit, OnDestroy {
  /**
   * Event fired when filters were cleared
   *
   * @memberof ListView
   */
  @Output()
  readonly filtersCleared = new EventEmitter();

  @ViewChild(GridComponent)
  private readonly grid: GridComponent;

  public abstract gridId: GridId;

  protected gridApi: GridApi;
  protected gridParams: IServerSideGetRowsParamsExtended;
  protected searchType: DefaultGlobalSearchType;
  protected editEnabled: boolean;
  protected abstract gridOptions: GridOptions;
  protected channel: Channel;
  protected abstract fetchData(params: IServerSideGetRowsParamsExtended): void;

  protected ngUnsubscribe$ = new Subject<void>();

  // Default keys which are used by AG Grid during editing
  // https://www.ag-grid.com/javascript-grid/cell-editing/#start-editing
  private readonly defaultAgGridKeysForEditing: Set<string> = new Set([
    KeyCodes.Backspace,
    KeyCodes.Delete,
    KeyCodes.F2,
    KeyCodes.Enter,
    KeyCodes.NumpadEnter,
    KeyCodes.ArrowDown,
    KeyCodes.ArrowUp,
    KeyCodes.ArrowLeft,
    KeyCodes.ArrowRight,
    KeyCodes.ShiftLeft,
    KeyCodes.ShiftRight,
    KeyCodes.Home,
    KeyCodes.End,
  ]);

  private extendedFilterModel: { [key: string]: any } = {};

  constructor(
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
  ) { }

  get gridReady$() {
    return this.grid?.gridReady;
  }

  public ngOnInit(): void {
    /* if (this.searchType) {
      const componentUrl = DefaultGlobalSearchTypeHelper.defaultGlobalSearchToRoute(this.searchType);
      RouteReuseStrategyHelper.processNavigation(this.router, this.elementRef, componentUrl);
      RouteReuseStrategyHelper.processOnNavChangeCallback(this.router, () => this.gridApi.refreshServerSide({ purge: true }), componentUrl);
    } */
  }

  public loadData(params: IServerSideGetRowsParamsExtended): void {
    this.extendServerSideParams(params);
    this.fetchData(params);
    this.grid.skipNextDataLoad = false;
  }

  protected clearFilterAction(): ActionObject {
    return {
      callback: () => this.clearFilters(),
      disabled: () => !this.canClearFilters(),
    };
  }

  public gridReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
  }

  public getGridApi(): GridApi {
    return this.gridApi;
  }

  protected clearFilters(): void {
    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
      this.gridApi.onFilterChanged();
      this.gridApi.refreshHeader();
      const firstDataColumn = this.gridApi.getAllDisplayedColumns().find(col => col.getColDef().field);
      if (firstDataColumn != null) {
        this.gridApi.ensureColumnVisible(firstDataColumn);
      }
      if (Object.keys(this.extendedFilterModel).length) {
        this.grid.skipNextDataLoad = false;
        this.extendedFilterModel = {};
        this.grid.extendedFilterModel = {};
      }
      this.filtersCleared.emit();
    }
  }

  protected canClearFilters(): boolean {
    if (!this.gridApi) {
      return false;
    }

    const filterModels = [this.gridApi.getFilterModel(), this.extendedFilterModel];
    const hasColumnFilters = (!!filterModels[0] && !!Object.keys(filterModels[0])?.length)
      || (!!filterModels[1] && !!Object.keys(filterModels[1])?.length);

    return hasColumnFilters;
  }

  protected getExportParams(): IServerSideGetRowsParamsExtended {
    const totalPage = this.gridApi.paginationGetRowCount();

    return { ...this.gridParams, request: { ...this.gridParams.request, endRow: totalPage } };
  }

  protected startEditing(): void {
    this.editEnabled = true;
    if (this.gridApi) {
      this.gridApi.redrawRows();
    }
  }

  protected stopEditing(): void {
    this.editEnabled = false;
    if (this.gridApi) {
      this.gridApi.stopEditing(true);
      this.gridApi.redrawRows();
    }
  }

  protected applySavedGridSettings(): void {
    this.grid.applySavedSettings();
  }

  protected getEditableClass(isCenteredBeforeEdit = false): string {
    return `ag-cell-${this.editEnabled ? 'editable' : 'before-edit'} ${isCenteredBeforeEdit ? 'ag-cell-before-edit-centered' : ''}`;
  }

  protected getEditableOrHiddenClass(isShown: boolean, isCenteredBeforeEdit = false): string {
    if (!isShown) {
      return 'hidden';
    }
    return this.getEditableClass(isCenteredBeforeEdit);
  }

  protected suppressDefaultKeyboardKeys(params: SuppressKeyboardEventParams) {
    return this.defaultAgGridKeysForEditing.has(params.event.code);
  }

  protected setGridRowDataWithDelay(data: any[], callback?: () => void): void {
    if (this.gridApi) {
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.setGridOption('rowData', data);
          this.gridApi.refreshCells({ force: true });
          if (callback) {
            callback();
          }
        }
      }, 900);
      this.gridApi.redrawRows();
      this.gridApi.refreshCells({ force: true });
    }
  }

  protected onDateRangeFilterChanged(key: string, dates: Date[]) {
    if (dates.length > 0 && (dates[0] || dates[1])) {
      const hasFrom = !!dates[0];
      const hasTo = !!dates[1];
      let type: string;
      if (hasFrom && hasTo) {
        type = SearchTypeEnum.InRange;
      } else if (hasFrom) {
        type = SearchTypeEnum.GreaterThanOrEqual;
      } else if (hasTo) {
        type = SearchTypeEnum.LessThanOrEqual;
      }

      const filterModel = this.gridApi.getFilterModel();

      if (type) {
        const dateRangeFilter = {
          type,
          filterType: 'date',
          key,
          dateFrom: null,
          dateTo: null,
        };

        switch (type) {
          case SearchTypeEnum.InRange:
            dateRangeFilter.dateFrom = DateHelper.toStringWithoutTime(dates[0]);
            dateRangeFilter.dateTo = DateHelper.toStringWithoutTime(dates[1]);
            break;
          case SearchTypeEnum.GreaterThanOrEqual:
            dateRangeFilter.dateFrom = DateHelper.toStringWithoutTime(dates[0]);
            break;
          case SearchTypeEnum.LessThanOrEqual:
            dateRangeFilter.dateFrom = DateHelper.toStringWithoutTime(dates[1]);
            break;
          default:
            break;
        }

        filterModel[key] = dateRangeFilter;
        this.extendedFilterModel[key] = dateRangeFilter;
        this.grid.extendedFilterModel[key] = dateRangeFilter;
        this.grid.skipNextDataLoad = true;
      } else {
        delete this.extendedFilterModel[key];
        delete this.grid.extendedFilterModel[key];
      }

      this.gridParams.request.filterModel = AGGridHelper.agGridFilterToFilterModels(filterModel);
      this.grid.saveGridSearchParams(filterModel);
      this.grid.loadData.emit(this.gridParams);
    }
  }

  protected selectAllRows(): void {
    this.gridApi.forEachNode(node => {
      node.setSelected(true, false);
    });
  }

  protected toggleActionsColumn(hide: boolean) {
    if (this.gridOptions?.columnDefs) {
      const actionsColumn: ColDef = this.gridOptions.columnDefs.find(c => (c as ColDef).colId === 'actions');
      if (actionsColumn) {
        actionsColumn.hide = hide;
      }
    }
  }

  private extendServerSideParams(params: IServerSideGetRowsParamsExtended): void {
    const originalSuccess = params.success;

    const extendedSuccess = (p: LoadSuccessParams) => {
      if (params.api.getDisplayedRowCount() === 0) {
        params.api.refreshServerSide({ purge: true });
      } else {
        originalSuccess(p);
      }
    };

    params.success = extendedSuccess;
  }

  public ngOnDestroy(): void {
    if (this.gridApi) {
      this.gridApi.destroy();
      this.gridApi = null;
    }
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
