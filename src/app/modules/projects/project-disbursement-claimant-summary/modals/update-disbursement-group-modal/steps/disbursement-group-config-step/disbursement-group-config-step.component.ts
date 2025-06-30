import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyHelper } from '@app/helpers';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { DisbursementGroupTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GetDisbursementGroupsGrid } from '@app/modules/projects/state/actions';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { filter, takeUntil } from 'rxjs/operators';
import * as disbursementGroupSelectors from '@app/modules/disbursement-groups/state/selectors';
import * as rootActions from '@app/state/root.actions';
import { GetDisbursementGroupStages, GetDisbursementGroupTypes, ResetDeficiencySettingsTemplates, ResetDisbursementGroupStages, ResetDisbursementGroupTypes } from '@app/modules/disbursement-groups/state/actions';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import * as fromShared from '../../../../../../shared/state';

@Component({
  selector: 'app-disbursement-group-config-step',
  templateUrl: './disbursement-group-config-step.component.html',
  styleUrls: ['./disbursement-group-config-step.component.scss'],
})
export class DisbursementGroupConfigStepComponent extends ListView implements OnInit, OnDestroy {
  @Input() projectId: number;
  @Output() selectGroup = new EventEmitter<number>();
  public readonly gridId: GridId = GridId.ProjectDisbursementGroupConfigList;

  public types$ = this.store.select(disbursementGroupSelectors.disbursementGroupTypes);
  public types: SelectOption[] = [];
  public stages$ = this.store.select(disbursementGroupSelectors.disbursementGroupStages);
  public stages: SelectOption[] = [];

  constructor(
    public readonly store: Store<fromShared.AppState>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    private readonly datePipe: DateFormatPipe,
  ) {
    super(router, elementRef);
  }

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        width: 40,
        maxWidth: 40,
        checkboxSelection: true,
        pinned: 'left',
        floatingFilter: false,
      },
      {
        headerName: 'ID',
        field: 'sequence',
        width: 50,
        maxWidth: 50,
        sortable: true,
        resizable: true,
        sort: 'desc',
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        minWidth: 220,
        width: 220,
        autoHeight: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Type',
        field: 'typeName',
        sortable: true,
        width: 160,
        minWidth: 160,
        colId: 'type.id',
        ...AGGridHelper.getDropdownColumnFilter({ options: this.types }),
      },
      {
        headerName: 'Stage',
        field: 'stageName',
        sortable: true,
        width: 150,
        minWidth: 150,
        colId: 'stage.id',
        ...AGGridHelper.getDropdownColumnFilter({ options: this.stages }),
      },
      {
        headerName: 'Payment Enabled',
        field: 'isPaymentEnabled',
        colId: 'paymentEnabled',
        sortable: true,
        cellRenderer: 'activeRenderer',
        cellClass: 'ag-cell-before-edit ag-cell-before-edit-centered',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 150,
      },
      {
        headerName: 'Claimant Count',
        sortable: true,
        field: 'claimantCount',
        colId: 'claimantCount',
        width: 130,
        minWidth: 130,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Total Amount',
        sortable: true,
        field: 'totalAmount',
        colId: 'totalAmount',
        cellRenderer: (data: ICellRendererParams): string => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Defense Approved Date',
        field: 'defenseApprovedDate',
        resizable: true,
        sortable: true,
        width: 180,
        minWidth: 180,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Settlement Approved Date',
        field: 'settlementApprovedDate',
        sortable: true,
        width: 190,
        minWidth: 190,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        resizable: false,
        suppressSizeToFit: true,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'ARCHER Approved Date',
        field: 'archerApprovedDate',
        sortable: true,
        width: 190,
        minWidth: 190,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Follow Up Date',
        field: 'followUpDate',
        sortable: true,
        resizable: false,
        suppressSizeToFit: true,
        width: 130,
        minWidth: 130,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        sortable: true,
        resizable: false,
        suppressSizeToFit: true,
        width: 130,
        minWidth: 130,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateColumnFilter(),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { activeRenderer: CheckboxEditorRendererComponent },
    onSelectionChanged: this.selectionChanged.bind(this),
  };

  ngOnInit(): void {
    this.store.dispatch(GetDisbursementGroupTypes());
    this.store.dispatch(GetDisbursementGroupStages());

    this.types$
      .pipe(filter((item: SelectOption[]) => item && !!item.length), takeUntil(this.ngUnsubscribe$))
      .subscribe((types: SelectOption[]) => {
        this.types.splice(0);
        this.types.push({ id: DisbursementGroupTypeEnum.Provisional, name: 'Provisional' }, ...types);
      });

    this.stages$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((stages: SelectOption[]) => {
        this.stages.push(...stages);
      });
  }

  public fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    const dgTypeEnum: FilterModel = {
      filter: DisbursementGroupTypeEnum.LienHoldbackRelease,
      filterTo: null,
      filterType: FilterTypes.Number,
      type: 'notEqual',
      dateFrom: null,
      dateTo: null,
      key: 'disbursementGroupTypeId',
      conditions: [],
    };
    agGridParams.request.filterModel = [
      ...agGridParams.request.filterModel,
      dgTypeEnum,
    ];
    this.store.dispatch(GetDisbursementGroupsGrid({ projectId: this.projectId, agGridParams }));
  }

  private selectionChanged(): void {
    const selectedRow = this.gridApi.getSelectedRows()[0];
    this.selectGroup.emit(selectedRow);
  }

  public ngOnDestroy(): void {
    this.store.dispatch(ResetDisbursementGroupTypes());
    this.store.dispatch(ResetDisbursementGroupStages());
    this.store.dispatch(ResetDeficiencySettingsTemplates());
    this.store.dispatch(rootActions.GridRowToggleCheckbox({ gridId: this.gridId, selectedRecordsIds: new Map() }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
