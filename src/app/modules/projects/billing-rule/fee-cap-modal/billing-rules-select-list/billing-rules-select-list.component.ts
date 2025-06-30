import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GridApi, GridOptions, RowSelectedEvent } from 'ag-grid-community';
import { ActionsSubject, Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AppState } from '@app/modules/projects/state';
import { EntityTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { filter, takeUntil } from 'rxjs/operators';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { GridHeaderCheckboxComponent } from '@app/modules/shared/grid/grid-header-checkbox/grid-header-checkbox.component';
import { Observable } from 'rxjs';
import { IGridLocalData } from '@app/state/root.state';
import { gridLocalDataByGridId } from '@app/state/index';
import { SelectHelper } from '@app/helpers/select.helper';
import { GridRowToggleCheckbox, SetAllRowSelected } from '@app/state/root.actions';
import { ofType } from '@ngrx/effects';
import { BrServicesCellRendererComponent } from '../../renderers/services-cell-renderer/services-cell-renderer.component';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';

@Component({
  selector: 'app-billing-rules-select-list',
  templateUrl: './billing-rules-select-list.component.html',
})
export class BillingRulesSelectListComponent extends ListView {
  public readonly gridId = GridId.BillingRulesSelection;

  @Input() projectId: number;

  @Input() selectedEntities: any[] = [];

  @Output()
  readonly onEntitySelect = new EventEmitter();

  private feeScopeOpts: SelectOption[] = [];
  private statusOpts: SelectOption[] = [];

  private isAllRowInitialized: boolean = false;
  private isAllRowSelected: boolean = false;
  private gridLocalData$: Observable<IGridLocalData> = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    onRowSelected: this.onRowSelected.bind(this),
    columnDefs: [
      {
        width: 40,
        maxWidth: 40,
        checkboxSelection: true,
        headerComponent: GridHeaderCheckboxComponent,
        headerComponentParams: { gridId: this.gridId, floatingFilter: false, pinned: true },
        pinned: 'left',
        floatingFilter: false,
      },
      {
        headerName: 'ID',
        field: 'id',
        width: 50,
        maxWidth: 100,
        sortable: true,
        sort: 'desc',
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
        }),
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Related Services',
        field: 'relatedServices',
        colId: 'serviceName',
        sortable: false,
        cellRenderer: 'servicesRenderer',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 210,
        width: 210,
      },
      {
        headerName: 'Scope',
        field: 'feeScope.name',
        colId: 'feeScopeName',
        sortable: true,
        minWidth: 150,
        width: 150,
        resizable: true,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({ options: this.feeScopeOpts }),
      },
      {
        headerName: 'Status',
        field: 'status.name',
        colId: 'statusName',
        sortable: true,
        minWidth: 150,
        width: 150,
        resizable: true,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({ options: this.statusOpts }),
      },
    ],
    pagination: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { servicesRenderer: BrServicesCellRendererComponent },
    rowSelection: 'multiple',
    rowMultiSelectWithClick: true,
  };

  private feeScopeOpts$ = this.store.select(selectors.feeScopes);
  private statusOpts$ = this.store.select(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.BillingRule }));

  constructor(
    private readonly store: Store<AppState>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    private actionsSubj: ActionsSubject,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.isAllRowInitialized = false;
    this.feeScopeOpts$.pipe(
      filter(s => s && s.length && !this.feeScopeOpts.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(opts => {
      const selectOpts = opts.map(o => ({ id: o.name, name: o.name }));
      this.feeScopeOpts.push(...selectOpts);
    });

    this.statusOpts$.pipe(
      filter(s => s && s.length && !this.statusOpts.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(opts => {
      const selectOpts = opts.map(o => ({ id: o.name, name: o.name }));
      this.statusOpts.push(...selectOpts);
    });

    this.store.dispatch(actions.GetFeeScopes());
    this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.BillingRule }));

    this.gridLocalData$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((data: IGridLocalData) => {
        this.isAllRowSelected = data?.isAllRowSelected;
      });

    const selectedEntitiesLocal = this.selectedEntities;
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.SearchBillingRulesSuccess,
      ),
    ).subscribe(({ totalRecordsCount }) => {
      if (!this.isAllRowInitialized) {
        this.isAllRowInitialized = true;
        if (selectedEntitiesLocal?.length) {
          const allSelected: boolean = selectedEntitiesLocal?.length === totalRecordsCount;

          if (allSelected) {
            this.store.dispatch(SetAllRowSelected({ gridId: this.gridId, isAllRowSelected: true }));
          } else {
            this.store.dispatch(GridRowToggleCheckbox({
              gridId: this.gridId,
              selectedRecordsIds: this.selectedRecordsIds,
            }));
          }
        }
      }
    });
  }

  private onRowSelected(event: RowSelectedEvent): void {
    if (event.node.rowIndex !== null) {
      const { data } = event.node;

      const existingRecord = this.selectedEntities.find(entity => entity.key === data.id);
      const isSelected = event.node.isSelected();

      if (existingRecord) {
        existingRecord.selected = isSelected;
      } else {
        const value = SelectHelper.toKeyValuePair(data);
        const newRecord = { ...value, selected: isSelected };

        this.selectedEntities.push(newRecord);
      }

      if (this.isAllRowSelected && !isSelected) {
        this.store.dispatch(SetAllRowSelected({
          gridId: this.gridId,
          isAllRowSelected: false,
        }));
      }

      this.store.dispatch(GridRowToggleCheckbox({
        gridId: this.gridId,
        selectedRecordsIds: this.selectedRecordsIds,
      }));

      this.onEntitySelect.emit(this.selectedEntities.filter(s => s.selected));
    }
  }

  public get selectedRecordsIds(): Map<string, boolean> {
    return new Map<string, boolean>(this.selectedEntities.map(entity => [entity.key, entity.selected]));
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    this.gridParams.request.endRow = -1;
    this.gridParams.request.startRow = 0;
    this.store.dispatch(actions.SearchBillingRules({ gridParams: this.gridParams, projectId: this.projectId }));
  }

  public gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
  }

  ngOnDestroy(): void {
    this.selectedEntities = [];
    this.store.dispatch(rootActions.ClearGridLocalData({ gridId: GridId.BillingRulesSelection }));
    super.ngOnDestroy();
  }
}
