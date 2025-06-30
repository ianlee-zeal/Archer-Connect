import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { InjuryCategory } from '@app/models';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Router } from '@angular/router';
import { filter, first, takeUntil } from 'rxjs/operators';
import { TextboxEditorRendererComponent, TextboxEditorRendererDataType } from '@app/modules/shared/_renderers/textbox-editor-renderer/textbox-editor-renderer.component';
import { ModalService } from '@app/services';
import isNumber from 'lodash-es/isNumber';
import { RangeEditorRendererComponent } from '@app/modules/shared/_renderers/range-editor-renderer/range-editor-renderer.component';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';
import { FeeCap } from '@app/models/billing-rule/fee-cap';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { SearchOptionsHelper } from '@app/helpers';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { FeeCapModalComponent } from '../fee-cap-modal/fee-cap-modal.component';
import * as projectSelectors from '../../state/selectors';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-fee-caps-list',
  templateUrl: './fee-caps-list.component.html',
  styleUrls: ['./fee-caps-list.component.scss'],
})
export class FeeCapsListComponent extends ListView {
  public readonly gridId = GridId.FeeCaps;
  public injuryCategories: InjuryCategory[] = [];

  private injuryCategories$ = this.store.select(selectors.injuryCategories);
  private project$ = this.store.select(projectSelectors.item);
  private projectId: number;

  @Input() filteredByContractRuleId: number = 0;
  @Output()
  readonly onSelectFeeCap = new EventEmitter();

  constructor(
    private store: Store<any>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    private modalService: ModalService,
    private readonly datePipe: DateFormatPipe,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.store.dispatch(actions.SearchInjuryCategories({ term: '' }));

    this.injuryCategories$.pipe(
      filter(injuryCategories => injuryCategories && injuryCategories.length && !this.injuryCategories.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(opts => {
      this.injuryCategories.push(...opts);
    });

    this.project$.pipe(
      filter(p => !!p),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(p => {
      this.projectId = p.id;
    });
  }

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 50,
        maxWidth: 100,
        sortable: true,
        sort: 'desc',
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
        }),
      },
      {
        headerName: 'Fee Cap Name',
        field: 'name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 220,
        width: 220,
      },
      {
        headerName: 'Capped Price',
        field: 'cappedPriceDisplay',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.nameColumnDefaultParams,
        valueFormatter: data => (data.value ? (isNumber(data.data.cappedPrice) ? '$' : '') + data.value + (isNumber(data.data.cappedPricePct) ? '%' : '') : '-'),
      },
      {
        headerName: 'Award-based Cap',
        field: 'isAwardBased',
        sortable: true,
        cellRenderer: data => {
          if (data.value === null) {
            return '';
          }
          return data.value ? 'Yes' : 'No';
        },
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'Range',
        field: 'minSettlementAmount',
        sortable: true,
        valueFormatter: data => (data.data.isAwardBased ? data.value : '-'),
        cellRendererSelector: params => {
          const { minSettlementAmount, maxSettlementAmount, isAwardBased } = params.data;
          if (isAwardBased) {
            return AGGridHelper.getRangeRenderer({
              lowerValue: minSettlementAmount || '0',
              upperValue: maxSettlementAmount || '0',
            });
          }
          return AGGridHelper.getTextBoxRenderer({
            value: '-',
            type: TextboxEditorRendererDataType.Text,
          });
        },
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
        }),
      },
      {
        headerName: 'Injury Category',
        field: 'injuryCategoryId',
        sortable: true,
        minWidth: 150,
        width: 150,
        resizable: true,
        cellRendererSelector: params => {
          const { isAwardBased, injuryCategory } = params.data;
          if (isAwardBased) {
            return AGGridHelper.getTextBoxRenderer({
              value: injuryCategory?.name || '',
              type: TextboxEditorRendererDataType.Text,
            });
          }
          return AGGridHelper.getTextBoxRenderer({
            value: '-',
            type: TextboxEditorRendererDataType.Text,
          });
        },
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.injuryCategories$, searchable: true, callback: this.getInjuryCategories.bind(this) }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Contract Rules',
        colId: 'billingRulesToFeeCaps.count()',
        field: 'billingRulesToFeeCapsCount',
        sortable: true,
        cellRenderer: 'linkActionRenderer',
        cellRendererParams: {
          onAction: this.filterContractRules.bind(this),
          showLink: this.onShowLink.bind(this),
        },
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        minWidth: 210,
        width: 210,
      },
      {
        headerName: 'Created By',
        field: 'createdBy.displayName',
        sortable: true,
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        resizable: true,
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        sortable: true,
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        resizable: true,
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    pagination: false,
    onRowDoubleClicked: ({ data }) => this.editFeeCap(data),
    components: {
      textBoxRenderer: TextboxEditorRendererComponent,
      rangeEditorRenderer: RangeEditorRendererComponent,
      linkActionRenderer: LinkActionRendererComponent,
    },
  };

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;

    if (!!this.filteredByContractRuleId && this.gridParams.request.filterModel) {
      const key = 'billingRulesToFeeCaps.billingRuleId';
      const keyIndex = this.gridParams.request.filterModel.findIndex(i => i.key === key);
      if (keyIndex !== -1) {
        this.gridParams.request.filterModel[keyIndex].filter = this.filteredByContractRuleId;
      } else {
        const filterModel = SearchOptionsHelper.getNumberFilter(key, 'number', 'equals', this.filteredByContractRuleId);
        this.gridParams.request.filterModel.push(filterModel);
      }
    }

    if (this.projectId) {
      params.request.filterModel.push(new FilterModel({
        filter: this.projectId,
        filterType: FilterTypes.Number,
        key: 'projectId',
        type: 'equals',
      }));
      this.store.dispatch(actions.SearchFeeCaps({ feeCapsGridParams: this.gridParams }));
    } else {
      this.project$
        .pipe(first(p => !!p))
        .subscribe(p => {
          this.gridParams.request.filterModel.push(new FilterModel({
            filter: p.id,
            filterType: FilterTypes.Number,
            key: 'projectId',
            type: 'equals',
          }));

          this.store.dispatch(actions.SearchFeeCaps({ feeCapsGridParams: this.gridParams }));
        });
    }
  }

  public getInjuryCategories(searchTerm: string) {
    this.store.dispatch(actions.SearchInjuryCategories({ term: searchTerm }));
  }

  public editFeeCap(feeCap: FeeCap): void {
    this.modalService.show(FeeCapModalComponent, {
      class: 'fee-cap-modal',
      initialState: {
        feeCap,
        projectId: this.projectId,
      },
    });
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  filterContractRules({ data }) {
    const feeCapData = data as FeeCap;
    this.onSelectFeeCap.emit(feeCapData);
  }

  public onShowLink(e): boolean {
    return !!(e.data as FeeCap).id;
  }

  public getParams(): IServerSideGetRowsParamsExtended {
    return this.gridParams;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
