import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import isEqual from 'lodash-es/isEqual';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map, takeUntil } from 'rxjs/operators';

import { CurrencyHelper, SearchOptionsHelper, StringHelper } from '@app/helpers';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { SearchField } from '@app/models/advanced-search/search-field';
import {
  ClaimSettlementLedgerEntryStatus,
  ClientWorkflowAdvancedSearchKey as CW,
  EntityTypeEnum,
  ExportLoadingStatus,
  JobNameEnum,
  PermissionActionTypeEnum,
  PermissionTypeEnum,
  ProductCategory,
  ProductWorkflowAdvancedSearchKey as PW,
  SearchGroupType as SG,
} from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { AdvancedSearchListView } from '@app/modules/shared/_abstractions/advanced-search-list-view';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { MessageService, ModalService, PermissionService, ProductCategoriesService, StagesService, ValidationService } from '@app/services';
import { ActionsSubject, Store } from '@ngrx/store';
import { AppState, sharedActions } from '@shared/state';
import { ColDef, ColGroupDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ObservableOptionsHelper } from '@app/helpers/observable-options.helper';
import { SelectHelper } from '@app/helpers/select.helper';
import { ColumnExport, IdValue } from '@app/models';
import { SearchConditionsEnum as SC } from '@app/models/advanced-search/search-conditions.enum';
import { SearchState } from '@app/models/advanced-search/search-state';
import { BatchActionDto } from '@app/models/batch-action/batch-action';
import { DisbursementGroupLight } from '@app/models/disbursement-group-light';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { HoldType } from '@app/models/hold-type';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings';
import { PaymentQueueCounts } from '@app/models/payment-queue-counts';
import { IARApproval } from '@app/models/payment-queue/ar-approval-request';
import { SavedSearch } from '@app/models/saved-search';
import { ISearchOptions } from '@app/models/search-options';
import { GetLedgerStages } from '@app/modules/claimants/claimant-details/state/actions';
import { AuthorizeArcherFeesModalComponent } from '@app/modules/payment-queue/authorize-archer-fees-modal/authorize-archer-fees-modal.component';
import { AuthorizeLienEntriesModalComponent } from '@app/modules/payment-queue/authorize-lien-entries-modal/authorize-lien-entries-modal.component';
import { CopySpecialPaymentInstructionsModalComponent } from '@app/modules/payment-queue/copy-special-payment-instructions-modal/copy-special-payment-instructions-modal.component';
import { PaymentQueueDataService } from '@app/modules/payment-queue/payment-queue-data.service';
import { getReviewAllArcherFeesSavedSearch } from '@app/modules/payment-queue/review-all-archer-fees-filter';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { DateFormatPipe, EnumToArrayPipe, SplitCamelCasePipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { GridHeaderCheckboxComponent } from '@app/modules/shared/grid/grid-header-checkbox/grid-header-checkbox.component';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { GetSavedSearchListByEntityType, ResetCurrentSearch } from '@app/modules/shared/state/saved-search/actions';
import { savedSearchSelectors } from '@app/modules/shared/state/saved-search/selectors';
import { LogService } from '@app/services/log-service';
import { PusherService } from '@app/services/pusher.service';
import { ValidationService as VS } from '@app/services/validation.service';
import { gridLocalDataByGridId } from '@app/state';
import { IGridLocalData } from '@app/state/root.state';
import { ofType } from '@ngrx/effects';
import { TypedAction } from '@ngrx/store/src/models';
import { ActionHandlersMap } from '@shared/action-bar/action-handlers-map';
import * as exportsActions from '@shared/state/exports/actions';
import { Channel } from 'pusher-js';
import * as claimantActions from '../../../claimants/claimant-details/state/actions';
import * as claimantSelectors from '../../../claimants/claimant-details/state/selectors';
import * as globalPaymentQueueActions from '../../../payment-queue/state/actions';
import { UpdateLienPaymentStageModalComponent } from '../../../payment-queue/update-lien-payment-stage-modal/update-lien-payment-stage-modal.component';
import * as fromShared from '../../../shared/state';
import { GeneratePaymentRequestModalComponent, IGeneratePaymentRequestModalInitialState } from '../../project-disbursement-claimant-summary/modals/generate-payment-request-modal/generate-payment-request-modal.component';
import { GenerateTransferRequestModalComponent, IGenerateTransferRequestModalInitialState } from '../../project-disbursement-claimant-summary/modals/generate-transfer-request-modal/generate-transfer-request-modal.component';
import * as projectActions from '../../state/actions';
import * as projectSelectors from '../../state/selectors';
import { AccountRendererComponent } from '../renderers/account-renderer/account-renderer-component';
import { BankruptcyStatusRendererComponent } from '../renderers/bk-status-renderer/bk-status-renderer.component';
import { PaymentQueueRendererComponent } from '../renderers/payment-queue-buttons-renderer';
import * as paymentQueueActions from '../state/actions';
import * as paymentQueueSelectors from '../state/selectors';
import { advancedSearch, bankruptcyStages, bankruptcyStatuses, coaGroupNumbers, coaNumbers, ledgerEntryStatuses, lienPaymentStages, lienStatuses, paymentQueueCounts } from '../state/selectors';
import { getLiensToTransferSearch } from './liens-to-transfer-filter';
import { getLiensToPaySavedSearch } from './lient-to-pay-filter';
import { getMedicareLiensToTransferSearch } from './medicare-lines-to-transfer-filter';
import { AuthorizeLedgerEntriesModalComponent } from '@app/modules/payment-queue/authorize-ledger-entries/authorize-ledger-entries-modal.component';
import { ClearSelectedRecordsState } from '@app/state/root.actions';

@Component({
  selector: 'app-payment-queue-list',
  templateUrl: './payment-queue-list.component.html',
})

export class PaymentQueueListComponent extends AdvancedSearchListView implements OnInit, OnDestroy {
  @Input() public projectId: number;
  protected checkTablePusherChannel: Channel;
  entityType: EntityTypeEnum = EntityTypeEnum.PaymentQueues;
  private lienPaymentStages: SelectOption[] = [];
  private bankruptcyStages: SelectOption[] = [];
  protected bankruptcyStatuses: SelectOption[] = [];
  private lienStatuses: SelectOption[] = [];
  public readonly gridId: GridId = GridId.PaymentQueue;
  protected gridLocalData: IGridLocalData;
  protected currentUrl: string;
  private pusherChannel: Channel;

  private claimSettlementLedgerSettings: ClaimSettlementLedgerSettings | null = null;

  protected readonly holdTypeReasons: SelectOption[] = [];
  protected claimantWorkflowStagesLien: SelectOption[] = [];
  protected claimantWorkflowStagesBankruptcy: SelectOption[] = [];
  protected productCategories: SelectOption[] = [];

  public currentSearch$ = this.store.select(savedSearchSelectors.currentSearchByEntityType({ entityType: this.entityType }));
  public readonly savedSearchOptions$ = this.store.select(savedSearchSelectors.savedSearchListByEntityType);
  private readonly paymentQueueCounts$ = this.store.select(paymentQueueCounts);
  public readonly gridParams$ = this.store.select(paymentQueueSelectors.agGridParams);
  public readonly showExpandBtn$ = this.store.select(paymentQueueSelectors.showExpandBtn);

  public readonly ledgerEntryStatuses$ = this.store.select(ledgerEntryStatuses);
  public readonly accountGroupNumbers$ = this.store.select(coaGroupNumbers);
  public readonly advancedSearch$ = this.store.select(advancedSearch);
  private readonly holdTypes$ = this.store.select(claimantSelectors.holdTypes);
  private readonly selectedAuthorizedPaymentQueueResultGrid$ = this.store.select(paymentQueueSelectors.selectedAuthorizedPaymentQueueResultGrid);

  public lienStatuses$ = this.store.select(lienStatuses);
  public readonly lienPaymentStages$ = this.store.select(lienPaymentStages);
  public claimantStatusOptions: SelectOption[] = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' }
  ];

  public disbursementGroup$ = this.store.select(fromShared.sharedSelectors.uploadBulkDocumentSelectors.disbursementGroups).pipe(
    filter((data: DisbursementGroupLight[]): boolean => !!data),
    map(
      (data: DisbursementGroupLight[]) => data.map((i: DisbursementGroupLight) => ({ ...i, name: `(${i.sequenceId}) ${i.name}` })).sort((a: any, b: any) => a.sequenceId - b.sequenceId),
    ),
  );

  private readonly bankruptcyStages$ = this.store.select(bankruptcyStages);
  protected readonly bankruptcyStatuses$ = this.store.select(bankruptcyStatuses);
  protected gridLocalData$ = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));
  public readonly projectOrgsDropdownValues$ = this.store.select(projectSelectors.projectOrgsDropdownValues);
  public coaGroupNumbers$ = this.store.select(coaGroupNumbers);
  public readonly coaNumbers$ = this.store.select(coaNumbers);
  private readonly getPaymentQueueCounts$ = new Subject<IServerSideGetRowsParamsExtended>();
  private generationRequest: SaveDocumentGeneratorRequest;

  public actionBar$ = this.store.select(projectSelectors.actionBar);
  public bsModalRef: BsModalRef;
  public actionBar: ActionHandlersMap = {
    ...this.savedSearchActionBar,
    advancedSearch: this.advancedSearchAction(),
    basicSearch: this.basicSearchAction(),
    clearFilter: {
      callback: (): void => {
        this.store.dispatch(ClearSelectedRecordsState({ gridId: this.gridId }));
        this.clearFilters();
      },
    },
    paymentRequest: {
      disabled: () => !this.hasSelectedRow,
      callback: () => this.openPaymentRequestGenerationModal(),
      permissions: PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.GeneratePaymentRequest),
    },
    transferRequest: {
      disabled: () => !this.hasSelectedRow,
      callback: () => this.openPaymentRequestGenerationModal(EntityTypeEnum.FeatureFlag),
      permissions: PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferPayments),
    },
    download: {
      disabled: () => this.isExporting || (SearchState.hasErrors(this.searchState) && this.showAdvancedSearch),
      options: [
        { name: 'Standard', callback: (): void => this.standardExport(this.getAllColumnDefs()) },
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
          callback: this.onCopySpecialPaymentInstruction.bind(this),
          permissions: PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.CopySpecialPaymentInstructions),
        },
        {
          name: 'Find Liens to Transfer',
          disabled: (): boolean => (this.claimSettlementLedgerSettings?.enableLienTransfers ?? false) === false,
          callback: this.onFindLiensToTransfer.bind(this),
          permissions: PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.FindLiensToTransfer),
        },
        {
          name: 'Find Medicare Liens to Transfer',
          disabled: (): boolean => (this.claimSettlementLedgerSettings?.enableLienTransfers ?? false) === false,
          callback: this.onFindMedicareLiensToTransfer.bind(this),
          permissions: PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.FindLiensToTransfer),
        },
        {
          name: 'Batch Authorization',
          disabled: (): boolean => !this.hasSelectedRow,
          callback: this.openAuthorizeLedgerEntriesModal.bind(this),
          permissions: PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.AuthorizeLedgerEntries)
        },
      ],
      hidden: () => !this.permissionService.hasAny([
        PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.FindLiensToPay),
        PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.UpdateLienPaymentStage),
        PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.CopySpecialPaymentInstructions),
        PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.AuthorizeLedgerEntries),
      ]),
    },
    exporting: { hidden: () => !this.isExporting },
    actionPerfomed: { hidden: () => !this.isActionInProgress },
    deleteSearch: {
      callback: () => this.deleteSearch(this.currentSearch?.id),
      disabled: () => !this.currentSearch?.id,
      hidden: () => !this.isOnSavedSearch,
    },
  };

  protected TRANSFER_TO_SUB_ACC_HEADER: string = 'Transfer to Sub-Account';

  protected ngUnsubscribe$ = new Subject<void>();
  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Payee Org Id',
        field: 'payeeOrgId',
        hide: true,
        suppressColumnsToolPanel: true,
      },
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
      {
        headerName: 'Ledger Entry ID',
        field: 'ledgerEntryId',
        colId: 'id',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'ARCHER ID',
        field: 'archerId',
        width: 100,
        maxWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Attorney Ref ID',
        field: 'attorneyReferenceId',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Client ID',
        field: 'clientId',
        width: 80,
        maxWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'First Name',
        field: 'claimantFirstName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Name',
        field: 'claimantLastName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Claimant Status',
        field: 'claimantStatus',
        minWidth: 110,
        width: 110,
        resizable: false,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({
          options: [
            {
              id: 'Active',
              name: 'Active',
            },
            {
              id: 'Inactive',
              name: 'Inactive',
            },
          ],
        }),
      },
      {
        headerName: 'Payment Hold Reason',
        field: 'holdTypeReason',
        colId: 'holdTypeReason.holdTypeReasonId',
        sortable: true,
        minWidth: 170,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.holdTypeReasons }),
      },
      {
        headerName: 'Fee Payment Sweep',
        field: 'coaFeePaymentSweepEnabled',
        sortable: true,
        width: 130,
        minWidth: 130,
        suppressSizeToFit: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: (data: any): string => {
          if (data.value === null) {
            return '';
          }
          return data.value ? 'Yes' : 'No';
        },
      },
      {
        headerName: 'Account Group',
        field: 'accountGroupNameWithNumber',
        colId: 'accountGroupName',
        sortable: true,
        width: 190,
        minWidth: 190,
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.paymentQueueDataService.ledgerAccountGroups$ }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Account',
        field: 'accountName',
        sortable: true,
        width: 250,
        minWidth: 250,
        cellRenderer: 'AccountRenderer',
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.paymentQueueDataService.ledgerAccounts$ }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Primary Firm',
        field: 'clientPrimaryFirmName',
        width: 190,
        minWidth: 190,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Payee',
        field: 'payeeName',
        width: 190,
        minWidth: 190,
        sortable: true,
        cellRenderer: 'PayeeRenderer',
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'AssignedOrg',
        field: 'assignedOrgName',
        width: 190,
        minWidth: 190,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'AssignedOrg Relationship',
        field: 'assignedOrgRelation',
        width: 190,
        minWidth: 190,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      ...(this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferToSubAccount)) ? [{
        headerName: this.TRANSFER_TO_SUB_ACC_HEADER,
        field: 'transferToSubAccount',
        sortable: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: (data: any): string => this.yesNoPipe.transform(!!data.value),
        ...AGGridHelper.nameColumnDefaultParams,
        headerTooltip: this.TRANSFER_TO_SUB_ACC_HEADER,
      }] : []),
      {
        headerName: 'Status',
        field: 'status',
        colId: 'statusName',
        width: 190,
        minWidth: 190,
        sortable: true,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter(
          {
            options: this.enumToArray.transform(ClaimSettlementLedgerEntryStatus).map((i: { id: number; name: string }) => {
              let name = '';
              if (i.id === ClaimSettlementLedgerEntryStatus.NonPayable) {
                name = 'Non-Payable';
              } else if (i.id === ClaimSettlementLedgerEntryStatus.PaymentAuthorizedPartial) {
                name = 'Payment Authorized - Partial';
              } else {
                name = this.splitCamelCase.transform(i.name);
              }

              return {
                id: name,
                name,
              };
            }),
          },
        ),
      },
      {
        headerName: 'Amount',
        sortable: true,
        field: 'amount',
        resizable: false,
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        resizable: true,
        sortable: true,
        cellRenderer: (data: any): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'QSF Admin Approval Date',
        field: 'qsfAdminApprovalDate',
        resizable: true,
        sortable: true,
        cellRenderer: (data: any): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'AR Approval Date',
        field: 'arApprovalDate',
        colId: 'aRApprovalDate',
        resizable: true,
        sortable: true,
        cellRenderer: (data: any): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Disbursement Group',
        field: 'disbursementGroupName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Ledger Stage',
        field: 'stage.name',
        width: 240,
        minWidth: 240,
        colId: 'stage.id',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.paymentQueueDataService.ledgerStagesSelectOptions$ }),
      },
      {
        headerName: 'Lien Payment Stage',
        field: 'lienPaymentStageName',
        colId: 'lienPaymentStageId',
        sortable: true,
        width: 240,
        minWidth: 240,
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.lienPaymentStages$ }),
      },
      {
        headerName: 'Lien Status',
        field: 'lienStatusName',
        colId: 'lienStatusId',
        width: 240,
        minWidth: 240,
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.lienStatuses$ }),
      },
      {
        headerName: 'Claimant Net Disbursed',
        field: 'claimantNetDisbursed',
        sortable: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: (data: any): string => this.yesNoPipe.transform(!!data.value),
        ...AGGridHelper.nameColumnDefaultParams,
        headerTooltip: 'Claimant Net Disbursed',
      },
      {
        headerName: 'BK',
        field: 'bankruptcyStatusName',
        colId: 'bankruptcyStatusId',
        sortable: true,
        resizable: true,
        cellRenderer: 'bkStatusRenderer',
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.paymentQueueDataService.bankruptcyStatuses$ }),
      },
      {
        headerName: 'BK Stage',
        field: 'bankruptcyStageName',
        colId: 'bankruptcyStageId',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.bankruptcyStages$ }),
        width: 240,
        minWidth: 240,
      },
      {
        headerName: 'BK Abandoned',
        field: 'abandoned',
        sortable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => this.yesNoPipe.transform(data.value),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'BK Trustee Amount',
        field: 'amountToTrustee',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        width: 160,
        minWidth: 160,
      },
      {
        headerName: 'BK Attorney Amount',
        field: 'amountToAttorney',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        width: 160,
        minWidth: 160,
      },
      {
        headerName: 'BK Claimant Amount',
        field: 'amountToClaimant',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        width: 160,
        minWidth: 160,
      },
      {
        headerName: 'Lien ID',
        field: 'lienId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        width: 140,
        minWidth: 140,
      },
      {
        headerName: 'Collector',
        field: 'collectorName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        valueFormatter: (val: ValueFormatterParams): string => val.data.collectorName || 'N/A',
        width: 140,
        minWidth: 140,
      },
    ],
    getRowClass: this.getRowClass.bind(this),
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      bkStatusRenderer: BankruptcyStatusRendererComponent,
      PayeeRenderer: PaymentQueueRendererComponent,
      AccountRenderer: AccountRendererComponent,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    suppressRowClickSelection: true,
  };

  public searchFields: SearchField[] = this.getSearchFields();

  protected getAllColumnDefs(): any {
    return this.additionalColDefs
      ? this.gridOptions.columnDefs.filter((col: ColDef | ColGroupDef) => !this.additionalColDefs.find((addCol: ColDef) => 'field' in col && addCol.field === col.field)).concat(this.additionalColDefs)
      : [].concat(this.gridOptions.columnDefs);
  }

  protected getExportColumns(): ColumnExport[] {
    const columns: ColumnExport[] = [
      { name: 'Agency Id', field: 'AgencyId' },
      { name: 'Client Id', field: 'ClientId' },
      { name: 'Lien Id', field: 'LienId' },
      { name: 'First Name', field: 'FirstName' },
      { name: 'Last Name', field: 'LastName' },
      { name: 'Settlement Amount', field: 'SettlementAmount' },
      { name: 'Settlement Date', field: 'SettlementDate' },
      { name: 'Case Name', field: 'CaseName' },
      { name: 'Attorney Fee', field: 'AttorneyFee' },
      { name: 'Attorney Expenses', field: 'AttorneyExpenses' },
      { name: 'Reduction Type', field: 'ReductionType' },
      { name: 'Reduction Percent', field: 'ReductionPercent' },
      { name: 'Agreed Amount', field: 'AgreedAmount' },
      { name: 'Govt Lien Total', field: 'GovtLienTotal' },
      { name: 'Final Demand Date', field: 'FinalDemandDate' },
      { name: 'Final Demand Amount', field: 'FinalDemandAmount' },
      { name: 'QSF Fund Name', field: 'QSFFundName' },
      { name: 'Tort', field: 'Tort' },
      { name: 'Collector', field: 'Collector' },
      { name: 'Collector Id', field: 'CollectorId' },
      { name: 'Case Id', field: 'CaseId' },
      { name: 'SSN', field: 'SSN' },
      { name: 'DOB', field: 'DOB' },
      { name: 'Description of Injury', field: 'DescriptionOfInjury' },
      { name: 'Date of Injury', field: 'DateOfInjury' },
      { name: 'Firmname', field: 'Firmname' },
      { name: 'Third Party Id', field: 'ThirdPartyId' },
      { name: 'Admin Fee', field: 'AdminFee' },
      { name: 'Admin Fee Applied', field: 'AdminFeeApplied' },
      { name: 'Payable Lien Amount', field: 'PayableLienAmount' },
      { name: 'Lien Type', field: 'LienType' },
      { name: 'Lien Paid Date', field: 'LienPaidDate' },
      { name: 'Payable To', field: 'PayableTo' },
      { name: 'AttTo', field: 'AttTo' },
      { name: 'Addressee', field: 'Addressee' },
      { name: 'Address1', field: 'Address1' },
      { name: 'Address2', field: 'Address2' },
      { name: 'City', field: 'City' },
      { name: 'State', field: 'State' },
      { name: 'Zipcode', field: 'Zipcode' },
      { name: 'Claimants Finalized Y/N', field: 'ClaimantsFinalized' },
      { name: 'Stage', field: 'Stage' },
      { name: 'Status Name', field: 'StatusName' },
      { name: 'Check Memo', field: 'CheckMemo' },
      { name: 'File Name', field: 'FileName' },
      { name: 'User', field: 'User' },
      { name: 'QSF', field: 'QsfCompanyName' },
      { name: 'Lien Payment Stage', field: 'LienPaymentStage' },
      { name: 'Claimant Finalized Date', field: 'ClaimantFinalizedDate' },
      { name: 'Reported Final Date', field: 'ReportedFinalDate' },
      { name: 'Lien Holder Id', field: 'LienHolderId' },
      { name: 'Lien Holder', field: 'LienHolder' },
      { name: 'Identification Number', field: 'IdentificationNumber' },
      { name: 'Collector', field: 'Collector' },
    ];

    return columns;
  }

  private headersWithNameInsteadOfValue: string[] = [
    'Ledger Stage',
    'Account Group',
    'Payment Hold Reason',
    'Probate Status',
    'LPM Lien Status',
    'Lien Status',
    'Lien Payment Stage',
    'Firm Approval',
    'Disbursement Group Stage',
    'BK Stage',
    'BK',
    'Overall Invoice Approval Status',
  ];

  public standardExport(columns: ColDef[]): void {
    const columnsParam = columns.map((item: ColDef) => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.colId || item.field,
      };

      if (this.headersWithNameInsteadOfValue.findIndex(itm => itm == item.headerName) != -1) {
        container.field = item.field;
      }

      return container;
    }).filter((item: ColumnExport) => item.field && item.name !== 'Actions' && item.field !== 'payeeOrgId');

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.PaymentQueueStandard, this.projectId, EntityTypeEnum.Projects);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map((i: IdValue) => i.name),
      this.standardExportCallback.bind(this),
      () => this.onSubscribedCallback(columnsParam, channelName),
    );
  }

  public checkTableExport(columns: ColumnExport[]): void {
    if (this.checkTablePusherChannel) {
      this.pusher.unsubscribeChannel(this.checkTablePusherChannel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.PaymentQueueCheckTable, this.projectId, EntityTypeEnum.Projects);

    this.checkTablePusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map((i: IdValue) => i.name),
      this.checkTableExportCallback.bind(this),
      () => this.onSubscribedCheckTableCallback(columns, channelName),
    );
  }

  protected onSubscribedCallback(columns: ColumnExport[], channelName: string): void {
    this.store.dispatch(paymentQueueActions.DownloadStandardRequest({
      id: this.projectId,
      searchOptions: this.getStandardExportParams(this.gridLocalData),
      columns,
      channelName,
    }));
  }

  protected onSubscribedCheckTableCallback(columns: ColumnExport[], channelName: string): void {
    this.store.dispatch(paymentQueueActions.DownloadCheckTableRequest({
      id: this.projectId,
      searchOptions: SearchOptionsHelper.createSearchOptions(this.gridLocalData, this.gridParams),
      columns,
      channelName,
    }));
  }

  private getRowClass(params): string {
    return params.data && !params.data?.hasActiveChartOfAccount && 'disabled-row';
  }

  protected getSearchFields(): SearchField[] {
    const searchFields: SearchField[] = [
      SearchField.numberIdentifier('id', 'Ledger Entry ID', VS.onlyNumbersValidator, SC.Equals, [SC.Contains, SC.StartsWith, SC.EndsWith, SC.NotContains]),
      SearchField.number('archerId', 'ARCHER ID', VS.onlyNumbersValidator, null),
      SearchField.numberIdentifier('clientId', 'Client ID', VS.onlyNumbersValidator, SC.Equals, [SC.Contains, SC.StartsWith, SC.EndsWith, SC.NotContains]),
      SearchField.text('attorneyReferenceId', 'Attorney Ref ID', null, SC.Equals, [SC.IsMissing]),
      SearchField.text('claimantFirstName', 'Claimant First Name'),
      SearchField.text('claimantLastName', 'Claimant Last Name'),
      SearchField.data('claimantStatus', 'Claimant Status', 'id', 'name', null, [SC.IsMissing, SC.Contains], null, this.claimantStatusOptions),
      SearchField.data('accountGroupId', 'Account Group', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, this.coaGroupNumbers$),
      SearchField.data('holdTypeReason.holdTypeReasonId', 'Payment Hold Reason', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, this.holdTypeReasons),
      SearchField.data('accountId', 'Accounts', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, this.coaNumbers$),
      SearchField.text('payeeName', 'Payee'),
      SearchField.data('statusId', 'Status', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, this.ledgerEntryStatuses$),
      SearchField.number('amount', 'Amount', ValidationService.onlyCurrencyValidator, [SC.IsMissing]),
      SearchField.text('disbursementGroupName', 'Disbursement Group'),
      SearchField.data('stage.id', 'Ledger Stage', 'id', 'name', SC.Contains, [SC.Equals, SC.IsMissing, SC.NotEqual], null, this.paymentQueueDataService.ledgerStages$),
      SearchField.date('netDisbursementDate', 'Net Disbursement Date', null, [SC.IsMissing]),
      SearchField.boolean('claimantNetDisbursed', 'Claimant Net Disbursed'),
      SearchField.numberIdentifier('lienId', 'Lien ID', VS.onlyNumbersValidator, SC.Equals, [SC.Contains, SC.StartsWith, SC.EndsWith, SC.NotContains]),
      SearchField.data('lienPaymentStageId', 'Lien Payment Stage', 'id', 'name', SC.Contains, [SC.Equals, SC.IsMissing, SC.NotEqual], null, this.lienPaymentStages$),
      SearchField.none('productWorkflow', 'Workflow - Product', SG.ProductWorkflowGroup, [
        SearchField.data(PW.ProductCategory, 'Category', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains], false),
        SearchField.data(PW.SubProductCategory, 'Sub Category', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains]),
        SearchField.data(PW.Product, 'Product', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains]),
        SearchField.data(PW.Phase, 'Phase', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains]),
        SearchField.data(PW.Stage, 'Stage', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals]),
        SearchField.age(PW.AgeOfPhase, 'Age of Phase', SC.GreaterThan),
        SearchField.age(PW.AgeOfStage, 'Age of Stage', SC.GreaterThan),
      ]),
      SearchField.none('clientWorkflow', 'Workflow - Claimant', SG.ClientWorkflowGroup, [
        SearchField.dataWithCheckbox(CW.ProductCategory, 'Category', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains], false, [ProductCategory.Probate, ProductCategory.Bankruptcy, ProductCategory.MedicalLiens]),
        SearchField.data(CW.Stage, 'Stage', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals]),
        SearchField.age(CW.AgeOfStage, 'Age of Stage', SC.GreaterThan),
      ]),
      SearchField.numberIdentifier('externalIdentifiers.identifier', 'Identifier'),
      SearchField.text('clientPrimaryFirmName', 'Primary Firm'),
      SearchField.boolean('abandoned', 'BK Abandoned', 'abandoned', 'Abandoned?'),
      SearchField.number('amountToTrustee', 'BK Trustee Amount', ValidationService.onlyCurrencyValidator, [SC.IsMissing]),
      SearchField.number('amountToAttorney', 'BK Attorney Amount', ValidationService.onlyCurrencyValidator, [SC.IsMissing]),
      SearchField.number('amountToClaimant', 'BK Claimant Amount', ValidationService.onlyCurrencyValidator, [SC.IsMissing]),
      SearchField.data('claimantPaymentMethod', 'Claimant Payment Method', 'id', 'name', null, [SC.IsMissing], null, ObservableOptionsHelper.getClaimantPaymentMethodOptions()),
      SearchField.data('disbursementGroupId', 'Group', 'id', 'name', SC.Contains, [SC.Equals, SC.IsMissing, SC.NotEqual], null, this.disbursementGroup$, SG.BoundedByCountHeight),
      ...(this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferToSubAccount)) ? [SearchField.boolean('transferToSubAccount', 'Transfer to Sub-Account', 'transferToSubAccount', 'Transfer to Sub-Account')] : []),
      SearchField.text('collectorName', 'Collector', null, SC.Equals, [SC.IsMissing]),
      SearchField.boolean('payableStatuses', 'Payable Statuses', undefined, 'Includes Transferred and Payment Authorized', undefined, undefined, undefined, 'true', true, 'Transfer to Sub-account = Yes AND Status = Transferred OR Transfer to Sub-account = No AND Status = Payment Authorized'),
    ];

    return searchFields;
  }

  private standardExportCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(paymentQueueActions.DownloadStandardDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(paymentQueueActions.Error({ errorMessage: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  private checkTableExportCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(paymentQueueActions.DownloadCheckTableDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(paymentQueueActions.Error({ errorMessage: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  constructor(
    public store: Store<AppState>,
    public modalService: ModalService,
    public messageService: MessageService,
    public route: ActivatedRoute,
    protected pusher: PusherService,
    protected elementRef: ElementRef,
    protected router: Router,
    protected splitCamelCase: SplitCamelCasePipe,
    protected actionsSubj: ActionsSubject,
    public permissionService: PermissionService,
    protected logger: LogService,
    protected enumToArray: EnumToArrayPipe,
    protected readonly yesNoPipe: YesNoPipe,
    protected stagesService: StagesService,
    protected readonly datePipe: DateFormatPipe,
    protected productCategoriesService: ProductCategoriesService,
    protected readonly paymentQueueDataService: PaymentQueueDataService,
  ) {
    super(store, modalService, messageService, route, elementRef, router, permissionService);
  }

  protected get hasSelectedRow(): boolean {
    let hasSelectedRows = false;

    if (this.gridLocalData?.selectedRecordsIds) {
      hasSelectedRows = [...this.gridLocalData.selectedRecordsIds.entries()]?.some(([, value]: [string, boolean]) => value === true);
    }

    return hasSelectedRows;
  }

  protected get checkTableDisabled(): boolean {
    return !this.hasSelectedRow;
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(paymentQueueActions.GetLienPaymentStages());
    this.store.dispatch(paymentQueueActions.GetLienStatuses());
    this.store.dispatch(paymentQueueActions.GetBankruptcyStatuses());
    this.store.dispatch(paymentQueueActions.GetBankruptcyStages());
    this.store.dispatch(paymentQueueActions.GetLedgerEntryStatuses());
    this.store.dispatch(sharedActions.dropDownsValuesActions.GetLedgerAccounts({ projectId: this.projectId }));
    this.store.dispatch(sharedActions.dropDownsValuesActions.GetLedgerAccountGroups({ projectId: this.projectId }));
    this.store.dispatch(GetLedgerStages());
    this.store.dispatch(GetSavedSearchListByEntityType({ entityType: this.entityType }));
    this.store.dispatch(claimantActions.GetHoldTypes());
    if (this.projectId) {
      this.store.dispatch(paymentQueueActions.GetChartOfAccountGroupNumbers({ projectId: this.projectId }));
      this.store.dispatch(paymentQueueActions.GetChartOfAccountNumbers({ projectId: this.projectId }));
      this.store.dispatch(projectActions.GetProjectOrgsDropdownValues({ projectId: this.projectId }));
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.LoadDisbursementGroupsData({ entityId: this.projectId, removeProvisionals: false }));
      if (this.permissionService.canRead(PermissionTypeEnum.Organizations)) {
        this.store.dispatch(projectActions.GetProjectFirmsOptions({ projectId: this.projectId }));
      }
      this.store.dispatch(projectActions.GetLedgerSettings({ projectId: this.projectId }));
      this.searchFields.push(SearchField.data(
        'payeeOrgId',
        'Assigned Organizations',
        'id',
        'name',
        SC.Contains,
        [SC.IsMissing, SC.NotEqual, SC.Equals],
        null,
        this.projectOrgsDropdownValues$,
      ));
    }

    this.loadOptionsForFindLiensToPay();
    this.updateActionBar();
    this.subscribeToCurrentSearch();
    this.subscribeToLienPaymentStages();
    this.subscribeToBankruptcyStages();
    this.subscribeToBankruptcyStatuses();
    this.subscribeToLienStatuses();
    this.subscribeToPaymentsQueueCounts();
    this.subscribeToGridLocalData();
    this.subscribeToActions();
    this.initExportSubscriptions();

    this.getPaymentQueueCounts$
      .pipe(
        debounceTime(1000),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((params: IServerSideGetRowsParamsExtended) => {
        this.store.dispatch(paymentQueueActions.GetPaymentQueueCounts({ projectId: this.projectId, agGridParams: params }));
      });

    this.holdTypes$
      .pipe(
        filter((holdTypes: HoldType[]) => !!holdTypes),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((holdTypes: HoldType[]) => {
        this.holdTypeReasons.splice(0);
        holdTypes.forEach((holdType: HoldType) => this.holdTypeReasons.push(...SelectHelper.toOptions(holdType.holdTypeReasons)));
      });

    this.currentUrl = `/projects/${this.projectId}/payments/tabs/payment-queue`;
  }

  protected saveAdvancedSearch(): void {
    if (!this.isSearchSaved) {
      this.dispatchSaveSearchParams(this.searchState);
    }
  }

  public deleteSearch(searchId: number): void {
    super.deleteSearch(searchId);
    this.router.navigate([this.currentUrl]);
  }

  public clearFilters(): void {
    super.clearFilters();
    this.router.navigate([this.currentUrl]);
    this.store.dispatch(ResetCurrentSearch({ entityType: this.entityType }));
  }

  public setAdvancedSearchVisible(isVisible: boolean): void {
    this.dispatchSaveAdvancedSearchVisibility(isVisible);
    this.showAdvancedSearch = isVisible;
  }

  protected onRowDoubleClicked(row): void {
    const { data } = row;
    const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
    this.store.dispatch(
      CreatePager({
        relatedPage: RelatedPage.PaymentQueue,
        settings: navSettings,
      }),
    );
    if (data.clientId && data.claimSettlementLedgerId) {
      this.router.navigate([`/claimants/${row.data.clientId}/payments/tabs/ledger-summary/${data.claimSettlementLedgerId}`]);
    }
  }

  protected toggleAdvancedSearch(): void {
    super.toggleAdvancedSearch();
    this.dispatchSaveAdvancedSearchVisibility(this.showAdvancedSearch);
    if (!this.showAdvancedSearch) {
      this.resetExpandButtonForAdvFilters();
    }
  }

  private setHeader(item: PaymentQueueCounts): void {
    if (item) {
      this.store.dispatch(projectActions.UpdateContextBar({
        contextBar: [
          { column: 'Pending Count', valueGetter: () => (item.pendingCount > 0 ? item.pendingCount : '0') },
          { column: 'Authorized Count', valueGetter: () => (item.authorizedCount > 0 ? item.authorizedCount : '0') },
          { column: 'Total', valueGetter: () => (CurrencyHelper.toUsdFormat({ value: item.totalAmount ? item.totalAmount : 0 })) },
        ],
      }));
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    // eslint-disable-next-line no-param-reassign
    agGridParams = this.mergeSearchFilters(agGridParams);
    this.gridParams = agGridParams;
    this.store.dispatch(paymentQueueActions.GetPaymentQueueGrid({ agGridParams, projectId: this.projectId }));
    this.getPaymentQueueCounts$.next(agGridParams);
  }

  private loadOptionsForFindLiensToPay(): void {
    if (this.permissionService.has(PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.FindLiensToPay))) {
      this.stagesService.getDropdownByProductCategories([ProductCategory.MedicalLiens], EntityTypeEnum.Clients)
        .subscribe((result: IdValue[]) => { this.claimantWorkflowStagesLien = result; });
      this.stagesService.getDropdownByProductCategories([ProductCategory.Bankruptcy], EntityTypeEnum.Clients)
        .subscribe((result: IdValue[]) => { this.claimantWorkflowStagesBankruptcy = result; });
      this.productCategoriesService.getDropdownProductCategories()
        .subscribe((result: IdValue[]) => { this.productCategories = result; });
    }
  }

  protected onFindLiensToPay(): void {
    this.router.navigate([this.currentUrl]);
    super.clearFilters();

    const savedSearch: SavedSearch = getLiensToPaySavedSearch(
      this.searchFields,
      this.lienPaymentStages$,
      this.ledgerEntryStatuses$,
      this.coaNumbers$,
      this.claimantWorkflowStagesLien,
      this.claimantWorkflowStagesBankruptcy,
      this.productCategories,
    );

    this.setAdvancedSearch(savedSearch.searchModel);
  }

  protected onReviewAllARCHERFees(): void {
    this.router.navigate([this.currentUrl]);
    super.clearFilters();

    const savedSearch: SavedSearch = getReviewAllArcherFeesSavedSearch(
      this.searchFields,
      this.coaGroupNumbers$,
    );

    this.setAdvancedSearch(savedSearch.searchModel);
  }

  protected setAdvancedSearch(searchModel: SearchState[]): void {
    this.restoreAdvancedSearch(searchModel, true);
    this.setAdvancedSearchVisible(true);
    this.dispatchSetShowExpandButtonForFilters(true);

    if (this.gridApi) {
      this.gridApi.onFilterChanged();
    }
    this.dispatchSaveSearchParams(searchModel);
  }

  protected onAuthorizeArcherFees(): void {
    const advancedSearchFiltersAndGridFilters = this.mergeSearchFilters(this.gridParams);

    const searchOptions: ISearchOptions = {
      ...AGGridHelper.getDefaultSearchRequest(),
      ...SearchOptionsHelper.createSearchOptions(this.gridLocalData, advancedSearchFiltersAndGridFilters),
    };

    const modalRef = this.modalService.show(AuthorizeArcherFeesModalComponent, {
      class: 'authorize-archer-fees-modal',
      initialState: {
        projectId: this.projectId,
        searchOptions,
        gridId: this.gridId,
        gridParams$: this.gridParams$,
      },
    });
    modalRef.content.dataUpdated.subscribe(() => {
      this.refreshGrid();
    });
  }

  protected onAuthorizeLienEntries(): void {
    const advancedSearchFiltersAndGridFilters = this.mergeSearchFilters(this.gridParams);

    const searchOptions: ISearchOptions = {
      ...AGGridHelper.getDefaultSearchRequest(),
      ...SearchOptionsHelper.createSearchOptions(this.gridLocalData, advancedSearchFiltersAndGridFilters),
    };

    const modalRef = this.modalService.show(AuthorizeLienEntriesModalComponent, {
      class: 'authorize-archer-fees-modal',
      initialState: {
        projectId: this.projectId,
        searchOptions,
        gridId: this.gridId,
        gridParams$: this.gridParams$,
      },
    });
    modalRef.content.dataUpdated.subscribe(() => {
      this.refreshGrid();
    });
  }

  protected onUpdateLienPaymentStage(): void {
    const advancedSearchFiltersAndGridFilters = this.mergeSearchFilters(this.gridParams);

    const searchOptions: ISearchOptions = {
      ...AGGridHelper.getDefaultSearchRequest(),
      ...SearchOptionsHelper.createSearchOptions(this.gridLocalData, advancedSearchFiltersAndGridFilters),
    };

    const updateStageRef = this.modalService.show(UpdateLienPaymentStageModalComponent, {
      class: 'update-lien-payment-stage-modal',
      initialState: {
        projectId: this.projectId,
        searchOptions,
        gridId: this.gridId,
        gridParams$: this.gridParams$,
      },
    });
    updateStageRef.content.stagesUpdated.subscribe(() => {
      this.refreshGrid();
    });
  }

  protected onCopySpecialPaymentInstruction(projectId?: number): void {
    const advancedSearchFiltersAndGridFilters = this.mergeSearchFilters(this.gridParams);

    const searchOptions: ISearchOptions = {
      ...AGGridHelper.getDefaultSearchRequest(),
      ...SearchOptionsHelper.createSearchOptions(this.gridLocalData, advancedSearchFiltersAndGridFilters),
    };

    const copySpecPaymentInstructionRef = this.modalService.show(CopySpecialPaymentInstructionsModalComponent, {
      class: 'copy-special-payment-instructions-modal',
      initialState: {
        projectId: projectId ?? this.projectId,
        searchOptions,
        gridId: this.gridId,
        gridParams$: this.gridParams$,
      },
    });
    copySpecPaymentInstructionRef.content.instructionsUpdated.subscribe(() => {
      this.refreshGrid();
    });
  }

  protected onFindLiensToTransfer(): void {
    this.router.navigate([this.currentUrl]);
    super.clearFilters();

    const savedSearch: SavedSearch = getLiensToTransferSearch(
      this.searchFields,
      this.coaNumbers$,
      this.ledgerEntryStatuses$,
      this.lienPaymentStages$,
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

  protected onFindMedicareLiensToTransfer(): void {
    this.router.navigate([this.currentUrl]);
    super.clearFilters();

    const savedSearch: SavedSearch = getMedicareLiensToTransferSearch(
      this.searchFields,
      this.coaNumbers$,
      this.ledgerEntryStatuses$,
      this.lienPaymentStages$,
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

  protected onARApproval(): void {
    this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: true }));
    this.unsubscribePusherChannel();
    const channelName = StringHelper.generateChannelName(JobNameEnum.CopySpecialPaymentInstructionsValidation);
    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.validateARApprovalChannelEventHandler.bind(this),
      this.enqueueARApproval.bind(this, channelName),
    );
  }

  private enqueueARApproval(channelName: string): void {
    this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: true }));

    const advancedSearchFiltersAndGridFilters = this.mergeSearchFilters(this.gridParams);

    const searchOptions: ISearchOptions = {
      ...AGGridHelper.getDefaultSearchRequest(),
      ...SearchOptionsHelper.createSearchOptions(this.gridLocalData, advancedSearchFiltersAndGridFilters),
    };
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;

    const request: IARApproval = {
      searchOptions,
    };

    const batchAction: BatchActionDto = {
      entityTypeId: EntityTypeEnum.GlobalPaymentQueue,
      entityId: 0,
      batchActionFilters: [{ filter: JSON.stringify(request) }],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.ARApproval,
    };

    this.store.dispatch(globalPaymentQueueActions.ValidateARApproval({ batchAction }));
  }

  private validateARApprovalChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        if (data.Errored > 0) {
          this.store.dispatch(globalPaymentQueueActions.ARApprovalError({ errorMessage: 'One or more selected rows are not in the 52000 group so cannot be approved.  Refine your search to only include rows where the account group is in the 52000 group.' }));
        } else {
          this.store.dispatch(globalPaymentQueueActions.ARApprovalSuccess());
        }
        this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: false }));
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validateARApprovalChannelEventHandler]', data);
        this.store.dispatch(globalPaymentQueueActions.ARApprovalError({ errorMessage: data.ErrorMessage }));
        this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: false }));
        break;
      default:
        break;
    }
  }

  private refreshGrid(): void {
    if (this.gridApi) {
      this.gridApi.refreshServerSide({ purge: true });
    }
  }

  private openPaymentRequestGenerationModal(modalType?: EntityTypeEnum): void {
    const advancedSearchFiltersAndGridFilters = this.mergeSearchFilters(this.gridParams);

    const searchOptions: ISearchOptions = {
      ...AGGridHelper.getDefaultSearchRequest(),
      ...SearchOptionsHelper.createSearchOptions(this.gridLocalData, advancedSearchFiltersAndGridFilters),
    };

    if (modalType === EntityTypeEnum.FeatureFlag) {
      this.modalService.show(GenerateTransferRequestModalComponent, {
        class: 'generate-transfer-request-modal',
        initialState: this.buildTransferRequestModalState(searchOptions) as Partial<GenerateTransferRequestModalComponent>,
      });
    } else {
      this.modalService.show(GeneratePaymentRequestModalComponent, {
        class: 'generate-payment-request-modal',
        initialState: this.buildModalState(searchOptions) as Partial<GeneratePaymentRequestModalComponent>,
      });
    }
  }

  protected openAuthorizeLedgerEntriesModal(): void {
    const advancedSearchFiltersAndGridFilters = this.mergeSearchFilters(this.gridParams);

    const searchOptions: ISearchOptions = {
      ...AGGridHelper.getDefaultSearchRequest(),
      ...SearchOptionsHelper.createSearchOptions(this.gridLocalData, advancedSearchFiltersAndGridFilters),
    };

    const updateStatusRef = this.modalService.show(AuthorizeLedgerEntriesModalComponent, {
      class: 'authorize-ledger-entries-modal',
      initialState: {
        projectId: this.projectId,
        searchOptions,
        gridId: this.gridId,
        gridParams$: this.gridParams$,
      },
    });
    updateStatusRef.content.statusUpdated.subscribe(() => {
      this.refreshGrid();
    });
  }

  private buildModalState(searchOptions: ISearchOptions): IGeneratePaymentRequestModalInitialState {
    return {
      projectId: this.projectId,
      searchOptions,
      paymentRequestEntityType: EntityTypeEnum.ClaimSettlementLedgerEntries,
    };
  }

  private buildTransferRequestModalState(searchOptions: ISearchOptions): IGenerateTransferRequestModalInitialState {
    return {
      projectId: this.projectId,
      searchOptions,
      transferRequestEntityType: EntityTypeEnum.Projects,
    };
  }

  private initExportSubscriptions(): void {
    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => {
      this.isExporting = result;
      this.updateActionBar();
    });

    this.store.select(exportsSelectors.isActionInProgress).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => {
      this.isActionInProgress = result;
      this.updateActionBar();
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(paymentQueueActions.DownloadStandardRequestSuccess),
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(paymentQueueActions.DownloadCheckTableRequestSuccess),
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(globalPaymentQueueActions.ARApprovalSuccess),
    ).subscribe(() => {
      this.refreshGrid();
    });
  }

  private subscribeToActions(): void {
    this.actionsSubj.pipe(
      ofType(paymentQueueActions.ExportRemittanceDetailsGenerationComplete),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: {
      generationRequest: SaveDocumentGeneratorRequest;
    }) => {
      this.generationRequest = action.generationRequest;
    });

    this.actionsSubj.pipe(
      ofType(projectActions.GetLedgerSettingsSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((res: { settings: ClaimSettlementLedgerSettings } & TypedAction<'[Project] Get Project Ledger Settings Success'>) => {
      this.claimSettlementLedgerSettings = res.settings;
    });
  }

  private subscribeToGridLocalData(): void {
    this.gridLocalData$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((gridLocalData: IGridLocalData) => {
        this.gridLocalData = gridLocalData;
      });
  }

  private subscribeToPaymentsQueueCounts(): void {
    this.paymentQueueCounts$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter((counts: PaymentQueueCounts) => !!counts),
    ).subscribe((counts: PaymentQueueCounts) => {
      this.setHeader(counts);
    });
  }

  private subscribeToCurrentSearch(): void {
    this.currentSearch$.pipe(
      filter((savedSearch: SavedSearch) => !!savedSearch),
      distinctUntilChanged((a: SavedSearch, b: SavedSearch) => isEqual(a, b)),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((savedSearch: SavedSearch) => {
      if (savedSearch) {
        if (this.gridApi) {
          const filterModel = this.gridApi.getFilterModel();
          if (!!filterModel && !!Object.keys(filterModel)?.length) {
            this.gridApi.setFilterModel(null);
          }
        }
        this.initSavedSearch(savedSearch);
      }
      this.advancedSearchId = savedSearch?.id;
    });
  }

  private subscribeToLienPaymentStages(): void {
    this.lienPaymentStages$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: SelectOption[]) => {
      this.lienPaymentStages = items;
    });
  }

  private subscribeToLienStatuses(): void {
    this.lienStatuses$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: SelectOption[]) => {
      this.lienStatuses = items;
    });
  }

  private subscribeToBankruptcyStages(): void {
    this.bankruptcyStages$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: SelectOption[]) => {
      this.bankruptcyStages = items;
    });
  }

  private subscribeToBankruptcyStatuses(): void {
    this.bankruptcyStatuses$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: SelectOption[]) => {
      this.bankruptcyStatuses = items;
    });
  }

  private updateActionBar(): void {
    this.actionBar$.pipe(
      first(),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(
        (actionBar: ActionHandlersMap) => this.store.dispatch(projectActions.UpdateActionBar({
          ...actionBar,
          actionBar: {
            ...this.actionBar,
            exporting: { hidden: () => !this.isExporting },
          },
        })),
      );
  }

  private resetExpandButtonForAdvFilters(): void {
    this.dispatchSetShowExpandButtonForFilters(false);
  }

  public ngOnDestroy(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    this.store.dispatch(projectActions.UpdateContextBar({ contextBar: null }));
    if (this.isOnSavedSearch && this.isSearchSaved) {
      this.store.dispatch(ResetCurrentSearch({ entityType: this.entityType }));
      this.dispatchSaveSearchParams([]);
    }
    this.resetExpandButtonForAdvFilters();
    this.refreshGrid();
    this.store.dispatch(ClearSelectedRecordsState({ gridId: this.gridId }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  protected dispatchSaveSearchParams(items: SearchState[]): void {
    this.store.dispatch(paymentQueueActions.SaveSearchParams({ items }));
  }

  protected dispatchSaveAdvancedSearchVisibility(isVisible: boolean): void {
    this.store.dispatch(paymentQueueActions.SaveAdvancedSearchVisibility({ isVisible }));
  }

  protected dispatchSetShowExpandButtonForFilters(showExpandBtn: boolean): void {
    this.store.dispatch(paymentQueueActions.SetShowExpandButtonForFilters({ showExpandBtn }));
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }
}
