import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
import { ActionsSubject, Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AppState } from '@app/modules/projects/state';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ModalService, PermissionService } from '@app/services';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { filter, first, takeUntil } from 'rxjs/operators';
import { BillingRule } from '@app/models/billing-rule/billing-rule';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { SearchOptionsHelper } from '@app/helpers';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';
import { TextboxEditorRendererComponent, TextboxEditorRendererDataType } from '@app/modules/shared/_renderers/textbox-editor-renderer/textbox-editor-renderer.component';
import { ofType } from '@ngrx/effects';
import { PriceType } from '@app/models/enums/billing-rule/price-type.enum';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { IdValue } from '@app/models';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import * as projectActions from '../../state/actions';
import * as projectSelectors from '../../state/selectors';
import { BrServicesCellRendererComponent } from '../renderers/services-cell-renderer/services-cell-renderer.component';
import { FeeCapModalComponent } from '../fee-cap-modal/fee-cap-modal.component';
import { FeeCapsListComponent } from '../fee-caps-list/fee-caps-list.component';

@Component({
  selector: 'app-billing-rules-list',
  styleUrls: ['./billing-rules-list.component.scss'],
  templateUrl: './billing-rules-list.component.html',
})
export class BillingRulesListComponent extends ListView {
  public readonly gridId = GridId.BillingRules;
  @ViewChild(FeeCapsListComponent) feeCapsListComponent: FeeCapsListComponent;

  private actionBarActionHandlers: ActionHandlersMap = {
    clearFilter: {
      callback: () => this.clearFiltersLocal(),
      disabled: () => !this.canClearFiltersLocal(),
    },
    new: {
      callback: () => this.navigateToBillingRuleCreation(),
      permissions: PermissionService.create(PermissionTypeEnum.BillingRule, PermissionActionTypeEnum.Create),
    },

    feeCap: { callback: () => this.createFeeCap() },
  };

  private feeScopeOpts: SelectOption[] = [];
  private statusOpts: SelectOption[] = [];
  private accountCodes: SelectOption[] = [];
  private iliGenerationOpts: SelectOption[] = [
    { id: 'Automated', name: 'Automated' },
    { id: 'Manual', name: 'Manual' },
  ];
  public readonly additionalPageItemsCountValues = [10];

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
        headerName: 'Name',
        field: 'name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 220,
        width: 220,
      },
      {
        headerName: 'Template',
        field: 'template.name',
        colId: 'billingRuleTemplateName',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Related Services',
        field: 'relatedServices',
        cellClassRules: { 'billing-rules-list-services': () => true },
        colId: 'serviceName',
        sortable: true,
        cellRenderer: 'servicesRenderer',
        cellRendererParams: { useShortNames: true, bullets: true },
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 220,
        width: 220,
      },
      {
        headerName: 'Price',
        field: 'price',
        width: 50,
        maxWidth: 100,
        sortable: true,
        resizable: true,
        valueFormatter(params) {
          if (params.data.isVariable) {
            return 'Variable Pricing Applies';
          }
          if (params.data.isOutcomeBased) {
            return 'Outcome Based Pricing';
          }
          // eslint-disable-next-line eqeqeq
          const priceIcon = (params.data.priceType == PriceType.Amount) ? '$' : '';
          // eslint-disable-next-line eqeqeq
          const percentIcon = (params.data.priceType == PriceType.Percentage) ? '%' : '';
          return (priceIcon + params.value + percentIcon);
        },
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Fee Scope',
        field: 'feeScope.name',
        colId: 'feeScopeName',
        sortable: true,
        minWidth: 120,
        width: 120,
        resizable: true,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({ options: this.feeScopeOpts }),
      },
      {
        headerName: 'Fee Generation',
        field: 'iliAutoGeneration',
        colId: 'ILIAutoGeneration',
        sortable: true,
        minWidth: 150,
        width: 150,
        resizable: true,
        cellRenderer: (param: any) => {
          const br: BillingRule = param.data;
          return br.iliAutoGeneration ? 'Automated' : 'Manual';
        },
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({ options: this.iliGenerationOpts }),
      },
      {
        headerName: 'Rev Rec Method',
        field: 'revRecMethod.name',
        colId: 'revRecMethodName',
        sortable: true,
        resizable: true,
        cellRenderer: (param: any) => {
          const br: BillingRule = param.data;
          return br.template?.revRecMethod ? br.template.revRecMethod.name : br.revRecMethod?.name;
        },
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
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
      {
        headerName: 'Fee Caps',
        field: 'billingRulesToFeeCaps.length',
        sortable: true,
        cellRendererSelector: params => (params.data.billingRulesToFeeCaps.length > 0
          ? AGGridHelper.getLinkActionRenderer({
            onAction: this.filterFeeCaps.bind(this),
            showLink: this.onShowLink.bind(this),
          })
          : AGGridHelper.getTextBoxRenderer({
            value: params.value,
            type: TextboxEditorRendererDataType.Text,
          })),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        width: 110,
        maxWidth: 110,
      },
      {
        headerName: 'QSF GL Code Account',
        field: 'chartOfAccount.name',
        colId: 'chartOfAccountName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 150,
        width: 150,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.accountCodes }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Created By',
        field: 'createdBy.displayName',
        colId: 'createdBy',
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
        colId: 'lastModifiedBy',
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
    paginationPageSize: 10,
    components: {
      servicesRenderer: BrServicesCellRendererComponent,
      linkActionRenderer: LinkActionRendererComponent,
      textBoxRenderer: TextboxEditorRendererComponent,
    },
    onRowDoubleClicked: ({ data }) => this.navigateToBillingRuleDetails(data.id),
  };

  private feeScopeOpts$ = this.store.select(selectors.feeScopes);
  private chartOfAccounts$ = this.store.select(selectors.chartOfAccounts);
  private statusOpts$ = this.store.select(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.BillingRule }));
  private project$ = this.store.select(projectSelectors.item);
  private projectId: number;
  private filteredByFeeCapId: number = 0;
  public filteredByContractRuleId: number = 0;

  private clearFiltersLocal(): void {
    this.clearFilters();
    if (this.filteredByFeeCapId) {
      this.filteredByFeeCapId = 0;
      if (this.feeCapsListComponent) {
        const feeCapGridApi = this.feeCapsListComponent.getGridApi();
        feeCapGridApi?.deselectAll();
      }
    }
    if (this.filteredByContractRuleId) {
      this.filteredByContractRuleId = 0;
      this.gridApi?.deselectAll();
      if (this.feeCapsListComponent) {
        const feeCapGridApi = this.feeCapsListComponent.getGridApi();
        feeCapGridApi?.setFilterModel(null);
        feeCapGridApi?.onFilterChanged();
        feeCapGridApi?.refreshHeader();
      }
    }
  }

  private canClearFiltersLocal(): boolean {
    return this.canClearFilters()
     || !!this.filteredByFeeCapId
     || !!this.filteredByContractRuleId;
  }

  constructor(
    private readonly store: Store<AppState>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    private route: ActivatedRoute,
    private modalService: ModalService,
    private actionsSubj: ActionsSubject,
    private readonly datePipe: DateFormatPipe,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
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

    this.chartOfAccounts$.pipe(
      filter(s => s && s.length && !this.accountCodes.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(opts => {
      const selectOpts = opts.map((o: IdValue) => ({ id: o.name, name: o.name }));
      this.accountCodes.push(...selectOpts);
    });

    this.project$.pipe(
      filter(p => !!p),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(p => {
      this.projectId = p.id;
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.CreateFeeCapSuccess,
        actions.UpdateFeeCapSuccess,
      ),
    ).subscribe(() => {
      this.searchBillingRules();
    });

    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBarActionHandlers }));
    this.store.dispatch(actions.GetFeeScopes());
    this.store.dispatch(actions.GetChartOfAccounts());
    this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.BillingRule }));
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;

    if (!!this.filteredByFeeCapId && this.gridParams.request.filterModel) {
      const key = 'billingRulesToFeeCaps.feeCapId';
      const keyIndex = this.gridParams.request.filterModel.findIndex(i => i.key === key);
      if (keyIndex !== -1) {
        this.gridParams.request.filterModel[keyIndex].filter = this.filteredByFeeCapId;
      } else {
        const filterModel = SearchOptionsHelper.getNumberFilter('billingRulesToFeeCaps.feeCapId', 'number', 'equals', this.filteredByFeeCapId);
        this.gridParams.request.filterModel.push(filterModel);
      }
    }

    this.searchBillingRules();
  }

  public onSelectFeeCap(feeCap: any) {
    this.filteredByFeeCapId = feeCap.id;
    if (this.gridParams) {
      const key = 'billingRulesToFeeCaps.feeCapId';
      const keyIndex = this.gridParams.request.filterModel.findIndex(i => i.key === key);
      if (keyIndex !== -1) {
        this.gridParams.request.filterModel[keyIndex].filter = this.filteredByFeeCapId;
      } else {
        const filterModel = SearchOptionsHelper.getNumberFilter('billingRulesToFeeCaps.feeCapId', 'number', 'equals', this.filteredByFeeCapId);
        this.gridParams.request.filterModel.push(filterModel);
      }
      this.gridParams.request.endRow = -1;
      this.gridParams.request.startRow = 0;
      this.gridParams.request.valueCols = [];
      this.store.dispatch(actions.SearchBillingRules({ gridParams: this.gridParams, projectId: this.projectId }));
    }
  }

  public gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  private searchBillingRules(): void {
    this.gridParams.request.endRow = -1;
    this.gridParams.request.startRow = 0;
    if (this.projectId) {
      this.store.dispatch(actions.SearchBillingRules({ gridParams: this.gridParams, projectId: this.projectId }));
    } else {
      this.project$
        .pipe(first(p => !!p))
        .subscribe(p => {
          this.store.dispatch(actions.SearchBillingRules({ gridParams: this.gridParams, projectId: p.id }));
        });
    }
  }

  private navigateToBillingRuleDetails(id: number): void {
    this.router.navigate([id], { relativeTo: this.route });
  }

  private navigateToBillingRuleCreation(): void {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  public createFeeCap(): void {
    this.modalService.show(FeeCapModalComponent, {
      class: 'fee-cap-modal',
      initialState: { projectId: this.projectId },
    });
  }

  public onShowLink(): boolean {
    return true;
  }

  filterFeeCaps({ data }) {
    this.filteredByContractRuleId = data.id;
    const feeCapGridParams = this.feeCapsListComponent.getParams();
    if (feeCapGridParams) {
      const key = 'billingRulesToFeeCaps.billingRuleId';
      const keyIndex = feeCapGridParams.request.filterModel.findIndex(i => i.key === key);
      if (keyIndex !== -1) {
        feeCapGridParams.request.filterModel[keyIndex].filter = this.filteredByContractRuleId;
      } else {
        const filterModel = SearchOptionsHelper.getNumberFilter(key, 'number', 'equals', this.filteredByContractRuleId);
        feeCapGridParams.request.filterModel.push(filterModel);
      }
      feeCapGridParams.request.endRow = -1;
      feeCapGridParams.request.startRow = 0;
      feeCapGridParams.request.valueCols = [];
      this.store.dispatch(actions.SearchFeeCaps({ feeCapsGridParams: feeCapGridParams }));
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }
}
