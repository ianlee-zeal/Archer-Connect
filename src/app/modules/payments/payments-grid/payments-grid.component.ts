/* eslint-disable no-restricted-globals */
import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';
import { filter, first, takeUntil } from 'rxjs/operators';

import { ColDef, GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { DateFormatPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { AdvancedSearchListView } from '@app/modules/shared/_abstractions/advanced-search-list-view';
import { SearchField } from '@app/models/advanced-search/search-field';
import { SearchConditionsEnum } from '@app/models/advanced-search/search-conditions.enum';
import { AppState } from '@app/modules/shared/state';
import { SearchState } from '@app/models/advanced-search/search-state';
import { SwitchEditState } from '@app/modules/shared/state/saved-search/actions';
import { ValidationService } from '@app/services/validation.service';
import { ModalService, MessageService } from '@app/services';
import { ColumnExport } from '@app/models';
import { PusherService } from '@app/services/pusher.service';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DefaultGlobalSearchType, EntityTypeEnum, ExportLoadingStatus, JobNameEnum, PermissionTypeEnum } from '@app/models/enums';

import { exportsSelectors } from '@shared/state/exports/selectors';
import * as fromAuth from '@app/modules/auth/state';
import * as exportsActions from '@shared/state/exports/actions';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { Pager, RelatedPage } from '@app/modules/shared/grid-pager';
import { GridId } from '@app/models/enums/grid-id.enum';
import { commonSelectors } from '@shared/state/common.selectors';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { StringHelper } from '@app/helpers';
import { PermissionService } from '../../../services/permissions.service';
import * as paymentsActions from '../state/actions';
import * as paymentsSelectors from '../state/selectors';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-payments-grid',
  templateUrl: './payments-grid.component.html',
  styleUrls: ['./payments-grid.component.scss'],
})
export class PaymentsGridComponent extends AdvancedSearchListView implements OnInit {
  @Input() isAdvancedSearchEnabled: boolean = true;
  entityType: EntityTypeEnum = EntityTypeEnum.Payments;
  @Input() entityTypeId: EntityTypeEnum;
  @Input() entityId: number;
  @Input() exportOnlyFilteredData: boolean = true;
  @Input() useHasTransferItemsFilter: boolean = true;

  public readonly gridId: GridId = GridId.Payments;

  public advancedSearch$ = this.store.select(paymentsSelectors.advancedSearch);
  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);
  public subOrganizations$ = this.store.select(paymentsSelectors.subOrganizations);
  public bankAccounts$ = this.store.select(paymentsSelectors.bankAccounts);
  public actionBar$ = this.store.select(paymentsSelectors.actionBar);
  protected readonly pager$ = this.store.select(commonSelectors.pager);

  protected readonly removedConditionsForDates = [
    SearchConditionsEnum.IsMissing,
    SearchConditionsEnum.InRange,
    SearchConditionsEnum.GreaterThan,
    SearchConditionsEnum.LessThan,
    SearchConditionsEnum.LessThanOrEqual,
    SearchConditionsEnum.GreaterThanOrEqual,
    SearchConditionsEnum.NotEqual,
  ];

  protected readonly removedConditionsForClearedDate = [
    SearchConditionsEnum.IsMissing,
    SearchConditionsEnum.GreaterThan,
    SearchConditionsEnum.LessThan,
    SearchConditionsEnum.LessThanOrEqual,
    SearchConditionsEnum.GreaterThanOrEqual,
    SearchConditionsEnum.NotEqual,
  ];

  protected readonly actionBar: ActionHandlersMap = {
    advancedSearch: {
      ...this.advancedSearchAction(),
      hidden: () => !this.isAdvancedSearchEnabled || this.showAdvancedSearch,
    },
    basicSearch: {
      ...this.basicSearchAction(),
      hidden: () => !this.isAdvancedSearchEnabled || !this.showAdvancedSearch,
    },
    clearFilter: this.clearFilterAction(),
    download: {
      disabled: () => (
        this.isExporting
        || (SearchState.hasErrors(this.searchState) && this.showAdvancedSearch)
        || (!this.exportOnlyFilteredData ? false : !this.canClearFilters())
      ),
      options: [{
        name: 'Standard',
        disabled: () => this.isExporting,
        callback: () => this.exportPaymentsSearchList(this.getAllColumnDefs()),
      }],
    },
    exporting: { hidden: () => !this.isExporting },
  };

  public downloadDisabled = true;

  protected timezone: string;

  protected hasSubOrgReadPermission = this.permissionService.canRead(PermissionTypeEnum.SubOrganizations);

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Payment ID',
        field: 'id',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Stop Payment Request',
        headerTooltip: 'Stop Payment Request',
        field: 'stopPaymentRequestId',
        sortable: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: data => this.yesNoPipe.transform(!!data.value),
      },
      {
        headerName: 'Check Verification',
        headerTooltip: 'Check Verification',
        field: 'checkVerificationsCount',
        sortable: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: data => this.yesNoPipe.transform(!!data.value),
      },
      {
        headerName: 'Method',
        field: 'paymentMethod.name',
        width: 140,
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Reference Number',
        field: 'referenceNumber',
        width: 150,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Memo Reference',
        field: 'memoReference',
        width: 150,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Payee Name',
        field: 'payeeName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Client ID',
        field: 'claimantIds',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Project ID(s)',
        field: 'projectIds',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Amount',
        field: 'amount',
        sortable: true,
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Disbursement Type',
        field: 'disbursementType',
        width: 150,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Submitted Date',
        field: 'dateSubmitted',
        sortable: true,
        sort: 'desc',
        cellRenderer: data => this.datePipe.transform(data.value, true, null, this.timezone, true),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Sent Date',
        field: 'dateSent',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, true, null, this.timezone, true),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Status',
        field: 'status',
        sortable: true,
        width: 80,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Cleared Date',
        field: 'clearedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Payer Name',
        field: 'resolvedPayerName',
        sortable: true,
        suppressSizeToFit: true,
        width: 120,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Payee ID',
        field: 'payeeExternalId',
        sortable: true,
        width: 100,
        ...AGGridHelper.fixedColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Address Line 1',
        field: 'payeeAddress1',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.addressColumnDefaultParams,
      },
      {
        headerName: 'City',
        field: 'payeeAddressCity',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.cityColumnDefaultParams,
      },
      {
        headerName: 'State',
        field: 'payeeAddressState',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.stateColumnDefaultParams,
      },
      {
        headerName: 'Zip Code',
        field: 'payeeAddressZip',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.zipColumnDefaultParams,
      },
      {
        headerName: 'Bank Accounts',
        field: 'payerAccount.name',
        width: 150,
        hide: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'External Transaction ID',
        field: 'externalTrxnId',
        hide: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Last Import Date',
        field: 'dateModified',
        hide: true,
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Last Modified Date',
        field: 'dateLastModified',
        hide: true,
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Source',
        field: 'dataSource.name',
        hide: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Tracking Number',
        field: 'trackingNumber',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },

    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    getContextMenuItems: () => [
      'copy',
      'copyWithHeaders',
    ],
  };

  public searchFields: SearchField[] = [
    SearchField.text('paymentMethod.name', 'Type', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.text('referenceNumber', 'Reference Number', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.text('memoReference', 'Memo Reference', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.text('payeeName', 'Payee Name', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.text('claimantIds', 'Client ID', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.text('projectIds', 'Project ID', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.number('amount', 'Amount', ValidationService.onlyCurrencyValidator, [SearchConditionsEnum.IsMissing]),
    SearchField.text('disbursementType', 'Disbursement Type', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.date('dateSubmitted', 'Submitted Date', null, this.removedConditionsForDates),
    SearchField.text('externalTrxnId', 'External Transaction ID'),
    SearchField.date('dateSent', 'Sent Date', null, this.removedConditionsForDates),
    SearchField.text('status', 'Status', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.date('clearedDate', 'Cleared Date', null, this.removedConditionsForClearedDate),
    SearchField.text('dataSource.name', 'Source', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.text('payeeExternalId', 'Payee ID', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.number('id', 'Payment ID', ValidationService.onlyNumbersValidator, [SearchConditionsEnum.IsMissing]),
    SearchField.none('', 'Address', null, [
      SearchField.text('payeeAddress1', 'Street', null, SearchConditionsEnum.Contains, [SearchConditionsEnum.IsMissing]),
      SearchField.text('payeeAddressCity', 'City', null, SearchConditionsEnum.Contains, [SearchConditionsEnum.IsMissing]),
      SearchField.text('payeeAddressState', 'State', null, SearchConditionsEnum.Contains, [SearchConditionsEnum.IsMissing]),
      SearchField.text('payeeAddressZip', 'Zip Code', ValidationService.zipCodePartialValidator, SearchConditionsEnum.Contains, [SearchConditionsEnum.IsMissing]),
    ]),
    SearchField.text('postageCode.name', 'Postage Code', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.text('trackingNumber', 'Tracking Number', null, null, [SearchConditionsEnum.IsMissing]),
    SearchField.date('dateModified', 'Last Import Date', null, [SearchConditionsEnum.IsMissing]),
    SearchField.date('dateLastModified', 'Last Modified Date', null, [SearchConditionsEnum.IsMissing]),
  ];

  public readonly searchType = DefaultGlobalSearchType.Payments;

  constructor(
    public store: Store<AppState>,
    public modalService: ModalService,
    public messageService: MessageService,
    public route: ActivatedRoute,
    protected actionsSubj: ActionsSubject,
    protected router: Router,
    protected datePipe: DateFormatPipe,
    protected elementRef: ElementRef,
    protected pusher: PusherService,
    protected readonly yesNoPipe: YesNoPipe,
    permissionService: PermissionService,

  ) {
    super(store, modalService, messageService, route, elementRef, router, permissionService);
  }

  public ngOnInit(): void {
    super.ngOnInit();

    if (this.hasSubOrgReadPermission) {
      this.store.dispatch(paymentsActions.GetSubOrganizations());

      this.searchFields.push(
        SearchField.none('payerAccount', 'Bank Accounts', null, [
          SearchField.data('payerAccount.organization.id', 'Sub Organization', 'id', 'name', SearchConditionsEnum.Equals, [
            SearchConditionsEnum.IsMissing,
            SearchConditionsEnum.NotEqual,
            SearchConditionsEnum.Contains,
          ], null, this.subOrganizations$, null, null, this.loadBankAccounts.bind(this), this.onConditionChange),
          SearchField.data('payerAccount.id', 'Bank Accounts', 'id', 'name', SearchConditionsEnum.Contains, [
            SearchConditionsEnum.IsMissing,
            SearchConditionsEnum.NotEqual,
            SearchConditionsEnum.Equals,
          ], null, this.bankAccounts$),
        ], true),
      );
    } else {
      this.store.dispatch(paymentsActions.GetUserOrgBankAccounts());

      this.searchFields.push(
        SearchField.data('payerAccount.id', 'Bank Accounts', 'id', 'name', SearchConditionsEnum.Contains, [
          SearchConditionsEnum.IsMissing,
          SearchConditionsEnum.NotEqual,
          SearchConditionsEnum.Equals,
        ], null, this.bankAccounts$),
      );
    }

    this.store.dispatch(paymentsActions.UpdatePaymentsSearchListActionBar({ actionBar: this.actionBar }));
    this.authStore$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.timezone = user.timezone && user.timezone.name;
    });

    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });
  }

  protected readonly exportOrder: string[] = [
    'Payment ID',
    'Stop Payment Request',
    'Payee Name',
    'Client ID',
    'Project ID(s)',
    'Payee ID',
    'Amount',
    'Disbursement Type',
    'Type',
    'Reference Number',
    'Memo Reference',
    'Address Line 1',
    'Address Line 2',
    'City',
    'State',
    'Zip Code',
    'Country',
    'Status',
    'Cleared Date',
    'Submitted Date',
    'Sent Date',
    'Last Update',
    'Postage Code',
    'Tracking Number',
    'External Transaction ID',
    'Bank ID',
    'Name',
    'Bank Name',
    'Account Number',
    'Source',
    'Last Import Date',
    'Stub Text',
  ];

  protected fetchData(params): void {
    // eslint-disable-next-line no-param-reassign
    if(this.useHasTransferItemsFilter)
    {
      this.setupTansferFilter(params);
    }
    params = this.mergeSearchFilters(params);
    this.gridParams = params;
    this.store.dispatch(paymentsActions.GetPayments({
      entityId: this.entityId,
      entityTypeId: this.entityTypeId,
      params,
    }));
  }

  protected onRowDoubleClicked({ data: row }): void {
    const navSettings = AGGridHelper.getNavSettings(this.getGridApi());

    if (row) {
      let relatedPage: RelatedPage;
      let parentPage: RelatedPage;
      this.pager$.pipe(
        first(),
      ).subscribe((pager: Pager) => {
        if (pager) {
          parentPage = pager.relatedPage;
        }
      });
      const payload: paymentsActions.IEntityPaymentsPayload = {
        id: row.id,
        entityId: this.entityId,
        entityType: this.entityTypeId,
        agGridParams: this.gridParams,
        parentPage,
      };
      this.store.dispatch(paymentsActions.GoToPaymentsDetails({ payload }));
      switch (this.entityTypeId) {
        case EntityTypeEnum.Clients:
          relatedPage = RelatedPage.PaymentsFromClaimant;
          break;
        case EntityTypeEnum.Projects:
          relatedPage = RelatedPage.PaymentsFromProject;
          break;
        default:
          relatedPage = RelatedPage.PaymentsFromSearch;
          break;
      }
      this.store.dispatch(commonActions.CreatePager({
        relatedPage,
        settings: navSettings,
        pager: { payload },
      }));
    }
  }

  protected exportPaymentsSearchList(columns: ColDef[]): void {
    const params = this.getExportParams();
    const columnsParam = columns.map(item => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.field,
      };
      return container;
    });
    columnsParam.sort((a, b) => this.exportOrder.indexOf(a.name) - this.exportOrder.indexOf(b.name));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(
      JobNameEnum.ExportPayments,
      this.entityId,
      this.entityTypeId,
    );

    this.channel = this.pusher.subscribeChannel(
      channelName,
      Object.keys(ExportLoadingStatus).filter(key => !isNaN(Number(ExportLoadingStatus[key.toString()]))),
      this.exportPaymentsSearchListCallback.bind(this),
      () => {
        this.store.dispatch(paymentsActions.StartDownloadPaymentsJob({
          agGridParams: params,
          columns: columnsParam,
          entityId: this.entityId,
          entityTypeId: this.entityTypeId,
          channelName,
        }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
        this.store.dispatch(paymentsActions.UpdatePaymentsSearchListActionBar({ actionBar: this.actionBar }));
      },
    );
  }

  public loadBankAccounts(optionId: number): void {
    this.store.dispatch(
      optionId ? paymentsActions.GetOrgBankAccounts({ orgId: optionId }) : paymentsActions.ClearOrgBankAccounts(),
    );
  }

  protected exportPaymentsSearchListCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.store.dispatch(paymentsActions.UpdatePaymentsSearchListActionBar({ actionBar: this.actionBar }));

    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(paymentsActions.DownloadPaymentsDocument({ id: data.docId }));
        break;

      case ExportLoadingStatus.Error:
        this.store.dispatch(paymentsActions.Error({ error: `Error exporting: ${data.message}` }));
        break;

      default:
        break;
    }
  }

  public markAsEdited(): void {
    if (this.isOnSavedSearch) {
      this.store.dispatch(SwitchEditState({ isEdited: true }));
    }
  }

  protected saveAdvancedSearch(): void {
    this.store.dispatch(paymentsActions.SaveSearchParams({ items: this.searchState }));
  }

  protected toggleAdvancedSearch(): void {
    super.toggleAdvancedSearch();
    this.store.dispatch(paymentsActions.SaveAdvancedSearchVisibility({ isVisible: this.showAdvancedSearch }));
  }

  protected getAllColumnDefs(): ColDef[] {
    return this.additionalColDefs
      ? this.gridOptions.columnDefs.filter(col => !this.additionalColDefs.find(addCol => 'field' in col && addCol.field === col.field))
        .concat(this.additionalColDefs)
      : [].concat(this.gridOptions.columnDefs);
  }

  public clearFilters(): void {
    if (this.isAdvancedSearchEnabled) {
      super.clearFilters();
    } else if (this.gridApi) {
      this.gridApi.setFilterModel(null);
      this.gridApi.onFilterChanged();
      this.filtersCleared.emit();
    }
  }

  protected onConditionChange(condition: string): void {
    if (!condition) {
      this.loadBankAccounts(null);
    }
  }

  protected setupTansferFilter(params: IServerSideGetRowsParamsExtended, isTransferSearch = false): void {
    const hasTransferItemsKey = 'hasTransferItems';
    const transferFilter = params.request.filterModel.find(p => p.key == hasTransferItemsKey);
    if (!transferFilter) {
      const filterByTransferItems: FilterModel = {
        key: hasTransferItemsKey,
        filter: isTransferSearch.toString(),
        filterType: FilterTypes.Boolean,
        type: SearchConditionsEnum.Equals,
        filterTo: null,
        dateFrom: null,
        dateTo: null
      }
      params.request.filterModel.push(filterByTransferItems);
    }
    else {
      transferFilter.filter = isTransferSearch.toString()
    }
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
  }
}
