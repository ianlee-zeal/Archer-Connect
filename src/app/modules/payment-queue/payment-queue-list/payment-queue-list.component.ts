import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AGGridHelper, SearchOptionsHelper } from '@app/helpers';
import { SelectHelper } from '@app/helpers/select.helper';
import { ColumnExport } from '@app/models';
import { SearchConditionsEnum as SC } from '@app/models/advanced-search/search-conditions.enum';
import { SearchField } from '@app/models/advanced-search/search-field';
import { SearchState } from '@app/models/advanced-search/search-state';
import { DisbursementGroupStageEnum, EntityTypeEnum, GridId, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { AttorneyStatusEnum } from '@app/models/enums/attorney-status.enum';
import { overallInvoiceApprovalStatusOptions } from '@app/models/enums/overall-invoice-approval-status.enum';
import { IARApproval } from '@app/models/payment-queue/ar-approval-request';
import { SavedSearch } from '@app/models/saved-search';
import { ISearchOptions } from '@app/models/search-options';
import { GeneratePaymentRequestModalComponent, IGeneratePaymentRequestModalInitialState } from '@app/modules/projects/project-disbursement-claimant-summary/modals/generate-payment-request-modal/generate-payment-request-modal.component';
import { GenerateTransferRequestModalComponent, IGenerateTransferRequestModalInitialState } from '@app/modules/projects/project-disbursement-claimant-summary/modals/generate-transfer-request-modal/generate-transfer-request-modal.component';
import { getArcherFeesToPaySavedSearch } from '@app/modules/projects/project-disbursement-payment-queue/payment-queue-list/archer-fees-to-pay-filter';
import { PaymentQueueListComponent } from '@app/modules/projects/project-disbursement-payment-queue/payment-queue-list/payment-queue-list.component';
import { getReadyToInvoiceFeesSavedSearch } from '@app/modules/projects/project-disbursement-payment-queue/payment-queue-list/ready-to-invoice-fees-filter';
import * as paymentQueueActions from '@app/modules/projects/project-disbursement-payment-queue/state/actions';
import * as projectActions from '@app/modules/projects/state/actions';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { DateFormatPipe, EnumToArrayPipe, SplitCamelCasePipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { GridHeaderCheckboxComponent } from '@app/modules/shared/grid/grid-header-checkbox/grid-header-checkbox.component';
import { savedSearchSelectors } from '@app/modules/shared/state/saved-search/selectors';
import { MessageService, ModalService, PermissionService, ProductCategoriesService, StagesService } from '@app/services';
import { LogService } from '@app/services/log-service';
import { PusherService } from '@app/services/pusher.service';
import { ValidationService as VS } from '@app/services/validation.service';
import { gridLocalDataByGridId } from '@app/state';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { AppState, sharedActions, sharedSelectors } from '@shared/state';
import * as exportsActions from '@shared/state/exports/actions';
import { AgColumn, ColDef, ValueFormatterParams } from 'ag-grid-community';
import isEqual from 'lodash-es/isEqual';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { InvoiceArcherFeesModalComponent } from '../invoice-archer-fees-modal/invoice-archer-fees-modal.component';
import { PaymentQueueDataService } from '../payment-queue-data.service';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { RefundTransferRequestModalComponent } from '../refund-transfer-request/refund-transfer-request-modal.component';
import { LienAndProbateStatus } from '@app/models/enums/lien-and-probate-status.enum';

@Component({
  selector: 'app-payment-queue-list',
  templateUrl: './payment-queue-list.component.html',
  styleUrls: ['./payment-queue-list.component.scss'],
})
export class GlobalPaymentQueueListComponent extends PaymentQueueListComponent {
  public entityType: EntityTypeEnum = EntityTypeEnum.GlobalPaymentQueue;

  public gridId: GridId = GridId.GlobalPaymentQueue;
  public isFindReadyToInvoiceFeesActioned: boolean;
  public isFindArcherFeesToPayActioned: boolean;

  public showAdvancedSearch = false;
  public readonly advancedSearch$ = this.store.select(selectors.advancedSearch);
  public readonly showExpandBtn$ = this.store.select(selectors.showExpandBtn);

  public readonly gridParams$ = this.store.select(selectors.gridParams);

  public readonly coaNumbers$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.coaNumbers);
  public readonly coaGroupNumbers$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.coaGroupNumbers);

  private readonly getGlobalPaymentQueueCounts$ = new Subject<IServerSideGetRowsParamsExtended>();

  public firmApprovedStatusOptions: SelectOption[] = SelectHelper.enumToOptions(AttorneyStatusEnum, (option: SelectOption) => option.id, (option: SelectOption) => option.name);
  public disbursementGroupStageOptions: SelectOption[] = [
    { id: DisbursementGroupStageEnum.Approved, name: 'Approved' },
    { id: DisbursementGroupStageEnum.Draft, name: 'Draft' },
    { id: DisbursementGroupStageEnum.PendingApproval, name: 'Pending Approval' },
  ];

  public defenseApprovedDateIsSetOptions: SelectOption[] = [
    { id: 'true', name: 'Set' },
    { id: 'false', name: 'Not Set' },
  ];

  public productCategoryStatusOptions: SelectOption[] = [
    { id: LienAndProbateStatus.Finalized, name: 'Finalized' },
    { id: LienAndProbateStatus.NotFinalized, name: 'Not Finalized' },
    { id: LienAndProbateStatus.NotApplicable, name: 'Not Applicable' },
  ];

  constructor(
    public readonly store: Store<AppState>,
    public readonly modalService: ModalService,
    public readonly messageService: MessageService,
    public readonly route: ActivatedRoute,
    protected readonly elementRef: ElementRef,
    protected readonly router: Router,
    public readonly permissionService: PermissionService,
    protected readonly enumToArray: EnumToArrayPipe,
    protected readonly yesNoPipe: YesNoPipe,
    protected readonly splitCamelCase: SplitCamelCasePipe,
    protected readonly pusher: PusherService,
    protected readonly actionsSubj: ActionsSubject,
    protected readonly logger: LogService,
    protected readonly stagesService: StagesService,
    protected readonly productCategoriesService: ProductCategoriesService,
    protected readonly paymentQueueDataService: PaymentQueueDataService,
    protected readonly datePipe: DateFormatPipe,
  ) {
    super(
      store,
      modalService,
      messageService,
      route,
      pusher,
      elementRef,
      router,
      splitCamelCase,
      actionsSubj,
      permissionService,
      logger,
      enumToArray,
      yesNoPipe,
      stagesService,
      datePipe,
      productCategoriesService,
      paymentQueueDataService,
    );
    this.setColumOptions();
    this.setSearchField();
    this.setActionBar();
    this.currentSearch$ = this.store.select(savedSearchSelectors.currentSearchByEntityType({ entityType: this.entityType }));
    this.gridLocalData$ = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));
  }

  public searchFields = this.getSearchFields();

  ngOnInit(): void {
    super.ngOnInit();

    this.currentUrl = '/payment-queue/tabs/list';

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.ExportStandardRequestSuccess),
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
    });

    this.advancedSearch$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(({ searchParams }: { searchParams: SearchState[] }) => !!(searchParams && searchParams.length)),
      distinctUntilChanged((a: { searchParams: SearchState[] }, b: { searchParams: SearchState[] }) => isEqual(a, b)),
    ).subscribe(({ searchParams }:{ searchParams: SearchState[] }) => {
      const savedSearch: SavedSearch = getReadyToInvoiceFeesSavedSearch(
        this.searchFields,
        this.coaGroupNumbers$,
        this.firmApprovedStatusOptions,
        this.holdTypeReasons,
        this.bankruptcyStatuses,
        this.productCategories,
      );

      // If savedSearch is identical to searchParams then Find Ready to Invoice Fees action is run
      this.isFindReadyToInvoiceFeesActioned = isEqual(savedSearch.searchModel, searchParams);

      const findArcherFeesToPaySearch: SavedSearch = getArcherFeesToPaySavedSearch(
        this.searchFields,
        this.coaGroupNumbers$,
        this.ledgerEntryStatuses$,
        this.firmApprovedStatusOptions,
        this.holdTypeReasons,
        this.bankruptcyStatuses,
        this.productCategories,
      );

      // If savedSearch is identical to searchParams then Find ARCHER Fees To Paay action is run
      this.isFindArcherFeesToPayActioned = isEqual(findArcherFeesToPaySearch.searchModel, searchParams);
    });

    this.store.dispatch(sharedActions.dropDownsValuesActions.GetChartOfAccountGroupNumbers());
    this.store.dispatch(sharedActions.dropDownsValuesActions.GetChartOfAccountNumbers());

    // this.getGlobalPaymentQueueCounts$
    //   .pipe(
    //     debounceTime(1000),
    //     takeUntil(this.ngUnsubscribe$),
    //   ).subscribe((params: IServerSideGetRowsParamsExtended) => {
    //     this.store.dispatch(paymentQueueActions.GetPaymentQueueCounts({ projectId: null, agGridParams: params }));
    //   });
  }

  private COLUMN_KEYS: string[] = [
    'projectId', //
    'projectName', //
    'payeeOrgId',
    'ledgerEntryId',
    'archerId',
    'attorneyReferenceId',
    'clientId',
    'claimantFirstName',
    'claimantLastName',
    'claimantStatus',
    'claimentStatusId',
    'holdTypeReason',
    'coaFeePaymentSweepEnabled',
    'accountGroupNameWithNumber',
    'accountName',
    'overallInvoiceApprovalStatusName',
    'clientPrimaryFirmName',
    'payeeName',
    'assignedOrgName',
    'assignedOrgRelation',
    'transferToSubAccount',
    'status',
    'amount',
    'createdDate',
    'qsfAdminApprovalDate',
    'arApprovalDate',
    'disbursementGroupName',
    'disbursementGroupPaymentEnabled', //
    'defenseApprovedDateIsSet', //
    'disbursementGroupStageName', //
    'stage.name',
    'ledgerFirmApprovedStatusName', //
    'lienPaymentStageName',
    'lienStatusName',
    'lienResolutionProductCategoryStatusName', //
    'probateProductCategoryStatusName', //
    'claimantNetDisbursed',
    'bankruptcyStatusName',
    'bankruptcyStageName',
    'abandoned',
    'amountToTrustee',
    'amountToAttorney',
    'amountToClaimant',
    'lienId',
    'collectorName', //
    'claimantFundedDate', //
  ];

  private setColumOptions(): void {
    const onlyGlobalColumnDefs: ColDef<any>[] = [
      {
        headerName: 'Project Id',
        field: 'projectId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Project Name',
        field: 'projectName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Overall Invoice Approval Status',
        field: 'overallInvoiceApprovalStatusName',
        colId: 'overallInvoiceApprovalStatusId',
        width: 220,
        minWidth: 220,
        sortable: true,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({ options: overallInvoiceApprovalStatusOptions }),
      },
      {
        headerName: 'Collector Name',
        field: 'collectorName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        valueFormatter: (val: ValueFormatterParams): string => val.data.collectorName || 'N/A',
        width: 140,
        minWidth: 140,
      },
      {
        headerName: 'Disbursement Group Payment Enabled',
        headerTooltip: 'Disbursement Group Payment Enabled',
        field: 'disbursementGroupPaymentEnabled',
        sortable: true,
        width: 130,
        minWidth: 130,
        suppressSizeToFit: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: data => {
          if (data.value === null) {
            return '';
          }
          return data.value ? 'Yes' : 'No';
        },
      },
      {
        headerName: 'Firm Approval',
        field: 'ledgerFirmApprovedStatusName',
        colId: 'ledgerFirmApprovedStatusId',
        width: 220,
        minWidth: 220,
        sortable: true,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({ options: this.firmApprovedStatusOptions }),
      },
      {
        headerName: 'LPM Lien Status',
        field: 'lienResolutionProductCategoryStatusName',
        colId: 'lienResolutionProductCategoryStatusId',
        width: 220,
        minWidth: 220,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({ options: this.productCategoryStatusOptions }),
      },
      {
        headerName: 'Probate Status',
        field: 'probateProductCategoryStatusName',
        colId: 'probateProductCategoryStatusId',
        width: 220,
        minWidth: 220,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({ options: this.productCategoryStatusOptions }),
      },
      {
        headerName: 'Disbursement Group Stage',
        field: 'disbursementGroupStageName',
        colId: 'disbursementGroupStageId',
        width: 220,
        minWidth: 220,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({ options: this.disbursementGroupStageOptions }),
      },
      {
        headerName: 'DG Defense Approval Date is Set?',
        field: 'defenseApprovedDateIsSet',
        width: 220,
        minWidth: 220,
        cellRenderer: (data: any): string => (data.value ? 'Set' : 'Not Set'),
        ...AGGridHelper.getTruthyFalsyCustomFilter('Set', 'Not Set'),
      },
      {
        headerName: 'Claimant Funded Date',
        field: 'claimantFundedDate',
        resizable: true,
        sortable: true,
        cellRenderer: (data: any): string => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
    ];

    const allColumnDefs: ColDef[] = [];
    this.COLUMN_KEYS.forEach((columnKey: string) => {
      let found = this.gridOptions.columnDefs.find(c => 'field' in c && c.field === columnKey);
      if (!found) {
        found = onlyGlobalColumnDefs.find((c: ColDef) => c.field === columnKey);
      }

      if (found) {
        allColumnDefs.push(found);
      }
    });

    this.gridOptions = {
      ...this.gridOptions,
      columnDefs: [
        {
          width: 40,
          maxWidth: 40,
          checkboxSelection: true,
          headerComponent: GridHeaderCheckboxComponent,
          headerComponentParams: { gridId: this.gridId, floatingFilter: false, pinned: true },
          pinned: 'left',
          floatingFilter: false,
          lockPinned: true,
          lockPosition: true,
          lockVisible: true,
          suppressColumnsToolPanel: true,
        },
        ...allColumnDefs,
      ],
    };
  }

  private excludeSearchFields = [
    'disbursementGroupId',
    'holdTypeReason.holdTypeReasonId',
  ];

  private setSearchField(): void {
    const searchFields = this.searchFields.filter((f: SearchField) => !this.excludeSearchFields.some((v: string) => v === f.key));
    this.searchFields = [
      ...searchFields,
      SearchField.numberIdentifier('projectId', 'Project ID', VS.onlyNumbersValidator, SC.Equals, [SC.Contains, SC.StartsWith, SC.EndsWith, SC.NotContains]),
      SearchField.text('projectName', 'Project Name'),

      SearchField.dataWithCheckbox('holdTypeReason.holdTypeReasonId', 'Payment Hold Reason', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, undefined, 'Exclude Active Payment Hold', true, this.holdTypeReasons),
      SearchField.boolean('disbursementGroupPaymentEnabled', 'Disbursement Group Payment Enabled', undefined, 'Enabled'),
      SearchField.boolean('coaFeePaymentSweepEnabled', 'Fee Payment Sweep', undefined, 'Enabled'),
      SearchField.dataWithCheckbox('ledgerFirmApprovedStatusId', 'Firm Approval', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, undefined, 'Include Holdback Release Ledgers', false, this.firmApprovedStatusOptions),
      SearchField.boolean('lienResolutionFeeFinal', 'Lien Resolution Fee Final', undefined, 'Include only final Lien Resolution fees', undefined, undefined, undefined, 'true', true, 'Lien Fee is considered final when LPM Lien Status = Finalized'),
      SearchField.boolean('probateFeeFinal', 'Probate Fee Final', undefined, 'Include only final Probate fees', undefined, undefined, undefined, 'true', true, 'Probate Fee is considered final when Probate Status = Finalized'),
      SearchField.data('overallInvoiceApprovalStatusId', 'Overall Invoice Approval Status', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, overallInvoiceApprovalStatusOptions),
      SearchField.data('disbursementGroupStageId', 'Disbursement Group Stage', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, this.disbursementGroupStageOptions),
      SearchField.boolean('defenseApprovedDateIsSet', 'Disbursement Group Defense Approval Date', undefined, 'Is Not Null'),
      SearchField.date('claimantFundedDate', 'Claimant Funded Date', null, [SC.IsMissing]),
    ];
  }

  private setActionBar(): void {
    this.actionBar = {
      ...this.actionBar,
      paymentRequest: {
        disabled: () => !this.hasSelectedRow,
        callback: () => this.openPaymentRequestGenerationModal_GPQ(),
        permissions: PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.GeneratePaymentRequest),
      },
      transferRequest: {
        disabled: () => !this.hasSelectedRow,
        callback: () => this.openPaymentRequestGenerationModal_GPQ(EntityTypeEnum.FeatureFlag),
        permissions: PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferPayments),
      },
      download: {
        disabled: () => this.isExporting || (SearchState.hasErrors(this.searchState) && this.showAdvancedSearch),
        options: [
          { name: 'Standard', callback: () => this.standardExport(this.getAllColumnDefs()) },
          { name: 'Check Table', disabled: () => this.checkTableDisabled, callback: () => this.checkTableExport(this.getExportColumns()) },
        ],
      },
      actions: {
        options: [
          {
            name: 'Authorize Lien Entries',
            disabled: (): boolean => !this.hasSelectedRow,
            callback: this.onAuthorizeLienEntries.bind(this),
            permissions: PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.AuthorizeLienEntries),
          },
          {
            name: 'Find Liens to Pay',
            callback: this.onFindLiensToPay.bind(this),
            permissions: PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.FindLiensToPay),
          },
          {
            name: 'Update Lien Payment Stage',
            disabled: (): boolean => !this.hasSelectedRow,
            callback: this.onUpdateLienPaymentStage.bind(this),
            permissions: PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.UpdateLienPaymentStage),
          },
          {
            name: 'Copy Special Payment Instructions',
            disabled: (): boolean => !this.hasSelectedRow,
            callback: this.onCopySpecialPaymentInstruction_GPQ.bind(this),
            permissions: PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.CopySpecialPaymentInstructions),
          },
          {
            name: 'Find ARCHER Fees to Authorize',
            callback: this.onFindArcherFeesToPay.bind(this),
            permissions: PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.FindARCHERFeesToPay),
          },
          {
            name: 'Authorize ARCHER Fees',
            disabled: (): boolean => !this.hasSelectedRow || !this.isFindArcherFeesToPayActioned,
            callback: this.onAuthorizeArcherFees.bind(this),
            permissions: PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.AuthorizeARCHERFees),
          },
          {
            name: 'Review All ARCHER Fees',
            callback: this.onReviewAllARCHERFees.bind(this),
            permissions: PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.ReviewAllARCHERFees),
          },
          {
            name: 'AR approval',
            disabled: (): boolean => !this.hasSelectedRow,
            callback: this.onARApproval.bind(this),
            permissions: PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.ARApproval),
          },
          {
            name: 'Find Ready to Invoice Fees',
            callback: this.onFindReadyToInvoiceFees.bind(this),
            permissions: PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.FindReadytoInvoiceFees),
          },
          {
            name: 'Invoice ARCHER Fees',
            disabled: (): boolean => !this.hasSelectedRow || !this.isFindReadyToInvoiceFeesActioned,
            callback: this.onInvoiceArcherFees.bind(this),
            permissions: PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.InvoiceArcherFees),
          },
          {
            name: 'Refund Transfer Request',
            callback: this.onRefundTransferRequest.bind(this),
            permissions: PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.RefundTransferRequest),
          },
        ],
        hidden: () => !this.permissionService.hasAny([
          PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.FindLiensToPay),
          PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.UpdateLienPaymentStage),
          PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.CopySpecialPaymentInstructions),
          PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.FindARCHERFeesToPay),
          PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.AuthorizeARCHERFees),
          PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.ReviewAllARCHERFees),
          PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.ARApproval),
          PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.FindReadytoInvoiceFees),
          PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.InvoiceArcherFees),
          PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.RefundTransferRequest),

        ]),
      },
    };
  }

  protected getAllColumnDefs(): ColDef[] {
    // use user defined columns order and only visible columns
    let columnDefs = this.gridOptions.columnDefs;
    if (this.gridApi) {
      const allColumns = this.gridApi!.getAllGridColumns();
      columnDefs = allColumns.filter((col: AgColumn) => col.isVisible())
        .map((col: AgColumn) => col.getUserProvidedColDef());
    }

    return columnDefs;
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    const agGridParams = this.mergeSearchFilters(params);
    this.gridParams = agGridParams;
    this.store.dispatch(actions.GetPaymentQueueList({ agGridParams }));
    this.getGlobalPaymentQueueCounts$.next(agGridParams);
  }

  protected onSubscribedCallback(columns: ColumnExport[], channelName: string): void {
    this.store.dispatch(actions.ExportStandardRequest({
      searchOptions: this.getStandardExportParams(this.gridLocalData),
      columns,
      channelName,
    }));
  }

  protected onFindArcherFeesToPay(): void {
    this.router.navigate([this.currentUrl]);
    super.clearFilters();

    const savedSearch: SavedSearch = getArcherFeesToPaySavedSearch(
      this.searchFields,
      this.coaGroupNumbers$,
      this.ledgerEntryStatuses$,
      this.firmApprovedStatusOptions,
      this.holdTypeReasons,
      this.bankruptcyStatuses,
      this.productCategories,
    );

    this.restoreAdvancedSearch(savedSearch.searchModel, true);
    this.setAdvancedSearchVisible(true);
    this.dispatchSetShowExpandButtonForFilters(true);

    if (this.gridApi) {
      this.gridApi.onFilterChanged();
    }
    this.dispatchSaveSearchParams(savedSearch.searchModel);
  }

  protected onFindReadyToInvoiceFees(): void {
    this.router.navigate([this.currentUrl]);
    super.clearFilters();

    const savedSearch: SavedSearch = getReadyToInvoiceFeesSavedSearch(
      this.searchFields,
      this.coaGroupNumbers$,
      this.firmApprovedStatusOptions,
      this.holdTypeReasons,
      this.bankruptcyStatuses,
      this.productCategories,
    );

    this.restoreAdvancedSearch(savedSearch.searchModel, true);
    this.setAdvancedSearchVisible(true);
    this.dispatchSetShowExpandButtonForFilters(true);

    if (this.gridApi) {
      this.gridApi.onFilterChanged();
    }
    this.dispatchSaveSearchParams(savedSearch.searchModel);
  }

  protected onInvoiceArcherFees(): void {
    this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: true }));
    const searchOptions: ISearchOptions = {
      ...SearchOptionsHelper.createSearchOptions(this.gridLocalData, this.gridParams),
    };

    const request: IARApproval = {
      searchOptions,
    };

    this.modalService.show(InvoiceArcherFeesModalComponent, {
      class: 'invoice-archer-fees-modal',
      initialState: {
        projectId: this.projectId,
        searchOptions,
        gridId: this.gridId,
        gridParams$: this.gridParams$,
        request,
      },
    });
  }

  private onCopySpecialPaymentInstruction_GPQ(): void {
    if (this.gridApi) {
      const projectIdsAreSame = this.allProjectIdsAreSame();
      if (projectIdsAreSame.result) {
        this.onCopySpecialPaymentInstruction(projectIdsAreSame.projectId);
      } else {
        this.messageService.showAlertDialog(
          'Copy Special Payment Instructions Error',
          'Selected entries are not in the same project, please refine your selection',
          'Ok',
        );
      }
    }
  }

  private openPaymentRequestGenerationModal_GPQ(modalType?: EntityTypeEnum): void {
    if (this.gridApi) {
      const selectedRows = this.gridApi.getSelectedRows();
      const projectId = selectedRows[0].projectId;
      const allProjectIdsAreSame = selectedRows?.every((row: any) => row.projectId === selectedRows[0].projectId);
      if (allProjectIdsAreSame) {
        this.openPaymentRequestModal(projectId, modalType);
      } else {
        this.messageService.showAlertDialog(
          'Payment Request Error',
          'Selected entries are not in the same project, please refine your search',
          'Ok',
        );
      }
    }
  }

  private openPaymentRequestModal(projectId: number, modalType?: EntityTypeEnum): void {
    this.store.dispatch(paymentQueueActions.GetChartOfAccountGroupNumbers({ projectId }));
    this.store.dispatch(paymentQueueActions.GetChartOfAccountNumbers({ projectId }));
    this.store.dispatch(projectActions.GetProjectOrgsDropdownValues({ projectId }));
    if (this.permissionService.canRead(PermissionTypeEnum.Organizations)) {
      this.store.dispatch(projectActions.GetProjectFirmsOptions({ projectId }));
    }
    const advancedSearchFiltersAndGridFilters = this.mergeSearchFilters(this.gridParams);

    const searchOptions: ISearchOptions = {
      ...AGGridHelper.getDefaultSearchRequest(),
      ...SearchOptionsHelper.createSearchOptions(this.gridLocalData, advancedSearchFiltersAndGridFilters),
    };

    if (modalType === EntityTypeEnum.FeatureFlag) {
      this.modalService.show(GenerateTransferRequestModalComponent, {
        class: 'generate-transfer-request-modal',
        initialState: this.buildGlobalTransferRequestModalState(searchOptions, projectId) as Partial<GenerateTransferRequestModalComponent>,
      });
    } else {
      this.modalService.show(GeneratePaymentRequestModalComponent, {
        class: 'generate-payment-request-modal',
        initialState: this.buildGlobalModalState(searchOptions, projectId) as Partial<GeneratePaymentRequestModalComponent>,
      });
    }
  }

  protected onRefundTransferRequest(): void {
    this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: true }));

    this.modalService.show(RefundTransferRequestModalComponent, {
      class: 'refund-transfer-request-modal',
      initialState: {
        projectId: this.projectId,
        gridId: this.gridId,
        gridParams$: this.gridParams$,
      },
    });
  }

  private buildGlobalModalState(searchOptions: ISearchOptions, projectId: number): IGeneratePaymentRequestModalInitialState {
    return {
      projectId,
      searchOptions,
      paymentRequestEntityType: EntityTypeEnum.ClaimSettlementLedgerEntries,
      isGlobal: true,
    };
  }

  protected buildGlobalTransferRequestModalState(searchOptions: ISearchOptions, projectId: number): IGenerateTransferRequestModalInitialState {
    return {
      projectId,
      searchOptions,
      transferRequestEntityType: EntityTypeEnum.Projects,
      isGlobal: true,
    };
  }

  protected dispatchSaveSearchParams(items: SearchState[]): void {
    this.store.dispatch(actions.SaveSearchParams({ items }));
  }

  protected dispatchSaveAdvancedSearchVisibility(isVisible: boolean): void {
    this.store.dispatch(actions.SaveAdvancedSearchVisibility({ isVisible }));
  }

  protected dispatchSetShowExpandButtonForFilters(showExpandBtn: boolean): void {
    this.store.dispatch(actions.SetShowExpandButtonForFilters({ showExpandBtn }));
  }

  private allProjectIdsAreSame(): { result: boolean, projectId?: number; } {
    if (this.gridApi) {
      const selectedRows = this.gridApi.getSelectedRows();
      const projectId = selectedRows[0].projectId;
      const same = selectedRows?.every((row: any) => row.projectId === selectedRows[0].projectId);
      return { result: same, projectId: same ? projectId : undefined };
    }
    return { result: false };
  }
}
