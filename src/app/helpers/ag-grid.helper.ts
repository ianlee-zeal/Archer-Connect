/* eslint-disable no-restricted-globals */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import { CellPosition, CellRendererSelectorResult, ColDef, ColGroupDef, Column, GridApi, GridOptions, MenuItemDef, ProcessCellForExportParams, RowModelType, TabToNextCellParams } from 'ag-grid-community';

import { SearchOptionsHelper } from '@app/helpers/search-options.helper';
import { IdValue } from '@app/models';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { SearchState } from '@app/models/advanced-search/search-state';
import { KeyCodes } from '@app/models/enums/keycodes.enum';
import { HashTable } from '@app/models/hash-table';
import { IDateRendererParams } from '@app/modules/shared/_renderers/date-renderer/date-renderer.component';
import { IDropdownEditorRendererParams } from '@app/modules/shared/_renderers/dropdown-editor-renderer/dropdown-editor-renderer.component';
import { IModalEditorRendererParams } from '@app/modules/shared/_renderers/modal-editor-renderer/modal-editor-renderer.component';
import { IMultiselectDropdownEditorRendererParams } from '@app/modules/shared/_renderers/multiselect-dropdown-editor-renderer/multiselect-dropdown-editor-renderer.component';
import { IRangeEditorRendererParams } from '@app/modules/shared/_renderers/range-editor-renderer/range-editor-renderer.component';
import { ITextWithIconRendererParams } from '@app/modules/shared/_renderers/text-with-icon-renderer/text-with-icon-renderer.component';
import { ITextboxEditorRendererParams } from '@app/modules/shared/_renderers/textbox-editor-renderer/textbox-editor-renderer.component';
import { IDropdownColumnFilterParams } from '@app/modules/shared/grid/dropdown-column-filter/i-dropdown-column-filter-params';
import { IDropdownFloatingFilterParams } from '@app/modules/shared/grid/dropdown-column-filter/i-dropdown-floating-filter-params';
import { IAppDateFilterParams } from '@app/modules/shared/grid/grid-date-selector/grid-date-selector.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { GridId } from '../models/enums/grid-id.enum';
import { NavigationSettings } from '../modules/shared/action-bar/navigation-settings';
import { CustomTextColumnFilterParams, CustomTextFloatingFilterParams } from '../modules/shared/grid/custom-text-column-filter/custom-text-column-filter.component';
import { GridHeaderCheckboxComponent } from '../modules/shared/grid/grid-header-checkbox/grid-header-checkbox.component';
import { ArrayHelper } from './array.helper';
import { CommonHelper } from './common.helper';
import { ClaimSettlementLedgerEntryStatus } from '@app/models/enums';

export class AGGridHelper {
  public static get defaultGridOptions(): Partial<GridOptions> {
    return {
      enableCellTextSelection: true,
      suppressHorizontalScroll: false,
      suppressRowClickSelection: false,
      suppressCellFocus: false,
      suppressCopyRowsToClipboard: true,
      suppressMultiSort: true,
      sortingOrder: ['asc', 'desc'],
      rowSelection: 'multiple',
      rowModelType: this.ROW_MODEL_TYPE_SERVER_SIDE,
      pagination: true,
      paginationPageSize: 25,
      paginationAutoPageSize: false,
      cacheBlockSize: 25,
      maxBlocksInCache: 3,
      suppressPaginationPanel: true,
      suppressColumnVirtualisation: true,
      rowHeight: 40,
      headerHeight: 40,
      floatingFiltersHeight: 20,
      animateRows: false,
      defaultColDef: {
        suppressMovable: true,
        tooltipValueGetter: params => {
          const length: number = params.value ? params.value.length : 0;
          const maxLength = 75;
          return length > maxLength ? params.value as string : null;
        },
        minWidth: 120,
        autoHeight: true,
        resizable: true,
        sortable: false,
        comparator: AGGridHelper.compare,
        suppressKeyboardEvent: params => params.event.code === KeyCodes.ArrowUp
          || params.event.code === KeyCodes.ArrowDown,
        filter: false,
        floatingFilter: false,
      },
      tooltipShowDelay: 500,
      processCellForClipboard: AGGridHelper.processCellValueForClipboard,
      icons: {
        menuAlt: '<i class="fa fa-bars" style="padding-right: 5px;"/>',
      },
    };
  }

  public static ROW_MODEL_TYPE_CLIENT_SIDE: RowModelType = 'clientSide';
  public static ROW_MODEL_TYPE_SERVER_SIDE: RowModelType = 'serverSide';

  public static dateColumnFilter(dateFilterParams?: IAppDateFilterParams): Partial<ColDef> {
    return this.dateFilter((d1: Date, d2: Date) => d1.getTime() === d2.getTime(), dateFilterParams);
  }

  public static dateOnlyColumnFilter(dateFilterParams?: IAppDateFilterParams): Partial<ColDef> {
    return this.dateFilter((d1: Date, d2: Date) => d1.toLocaleDateString() === d2.toLocaleDateString(), dateFilterParams);
  }

  private static dateFilter(compareEqualDates: (d1: Date, d2: Date) => boolean, dateFilterParams?: IAppDateFilterParams): Partial<ColDef> {
    return {
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterValue: Date, cellValue: Date) => {
          const cellDate = new Date(
            cellValue.getFullYear(),
            cellValue.getMonth(),
            cellValue.getDate(),
          );
          const filterDate = new Date(
            filterValue.getFullYear(),
            filterValue.getMonth(),
            filterValue.getDate(),
          );

          if (compareEqualDates(filterDate, cellDate)) {
            return 0;
          }

          if (cellDate < filterDate) {
            return -1;
          }

          if (cellDate > filterDate) {
            return 1;
          }
        },
        ...dateFilterParams,
      },
    };
  }

  public static checkboxColumnDefaultParams(gridId: GridId): Partial<ColDef> {
    return {
      width: 40,
      maxWidth: 40,
      checkboxSelection: true,
      headerComponent: GridHeaderCheckboxComponent,
      headerComponentParams: { gridId, floatingFilter: false, pinned: true },
      pinned: 'left',
      floatingFilter: false,
    };
  }

  public static get fixedColumnDefaultParams(): Partial<ColDef> {
    return {
      resizable: false,
      suppressSizeToFit: true,
    };
  }

  public static get nameColumnDefaultParams(): Partial<ColDef> {
    return {
      minWidth: 150,
      width: 150,
      resizable: true,
      autoHeight: true,
      wrapText: true,
    };
  }

  public static get emailColumnDefaultParams(): Partial<ColDef> {
    return {
      width: 200,
      minWidth: 200,
      resizable: true,
    };
  }

  public static get dateColumnDefaultParams(): Partial<ColDef> {
    return {
      ...AGGridHelper.fixedColumnDefaultParams,
      width: 120,
    };
  }

  public static get dateTimeColumnDefaultParams(): Partial<ColDef> {
    return {
      ...AGGridHelper.fixedColumnDefaultParams,
      width: 170,
    };
  }

  public static get lastModifiedDateColumnDefaultParams(): Partial<ColDef> {
    return {
      ...AGGridHelper.fixedColumnDefaultParams,
      width: 160,
    };
  }

  public static get lastModifiedByColumnDefaultParams(): Partial<ColDef> {
    return {
      width: 150,
      minWidth: 150,
      resizable: true,
      suppressSizeToFit: true,
    };
  }

  public static get ssnColumnDefaultParams(): Partial<ColDef> {
    return {
      ...AGGridHelper.fixedColumnDefaultParams,
      width: 120,
    };
  }

  public static get phoneColumnDefaultParams(): Partial<ColDef> {
    return {
      ...AGGridHelper.fixedColumnDefaultParams,
      width: 130,
    };
  }

  public static get addressColumnDefaultParams(): Partial<ColDef> {
    return {
      minWidth: 200,
      width: 200,
      suppressSizeToFit: true,
    };
  }

  public static get cityColumnDefaultParams(): Partial<ColDef> {
    return {
      minWidth: 120,
      width: 120,
      suppressSizeToFit: true,
    };
  }

  public static get stateColumnDefaultParams(): Partial<ColDef> {
    return {
      width: 90,
      minWidth: 90,
      suppressSizeToFit: true,
    };
  }

  public static get zipColumnDefaultParams(): Partial<ColDef> {
    return {
      ...AGGridHelper.fixedColumnDefaultParams,
      width: 100,
    };
  }

  public static get countryColumnDefaultParams(): Partial<ColDef> {
    return {
      width: 150,
      minWidth: 150,
      suppressSizeToFit: true,
    };
  }

  public static get amountColumnDefaultParams(): Partial<ColDef> {
    return {
      width: 135,
      minWidth: 135,
      maxWidth: 135,
      suppressSizeToFit: true,
      ...AGGridHelper.rightAlignedParams,
    };
  }

  public static get rightAlignedParams(): Partial<ColDef> {
    return {
      cellStyle: { display: 'flex', 'justify-content': 'flex-end' },
      headerClass: 'ag-header-cell-aligned-right',
    };
  }

  public static getHideContextMenuFunction(columnId: string) {
    return params => {
      if (params?.column?.getId() === columnId) {
        return [];
      }

      return params.defaultItems;
    };
  }

  public static get tagColumnDefaultParams(): Partial<ColDef> {
    return {
      ...AGGridHelper.fixedColumnDefaultParams,
      width: 90,
      minWidth: 90,
      cellStyle: { display: 'flex', 'justify-content': 'center' },
      headerClass: 'ag-header-cell-centered',
    };
  }

  public static getCustomTextColumnFilter(floatingFilterComponentParams?: CustomTextColumnFilterParams | CustomTextFloatingFilterParams) {
    const isNumberFilter = floatingFilterComponentParams?.onlyNumbers || floatingFilterComponentParams?.isDecimal;

    const def: Partial<ColDef> = {
      filter: isNumberFilter ? 'agNumberColumnFilter' : 'agTextColumnFilter',
      floatingFilterComponent: 'customTextColumnFilter',
      floatingFilterComponentParams: { ...floatingFilterComponentParams },
      wrapText: true,
      autoHeight: true,
    };
    if (!isNumberFilter) {
      def.cellDataType = 'text';
    }

    if (floatingFilterComponentParams?.isNegativeNumber || floatingFilterComponentParams?.useDashAsAnEmptyValue) {
      def.filterParams = {
        allowedCharPattern: '\\d\\-\\,',
        numberParser(text: string) {
          const value = text ? text.replace(',', '.') : null;
          if (floatingFilterComponentParams?.useDashAsAnEmptyValue && value === '-') {
            return '';
          }
          return value == null || isNaN(+value)
            ? null
            : parseFloat(value);
        },
      };
      def.floatingFilterComponent = null;
    }
    return def;
  }

  public static getDropdownColumnFilter(floatingFilterComponentParams: IDropdownColumnFilterParams | IDropdownFloatingFilterParams, filter = 'agNumberColumnFilter') {
    return {
      filter,
      floatingFilterComponent: 'dropdownColumnFilter',
      floatingFilterComponentParams: { ...floatingFilterComponentParams },
    };
  }

  public static getMultiselectDropdownColumnFilter(floatingFilterComponentParams: IDropdownColumnFilterParams | IDropdownFloatingFilterParams, filter = 'agTextColumnFilter') {
    return {
      filter,
      floatingFilterComponent: 'multiselectDropdownColumnFilter',
      floatingFilterComponentParams: { ...floatingFilterComponentParams },
    };
  }

  public static getTruthyFalsyDropdownColumnFilter(floatingFilterComponentParams: IDropdownColumnFilterParams | IDropdownFloatingFilterParams, filter = 'agTextColumnFilter') {
    return {
      filter,
      floatingFilterComponent: 'dropdownColumnFilter',
      floatingFilterComponentParams: { ...floatingFilterComponentParams },
    };
  }

  public static getYesNoFilter() {
    return {
      ...AGGridHelper.getDropdownColumnFilter({
        options: [
          {
            id: 1,
            name: 'Yes',
          },
          {
            id: 0,
            name: 'No',
          },
        ],
      }),
    };
  }

  public static getTruthyFalsyYesNoFilter() {
    return {
      ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({
        options: [
          {
            id: 'true',
            name: 'Yes',
          },
          {
            id: 'false',
            name: 'No',
          },
        ],
      }),
    };
  }

  public static getTruthyFalsyCustomFilter(trueValue: string, falseValue: string) {
    return {
      ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({
        options: [
          {
            id: 'true',
            name: trueValue,
          },
          {
            id: 'false',
            name: falseValue,
          },
        ],
      }),
    };
  }

  public static getDocumentAccessFilter() {
    return {
      ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({
        options: [
          {
            id: 'true',
            name: 'Public',
          },
          {
            id: 'false',
            name: 'Internal',
          },
        ],
      }),
    };
  }

  public static getLienStatusInClaimantFilter() {
    return {
      ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({
        options: [
          {
            id: 'isNull',
            name: 'Unknown',
          },
          {
            id: 'true',
            name: 'Finalized',
          },
          {
            id: 'false',
            name: 'Pending',
          },
        ],
      }),
    };
  }

  public static getProbateSpiSyncedFilter() {
    return {
      ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({
        options: [
          {
            id: 'Yes',
            name: 'Yes',
          },
          {
            id: 'No',
            name: 'No',
          },
          {
            id: 'Out of date',
            name: 'Out of date',
          },
          {
            id: 'N/A',
            name: 'N/A',
          },
        ],
      }),
    };
  }

  public static getAttorneyStatusFilter() {
    return {
      ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({
        options: [
          {
            id: 'Unknown',
            name: 'Unknown',
          },
          {
            id: 'Approved',
            name: 'Approved',
          },
          {
            id: 'Hold',
            name: 'Hold',
          },
        ],
      }),
    };
  }

  public static getGenderFilter() {
    return {
      ...AGGridHelper.getDropdownColumnFilter({
        options: [
          {
            id: 'Male',
            name: 'Male',
          },
          {
            id: 'Female',
            name: 'Female',
          },

        ],
      }, 'agTextColumnFilter'),
    };
  }

  public static getMaritalStatusFilter() {
    return {
      ...AGGridHelper.getDropdownColumnFilter({
        options: [
          {
            id: 1,
            name: 'Married',
          },
          {
            id: 2,
            name: 'Single',
          },
          {
            id: 3,
            name: 'Divorced',
          },
          {
            id: 4,
            name: 'Widowed',
          },
        ],
      }),
    };
  }

  public static getLienStatusFilter() {
    return {
      ...AGGridHelper.getDropdownColumnFilter({
        options: [
          {
            id: 1,
            name: 'Pending Finalized',
          },
          {
            id: 2,
            name: 'System Finalized',
          },
          {
            id: 3,
            name: 'Agent Finalized',
          },
          {
            id: 4,
            name: 'Pending',
          },
        ],
      }),
    };
  }

  public static getDataSourceFilter() {
    return {
      ...AGGridHelper.getDropdownColumnFilter({
        options: [
          {
            id: 2,
            name: 'LPM',
          },
          {
            id: 6,
            name: 'ARCHER Connect',
          },
          {
            id: 7,
            name: 'Ragic',
          },
        ],
      }),
    };
  }

  public static getPercentageFilter() {
    return {
      filter: 'agNumberColumnFilter',
      filterParams: {
        allowedCharPattern: '\\d\\.',
        numberParser(text) {
          const value = text ? text.replace(',', '.').replace('%', '') : null;
          return value == null || isNaN(+value)
            ? null
            : parseFloat(CommonHelper.toPercentage(value, 10));
        },
      },
    };
  }

  public static getActiveInactiveFilter() {
    return {
      ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({
        options: [
          {
            id: 'true',
            name: 'Active',
          },
          {
            id: 'false',
            name: 'Inactive',
          },
        ],
      }),
    };
  }

  public static getDeliveryMethodFilter() {
    return {
      ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({
        options: [
          {
            id: 'true',
            name: 'E-Delivery',
          },
          {
            id: 'false',
            name: 'Postal',
          },
        ],
      }),
    };
  }

  /**
   * Returns dropdown renderer component for AG grid cells
   *
   * @static
   * @param {IDropdownEditorRendererParams} params
   * @param {string} [rendererName='dropdownRenderer']
   * @return {*}  {CellRendererSelectorResult}
   * @memberof AGGridHelper
   */
  public static getDropdownRenderer(params: IDropdownEditorRendererParams, rendererName = 'dropdownRenderer'): CellRendererSelectorResult {
    return {
      component: rendererName,
      params,
    };
  }

  /**
   * Returns modal window renderer component for AG grid cells
   *
   * @static
   * @param {IModalEditorRendererParams} params
   * @param {string} [rendererName='modalRenderer']
   * @return {*}  {CellRendererSelectorResult}
   * @memberof AGGridHelper
   */
  public static getModalRenderer(params: IModalEditorRendererParams, rendererName = 'modalRenderer'): CellRendererSelectorResult {
    return {
      component: rendererName,
      params,
    };
  }

  /**
   * Returns textbox renderer component for AG grid cells
   *
   * @static
   * @param {ITextboxEditorRendererParams} params
   * @param {string} [rendererName='textBoxRenderer']
   * @return {*}  {CellRendererSelectorResult}
   * @memberof AGGridHelper
   */
  public static getTextBoxRenderer(params: ITextboxEditorRendererParams, rendererName = 'textBoxRenderer'): CellRendererSelectorResult {
    return {
      component: rendererName,
      params,
    };
  }

  public static getRangeRenderer(params: IRangeEditorRendererParams, rendererName = 'rangeEditorRenderer'): CellRendererSelectorResult {
    return {
      component: rendererName,
      params,
    };
  }

  public static getLinkActionRenderer(params: any, rendererName = 'linkActionRenderer'): CellRendererSelectorResult {
    return {
      component: rendererName,
      params,
    };
  }

  public static getListRenderer(params: any, rendererName = 'listRenderer'): CellRendererSelectorResult {
    return {
      component: rendererName,
      params,
    };
  }

  public static getTextBoxWithIconRenderer(params: ITextWithIconRendererParams, rendererName = 'textWithIconRenderer'): CellRendererSelectorResult {
    return {
      component: rendererName,
      params,
    };
  }

  /**
   * Returns date renderer component for AG grid cells
   *
   * @static
   * @param {IDateRendererParams} params
   * @param {string} [rendererName='dateRenderer']
   * @return {*}  {CellRendererSelectorResult}
   * @memberof AGGridHelper
   */
  public static getDateRenderer(params: IDateRendererParams, rendererName = 'dateRenderer'): CellRendererSelectorResult {
    return {
      component: rendererName,
      params,
    };
  }

  /**
   * Returns multiselect renderer component for AG grid cells
   *
   * @static
   * @param {IMultiselectDropdownEditorRendererParams} params
   * @param {string} [rendererName='multiselectDropdownEditorRenderer']
   * @return {*}  {CellRendererSelectorResult}
   * @memberof AGGridHelper
   */
  public static getMultiselectDropdownEditorRenderer(params: IMultiselectDropdownEditorRendererParams, rendererName = 'multiselectDropdownEditorRenderer'): CellRendererSelectorResult {
    return {
      component: rendererName,
      params,
    };
  }

  public static getActionsColumn(cellRendererParams: any, width: number = 120, lockVisible: boolean = false): ColDef<any> | ColGroupDef<any> {
    return {
      headerName: 'Actions',
      colId: 'actions',
      cellRenderer: 'buttonRenderer',
      cellRendererParams,
      pinned: 'right',
      resizable: false,
      sortable: false,
      suppressMenu: true,
      suppressSizeToFit: true,
      width,
      maxWidth: width,
      minWidth: width,
      lockVisible,
      cellStyle: { display: 'flex', 'justify-content': 'center' },
      headerClass: 'ag-header-cell-centered',
    };
  }

  public static toLowerComparator = (valueA: string, valueB: string): number => valueA.toLowerCase().localeCompare(valueB.toLowerCase());

  public static arrayComparatorWithOptions = (options: IdValue[], valueA: number[], valueB: number[]) : number => {
    const [a, b] = ArrayHelper.findIdValueNameInArray(options, valueA, valueB);
    return AGGridHelper.toLowerComparator(a, b);
  };

  public static get numberColumnDefaultParams(): Partial<ColDef> {
    return {
      minWidth: 90,
      width: 90,
      resizable: true,
      suppressSizeToFit: true,
    };
  }

  public static agGridParamsToFilterModels(input: IServerSideGetRowsParamsExtended): FilterModel[] {
    return this.agGridFilterToFilterModels(input.request.filterModel);
  }

  public static agGridFilterToFilterModels(filterModel: any): FilterModel[] {
    const filterModels: FilterModel[] = [];

    Object.entries(filterModel).forEach(obj => {
      filterModels.push(SearchState.filterModelFromParam(obj));
    });

    return filterModels;
  }

  public static tabToNextInput(event): void {
    let nextSearchField = event.currentTarget.closest('.ag-header-cell').nextElementSibling;
    let nextSearchInput = nextSearchField?.querySelector('.search-input');

    while (nextSearchInput && nextSearchInput.disabled) {
      nextSearchField = nextSearchField.nextElementSibling;
      nextSearchInput = nextSearchField.querySelector('.search-input');
    }

    nextSearchInput?.focus();
  }

  public static compare(a, b) { // https://jira.s3betaplatform.com/browse/AC-3825
    if (typeof a === 'boolean' || typeof b === 'boolean'
        || typeof a === 'number' || typeof b === 'number') {
      return a - b;
    }

    if (typeof a === 'string' || !a) {
      a = a?.trim() || '';
    }

    if (typeof b === 'string' || !b) {
      b = b?.trim() || '';
    }

    if (typeof a === 'string') {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    }

    return a - b;
  }

  public static getDefaultSearchRequest(): IServerSideGetRowsRequestExtended {
    return {
      startRow: 0,
      endRow: 25,
      rowGroupCols: [],
      valueCols: [],
      pivotCols: [],
      pivotMode: false,
      groupKeys: [],
      filterModel: [],
      sortModel: [],
    };
  }

  public static getNavSettings(gridApi: GridApi): NavigationSettings {
    const selectedRows = gridApi.getSelectedNodes();
    return <NavigationSettings>{
      current: selectedRows.length > 0 ? selectedRows[0].rowIndex : -1,
      count: gridApi.paginationGetRowCount(),
    };
  }

  public static replaceSortColIdInSearchRequest(searchParams: IServerSideGetRowsRequestExtended, originalColId: string, newColId: string): void {
    if (searchParams.sortModel && searchParams.sortModel.length) {
      const sortModel = searchParams.sortModel.find(sm => sm.colId === originalColId);

      if (sortModel) {
        sortModel.colId = newColId;
      }
    }
  }

  private static processCellValueForClipboard(params: ProcessCellForExportParams): any {
    function getRenderedValue(params) {
      const { cellRenderer, cellRendererSelector } = params.column.getColDef();

      switch (true) {
        case typeof cellRenderer === 'function':
          return (cellRenderer as Function)(params);

        case typeof cellRendererSelector === 'function':
          return (cellRendererSelector as Function)(params)?.params?.value;
      }
    }

    return getRenderedValue(params) ?? params.value;
  }

  public static tabToNextEditableCell(param: TabToNextCellParams, gridApi: GridApi, editableColumnIds: string[]): CellPosition {
    if (!gridApi) {
      return null;
    }

    const nextEditableCell = AGGridHelper.findNextEditableCell(
      gridApi,
      editableColumnIds,
      param,
    );

    if (nextEditableCell) {
      AGGridHelper.focusEditableCell(gridApi, nextEditableCell.rowIndex, nextEditableCell.column.getColId());
    }

    return nextEditableCell;
  }

  private static findNextEditableCell(
    gridApi: GridApi,
    editableColumnIds: string[],
    param: TabToNextCellParams,
  ): CellPosition {
    const currentCol: Column = param.previousCellPosition.column;
    const totalRowsCount: number = gridApi.getDisplayedRowCount();
    const allColumns: Column[] = gridApi.getColumns();
    const totalColsCount: number = allColumns.length;

    let colIdx: number = allColumns.findIndex(cd => cd.getColId() === currentCol.getColId()) + 1;
    let rowIdx: number = param.previousCellPosition.rowIndex;
    let nextCellPosition: CellPosition = null;

    while (rowIdx < totalRowsCount) {
      const rowNode = gridApi.getRowNode(rowIdx.toString());

      while (colIdx < totalColsCount) {
        const col = allColumns[colIdx];

        if (col.isCellEditable(rowNode) && editableColumnIds.some(c => c === col.getColId())) {
          nextCellPosition = { column: col, rowIndex: rowIdx, rowPinned: null };
          return nextCellPosition;
        }

        colIdx++;
      }

      colIdx = 0;
      rowIdx++;
    }

    return nextCellPosition;
  }

  private static focusEditableCell(gridApi: GridApi, rowIdx: number, colId: string): void {
    gridApi.setFocusedCell(rowIdx, colId);
    const gridHtml = document.body.querySelector('.ag-body-viewport');
    const nextEditableTextInput = gridHtml?.querySelector<HTMLInputElement>('.ag-cell-editable.ag-cell-focus input[type="text"], .ag-cell-editable.ag-cell-focus select, .ag-cell-editable.ag-cell-focus input[type="checkbox"]');

    if (nextEditableTextInput) {
      setTimeout(() => {
        nextEditableTextInput.focus();
        if (nextEditableTextInput.select) {
          nextEditableTextInput.select();
        }
      });
    }
  }

  static getCustomContextMenu(customElements: (string | MenuItemDef)[]): (string | MenuItemDef)[] {
    const result: (string | MenuItemDef)[] = [
      ...customElements,
      'separator',
      'copy',
      'copyWithHeaders',
      'separator',
      'export',
    ];
    return result;
  }

  static extractFiltersFromQueryParams(queryParams, fieldTypes: Record<string, 'number' | 'string'> = {}): HashTable<FilterModel> {
    function gridFiltersReducer(gridFilters, paramName) {
      const [, prefix, name, postfix] = /^(filters)\.([\w\d]+)([*])?$/.exec(paramName);

      if (prefix !== 'filters' || !name) {
        return gridFilters;
      }

      const value = queryParams[paramName];
      const type = postfix === '*' ? 'contains' : 'equals';
      const filterType = fieldTypes[paramName] ?? 'string';

      return {
        ...gridFilters,
        [name]: SearchOptionsHelper.getContainsFilter(name, filterType, type, value),
      };
    }

    return Object.keys(queryParams).reduce(gridFiltersReducer, {});
  }

  public static GetDescription(statusId: number, enableIndividualAuthorize: boolean): string
  {
    switch (statusId) {
      case ClaimSettlementLedgerEntryStatus.PaymentAuthorized:
        return "Ledger Entry is already payment authorized";
      case ClaimSettlementLedgerEntryStatus.PartiallyProcessed:
        return "Ledger Entry has been partially processed";
      case ClaimSettlementLedgerEntryStatus.PartiallyPaid:
        return "Ledger Entry has been partially paid";
      case ClaimSettlementLedgerEntryStatus.Transferred:
        return "Ledger Entry has been transferred";
      case ClaimSettlementLedgerEntryStatus.PaymentAuthorizedPartial:
        return "Ledger Entry has been payment authorized partial";
      case ClaimSettlementLedgerEntryStatus.Pending:
        return !enableIndividualAuthorize ? "Ledger Entry belongs to an account with individual authorization disabled" : "";
      default:
        return "";
    }
  }
}
