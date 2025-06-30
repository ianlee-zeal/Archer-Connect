/* eslint-disable no-param-reassign */
import { formatCurrency } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchOptionsHelper, StringHelper } from '@app/helpers';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ArrayHelper } from '@app/helpers/array.helper';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { ObservableOptionsHelper } from '@app/helpers/observable-options.helper';
import { SelectHelper } from '@app/helpers/select.helper';
import { UrlHelper } from '@app/helpers/url-helper';
import { ColumnExport, Project, UserInfo } from '@app/models';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { SearchConditionsEnum as SC } from '@app/models/advanced-search/search-conditions.enum';
import { SearchField } from '@app/models/advanced-search/search-field';
import { SearchState } from '@app/models/advanced-search/search-state';
import { DisbursementClaimantSummary } from '@app/models/disbursement-claimant-summary';
import { DisbursementGroupLight } from '@app/models/disbursement-group-light';
import { DocumentTemplate, SaveDocumentGeneratorRequest } from '@app/models/documents/document-generators';
import {
  ClientHoldAdvancedSearchKey as CH,
  ClientWorkflowAdvancedSearchKey as CW,
  ControllerEndpoints, DocumentGeneratorsLoading,
  DocumentType,
  EntityTypeEnum, ExportLoadingStatus,
  HoldbacksAdvancedSearchKey as HB,
  JobNameEnum,
  ProductWorkflowAdvancedSearchKey as PW,
  PermissionActionTypeEnum,
  PermissionTypeEnum,
  ProductCategory,
  SearchGroupType as SG,
} from '@app/models/enums';
import { AttorneyStatusEnum } from '@app/models/enums/attorney-status.enum';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { BKScrubProductCodeEnumSearchMapping } from '@app/models/enums/bk-scrub-product-code.enum';
import { BKScrubStatusCodesEnum } from '@app/models/enums/bk-scrub-status-codes.enum';
import { DocumentGenerationTemplates } from '@app/models/enums/document-generation/document-generation-templates';
import { OutputFileType } from '@app/models/enums/document-generation/output-file-type';
import { GridId } from '@app/models/enums/grid-id.enum';
import { QSFType } from '@app/models/enums/ledger-settings/qsf-type';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings';
import { LedgerStageWithClaimantCount } from '@app/models/ledger-stage-with-claimant-count';
import { SavedSearch } from '@app/models/saved-search';
import { ISearchOptions } from '@app/models/search-options';
import * as fromAuth from '@app/modules/auth/state';
import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { AdvancedSearchListView } from '@app/modules/shared/_abstractions/advanced-search-list-view';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { DateFormatPipe, EnumToArrayPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { GridHeaderCheckboxComponent } from '@app/modules/shared/grid/grid-header-checkbox/grid-header-checkbox.component';
import { StageHistoryModalComponent } from '@app/modules/shared/stage-history-modal/stage-history-modal.component';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { GetSavedSearchListByEntityType, ResetCurrentSearch } from '@app/modules/shared/state/saved-search/actions';
import * as savedSearchSelectors from '@app/modules/shared/state/saved-search/selectors';
import { MessageService, ModalService, PermissionService } from '@app/services';
import { LogService } from '@app/services/log-service';
import { PusherService } from '@app/services/pusher.service';
import { ValidationService as VS } from '@app/services/validation.service';
import { gridLocalDataByGridId } from '@app/state';
import { entityStatuses } from '@app/state';
import { ClearSelectedRecordsState } from '@app/state/root.actions';
import { IGridLocalData } from '@app/state/root.state';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import * as exportsActions from '@shared/state/exports/actions';
import * as qsfSweepActions from '@app/modules/qsf-sweep/state/actions';
import { CellClassParams, ColDef, ColGroupDef, GetContextMenuItemsParams, GridOptions, MenuItemDef } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Subject } from 'rxjs';
import { filter, first, map, takeUntil } from 'rxjs/operators';
import { ProjectCounts } from '@app/models/projects/project-counts';
import { TypedAction } from '@ngrx/store/src/models';
import { OutputType } from '@app/models/enums/document-generation/output-type';
import { OutputContainerType } from '@app/models/enums/document-generation/output-container-type';
import * as claimantActions from '../../../claimants/claimant-details/state/actions';
import { GoToClaimantSummary } from '../../../claimants/claimant-details/state/actions';
import * as claimantSelectors from '../../../claimants/claimant-details/state/selectors';
import * as fromShared from '../../../shared/state';
import { ClosingStatementModalComponent } from '../../closing-statement-modal/closing-statement-modal.component';
import { DisbursementWorksheetModalComponent } from '../../disbursement-worksheet-modal/disbursement-worksheet-modal.component';
import { FirmFeeExpenseWorksheetModalComponent } from '../../firm-fee-expense-worksheet-modal/firm-fee-expense-worksheet-modal.component';
import * as projectActions from '../../state/actions';
import * as projectSelectors from '../../state/selectors';
import { UpdateByActionTemplateIdModalComponent } from '../../update-by-action-template-id-modal/update-by-action-template-id-modal.component';
import { UpdateLedgerStageModalComponent } from '../../update-ledger-stage-modal/update-ledger-stage-modal.component';
import { GeneratePaymentRequestModalComponent, IGeneratePaymentRequestModalInitialState } from '../modals/generate-payment-request-modal/generate-payment-request-modal.component';
import { UpdateDisbursementGroupModalComponent } from '../modals/update-disbursement-group-modal/update-disbursement-group-modal.component';
import { ClaimantSummaryButtonsRendererComponent } from '../renderers/claimant-summary-renderer/claimant-summary-buttons-renderer';
import { OnHoverPlaceholderRendererComponent } from '../renderers/on-hover-placeholder-renderer/on-hover-placeholder-renderer.component';
import { SPIStatusRendererComponent } from '../renderers/spi-status-renderer/spi-status-renderer.component';
import { ClaimantStageRendererComponent } from '../renderers/stage-render/claimant-stage-renderer.component';
import { StatusRendererComponent } from '../renderers/status-renderer/status-renderer.component';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { advancedSearch } from '../state/selectors';
import { UpdateFundedDateModalComponent } from '../modals/update-funded-date-modal/update-funded-date-modal.component';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { ClaimantStatusEnum } from '@app/models/enums/claimant-status.enum';

@Component({
  selector: 'app-claimant-summary-list',
  templateUrl: './claimant-summary-list.component.html',
  styleUrls: ['./claimant-summary-list.component.scss'],
})
export class ClaimantSummaryListComponent extends AdvancedSearchListView implements OnInit, OnDestroy {
  constructor(
    store: Store<fromShared.AppState>,
    router: Router,
    modalService: ModalService,
    elementRef: ElementRef,
    messageService: MessageService,
    route: ActivatedRoute,
    permissionService: PermissionService,
    private readonly actionsSubj: ActionsSubject,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly logger: LogService,
    private readonly yesNoPipe: YesNoPipe,
    private readonly datePipe: DateFormatPipe,
  ) {
    super(store, modalService, messageService, route, elementRef, router, permissionService);
  }
  entityType: EntityTypeEnum = EntityTypeEnum.ProjectClaimantSummary;
  public projectId: number;
  private gridLocalData: IGridLocalData;
  private clientSummaryGridParams: IServerSideGetRowsParamsExtended;
  private ledgerStageOptions: SelectOption[] = [];
  public readonly idColumnName = 'disbursementGroupClaimantId';
  private lienDataExportDocGenerator: SaveDocumentGeneratorRequest;
  private ledgerSettings: ClaimSettlementLedgerSettings;

  public claimantsCount?: number;
  public attorneyStatusOptions: SelectOption[] = SelectHelper.enumToOptions(AttorneyStatusEnum, (option: SelectOption) => option.name, (option: SelectOption) => option.name);
  public bKStatusOptions: SelectOption[] = SelectHelper.enumToOptions(BKScrubStatusCodesEnum, (option: SelectOption) => option.id, (option: SelectOption) => option.name);
  public bKScrubProductCodeOptions: SelectOption[] = SelectHelper.enumToOptions(BKScrubProductCodeEnumSearchMapping, (option: SelectOption) => option.name, (option: SelectOption) => option.name);

  private readonly project$ = this.store.select(projectSelectors.item);
  private readonly ledgerSettings$ = this.store.select(projectSelectors.ledgerSettings);
  public actionBar$ = this.store.select(projectSelectors.actionBar);
  public advancedSearch$ = this.store.select(advancedSearch);
  public disbursementGroup$ = this.store.select(fromShared.sharedSelectors.uploadBulkDocumentSelectors.disbursementGroups).pipe(
    filter((data: DisbursementGroupLight[]): boolean => !!data),
    map(
      (data: DisbursementGroupLight[]) => data.map((i: DisbursementGroupLight) => ({ ...i, name: `(${i.sequenceId}) ${i.name}` })).sort((a: any, b: any) => a.sequenceId - b.sequenceId),
    ),
  );
  private stages$ = this.store.select(claimantSelectors.ledgerStages);
  private statuses$ = this.store.select(entityStatuses);
  private ledgerStagesWithClaimantCount$ = this.store.select(claimantSelectors.ledgerStagesWithClaimantCount);
  private claimantSummaryList$ = this.store.select(selectors.claimantSummaryList);
  public savedSearchOptions$ = this.store.select(savedSearchSelectors.savedSearchSelectors.savedSearchListByEntityType);
  public currentSearch$ = this.store.select(savedSearchSelectors.savedSearchSelectors.currentSearchByEntityType({ entityType: this.entityType }));
  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);
  private readonly projectCounts$ = this.store.select(projectSelectors.projectCounts);
  protected ngUnsubscribe$ = new Subject<void>();

  public readonly gridId: GridId = GridId.ClaimantSummaryList;
  public gridLocalData$ = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));
  private disbrusementGroupAllocationTemplate: DocumentTemplate;

  public get hasSelectedRow(): boolean {
    if (this.gridLocalData?.selectedRecordsIds) {
      return [...this.gridLocalData.selectedRecordsIds.entries()]?.some(([, value]: [string, boolean]) => value === true);
    }
    return false;
  }

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
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
        headerName: 'Client ID',
        field: 'clientId',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
        pinned: 'left',
      },
      {
        headerName: 'Attorney Ref ID',
        field: 'attorneyReferenceId',
        width: 140,
        sortable: true,
        pinned: 'left',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Attorney Status',
        field: 'firmApprovedStatusName',
        width: 140,
        sortable: true,
        pinned: 'left',
        ...AGGridHelper.getAttorneyStatusFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'ARCHER ID',
        field: 'archerId',
        maxWidth: 100,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        pinned: 'left',
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
        pinned: 'left',
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
        pinned: 'left',
      },
      {
        headerName: 'Primary Firm',
        field: 'primaryFirm',
        sortable: true,
        suppressSizeToFit: true,
        width: 250,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Group',
        field: 'disbursementGroupName',
        sortable: true,
        suppressSizeToFit: true,
        width: 250,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Stage',
        field: 'stage.name',
        colId: 'stage.id',
        width: 200,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: 'stageRenderer',
        ...AGGridHelper.getDropdownColumnFilter({ options: this.ledgerStageOptions }),
      },
      {
        headerName: 'Stage Date Modified',
        field: 'stageLastModifiedDate',
        sortable: true,
        cellRenderer: (data: any): string => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Electronic Delivery',
        field: 'electronicDeliveryEnabled',
        sortable: true,
        width: 130,
        minWidth: 130,
        suppressSizeToFit: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: (data: any): string => this.yesNoPipe.transform(data.value),
      },
      {
        headerName: 'Digital Payments?',
        field: 'digitalPaymentStatus',
        sortable: true,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({
          options: ObservableOptionsHelper.getDigitalPaymentStatusOptions(),
        }),
        ...AGGridHelper.nameColumnDefaultParams,
        headerTooltip: 'Digital Payments?',
      },
      {
        headerName: 'E-mail',
        field: 'clientPrimaryEmail',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.emailColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'claimantStatus.name',
        colId: 'claimantStatus.id',
        sortable: true,
        minWidth: 110,
        width: 110,
        resizable: false,
        ...AGGridHelper.getDropdownColumnFilter({
          defaultValue: ClaimantStatusEnum.Active,
          options: [
            {
              id: ClaimantStatusEnum.Active,
              name: 'Active',
            },
            {
              id: ClaimantStatusEnum.Inactive,
              name: 'Inactive',
            },
          ],
        }),
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
        headerName: 'Probate SPI Sync\'ed',
        field: 'probateSpiSyncedStatusName',
        sortable: true,
        ...AGGridHelper.getProbateSpiSyncedFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Disbursement',
        field: 'disbursementGroupAmount',
        colId: 'totalSettlementAmount',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).disbursementGroupAmount < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Income',
        field: 'income',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).income < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'MDL',
        field: 'mdl',
        colId: 'mDL',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).mdl < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid MDL',
        field: 'unpaidMDL',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).unpaidMDL < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'CBF',
        field: 'cbf',
        colId: 'cBF',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).cbf < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid CBF',
        field: 'unpaidCBF',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).unpaidCBF < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Atty Fees',
        field: 'attyFeesNetFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).attyFeesNetFees < 0 && 'ag-cell-red',
      },
      {
        headerName: 'Unpaid Atty Fees',
        field: 'unpaidAttyFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).unpaidAttyFees < 0 && 'ag-cell-red',
      },
      {
        headerName: 'Atty Expenses',
        field: 'expenses',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).expenses < 0 && 'ag-cell-red',
      },
      {
        headerName: 'Unpaid Atty Expenses',
        field: 'unpaidAttyExpenses',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
        maxWidth: 200,
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).unpaidAttyExpenses < 0 && 'ag-cell-red',
      },
      {
        headerName: 'Liens',
        field: 'liens',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).liens < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid Liens',
        field: 'unpaidLiens',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).unpaidLiens < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'ARCHER Fees',
        field: 'archerFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).archerFees < 0 && 'ag-cell-red',
      },
      {
        headerName: 'Unpaid ARCHER Fees',
        field: 'unpaidArcherFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
        maxWidth: 200,
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).unpaidArcherFees < 0 && 'ag-cell-red',
      },
      {
        headerName: 'Other Fees',
        field: 'otherFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.amountColumnDefaultParams,
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).otherFees < 0 && 'ag-cell-red',
        cellRenderer: this.renderAmount.bind(this),
      },
      {
        headerName: 'Unpaid Other Fees',
        field: 'unpaidOtherFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.amountColumnDefaultParams,
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).unpaidOtherFees < 0 && 'ag-cell-red',
        cellRenderer: this.renderAmount.bind(this),
      },
      {
        headerName: '3rd Party Payments',
        field: 'otherLiens',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).otherLiens < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid 3rd Party Payments',
        field: 'unpaid3rdParty',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).unpaid3rdParty < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        maxWidth: 250,
      },
      {
        headerName: 'Net',
        field: 'net',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).net < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid Net',
        field: 'netDisbursementOutstanding',
        headerTooltip: 'Unpaid Net',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).netDisbursementOutstanding < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        maxWidth: 160,
        width: 160,
        hide: true,
      },
      {
        headerName: 'Balance',
        field: 'balance',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.moneyFormatter.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).balance !== 0 && 'ag-cell-red',
      },
      {
        headerName: 'Cash Balance',
        field: 'cashBalance',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).cashBalance < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unreleased Holdback Attorney Fees',
        field: 'coA50920Amount',
        headerTooltip: 'Unreleased Holdback Attorney Fees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).coA50920Amount < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 250,
      },
      {
        headerName: 'Unreleased Holdback Attorney Expenses',
        field: 'coA50195Amount',
        headerTooltip: 'Unreleased Holdback Attorney Expenses',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).coA50195Amount < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 250,
      },
      {
        headerName: 'Unreleased Holdback Lien Data',
        field: 'coA51010Amount',
        headerTooltip: 'Unreleased Holdback Lien Data',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).coA51010Amount < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 250,
      },
      {
        headerName: 'Unreleased Holdback ARCHER Fees',
        field: 'coA52910Amount',
        headerTooltip: 'Unreleased Holdback ARCHER Fees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).coA52910Amount < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 250,
      },
      {
        headerName: 'Unreleased Holdback Other Fees',
        field: 'coA53920Amount',
        headerTooltip: 'Unreleased Holdback Other Fees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).coA53920Amount < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 250,
      },
      {
        headerName: 'Unreleased Holdback 3rd Party Payments',
        field: 'coA54920Amount',
        headerTooltip: 'Unreleased Holdback 3rd Party Payments',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams): string => (params.data as DisbursementClaimantSummary).coA54920Amount < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 300,
      },
      {
        headerName: 'Payment Hold Reason',
        field: 'holdTypeReason.holdTypeReasonName',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 170,
      },
      {
        headerName: 'LPM Lien Status',
        field: 'medicalLiensOverallStatusLight',
        sortable: true,
        cellRenderer: 'statusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 120,
        minWidth: 120,
      },
      {
        headerName: 'Ledger Lien Status',
        field: 'lienStatusFinalizedName',
        colId: 'lienStatusFinalized',
        sortable: true,
        ...AGGridHelper.tagColumnDefaultParams,
        ...AGGridHelper.getLienStatusInClaimantFilter(),
        width: 140,
        minWidth: 140,
      },
      {
        headerName: 'Bankruptcy Status',
        field: 'bankruptcyOverallStatus',
        sortable: true,
        cellRenderer: 'statusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 140,
        minWidth: 140,
      },
      {
        headerName: 'Bankruptcy Stage',
        field: 'bankruptcyOverallStage',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        width: 250,
      },
      {
        headerName: 'BK Final Date',
        field: 'bankruptcyFinalDate',
        colId: 'productDetailsBankruptcySummary.finalDate',
        sortable: true,
        cellRenderer: (data: any): string => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'BK Abandoned',
        field: 'bankruptcyAbandoned',
        colId: 'productDetailsBankruptcySummary.abandoned',
        sortable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => this.yesNoPipe.transform(data.value),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'BK CS Needed',
        field: 'bankruptcyClosingStatementNeeded',
        colId: 'productDetailsBankruptcySummary.closingStatementNeeded',
        sortable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => this.yesNoPipe.transform(data.value),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'BK Ready to pay Trustee',
        field: 'bankruptcyReadyToPayTrustee',
        colId: 'productDetailsBankruptcySummary.readyToPayTrustee',
        sortable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => this.yesNoPipe.transform(data.value),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'BK Trustee Amt',
        field: 'bankruptcyAmountToTrustee',
        colId: 'productDetailsBankruptcySummary.amountToTrustee',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'BK Attorney Amt',
        field: 'bankruptcyAmountToAttorney',
        colId: 'productDetailsBankruptcySummary.amountToAttorney',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'BK Claimant Amt',
        field: 'bankruptcyAmountToClaimant',
        colId: 'productDetailsBankruptcySummary.amountToClaimant',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Probate Status',
        field: 'probateOverallStatus',
        sortable: true,
        cellRenderer: 'statusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 120,
        minWidth: 120,
      },
      {
        headerName: 'Probate Stage',
        field: 'probateOverallStage',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        width: 250,
      },
      {
        headerName: 'Release Status',
        field: 'releaseOverallStatus',
        sortable: true,
        cellRenderer: 'statusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 110,
        minWidth: 110,
      },
      {
        headerName: 'Release Stage',
        field: 'releaseOverallStage',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        width: 250,
      },
      {
        headerName: 'SPI',
        field: 'spi',
        colId: 'sPI',
        sortable: true,
        suppressSizeToFit: true,
        cellRenderer: 'spiStatusRenderer',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'BK Scrub Status',
        colId: 'bKScrubStatus.id',
        field: 'bKScrubStatus.name',
        width: 200,
        minWidth: 150,
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: ObservableOptionsHelper.getBKStatusFilter() }),
      },
      {
        headerName: 'BK Scrub Last Date',
        field: 'bKScrubLastDate',
        minWidth: 130,
        sortable: true,
        cellRenderer: (data: any): string => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'BK Scrub Product Code',
        field: 'bKScrubProductCode',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
        cellRenderer: 'onHoverPlacerHolderRenderer',
      },
      {
        headerName: 'BK Scrub Match Code',
        field: 'bKScrubMatchCode',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
        cellRenderer: 'onHoverPlacerHolderRenderer',
      },
      {
        headerName: 'BK Scrub Removal Date',
        field: 'bKScrubRemovalDate',
        minWidth: 170,
        sortable: true,
        cellRenderer: (data: any): string => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Client Funded Date',
        field: 'claimantFundedDate',
        sortable: true,
        cellRenderer: (data: any): string => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      AGGridHelper.getActionsColumn({
        goToClaimantSummaryHandler: this.goToClaimantSummary.bind(this),
        openStageHistoryModalHandler: this.openStageHistoryModal.bind(this),
      }),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      statusRenderer: StatusRendererComponent,
      buttonRenderer: ClaimantSummaryButtonsRendererComponent,
      stageRenderer: ClaimantStageRendererComponent,
      spiStatusRenderer: SPIStatusRendererComponent,
      onHoverPlacerHolderRenderer: OnHoverPlaceholderRendererComponent,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    suppressRowClickSelection: true,
    getContextMenuItems: this.getContextMenuItems,
  };

  public searchFields: SearchField[] = [
    SearchField.stringIdentifier('externalIdentifiers.identifier', 'Identifier'),
    SearchField.numberIdentifier('clientId', 'Client ID', VS.onlyNumbersValidator, SC.Equals, [SC.Contains, SC.StartsWith, SC.EndsWith, SC.NotContains]),
    SearchField.number('archerId', 'ARCHER ID', VS.onlyNumbersValidator, [SC.IsMissing]),
    SearchField.text('firstName', 'First Name', null, null, [SC.IsMissing]),
    SearchField.text('lastName', 'Last Name', null, null, [SC.IsMissing]),
    SearchField.stringIdentifier('cleanAttorneyReferenceId', 'Attorney Ref ID', SC.Contains, null, null, StringHelper.stripDashes),
    SearchField.in('firmApprovedStatusName', 'Attorney Status', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, this.attorneyStatusOptions),
    SearchField.text('primaryFirm', 'Primary Firm'),
    SearchField.data('disbursementGroupId', 'Group', 'id', 'name', SC.Contains, [SC.Equals, SC.IsMissing, SC.NotEqual], null, this.disbursementGroup$, SG.BoundedByCountHeight),
    SearchField.number('disbursementGroupSequence', 'Disbursement Group ID', VS.onlyNumbersValidator, [SC.IsMissing]),
    SearchField.data('stage.id', 'Ledger Stage', 'id', 'name', SC.Contains, [SC.Equals, SC.IsMissing, SC.NotEqual], null, this.stages$),
    SearchField.data('claimantStatus.id', 'Claimant Status', 'id', 'name', null, [SC.IsMissing, SC.Contains], null, this.statuses$),
    SearchField.date('stageLastModifiedDate', 'Stage Date Modified', null, [SC.IsMissing]),
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
    SearchField.data(CH.HoldTypeReason, 'Claimant Hold', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains], null, ObservableOptionsHelper.getYesNoOptions(), SG.HoldClientGroup, [
      SearchField.data(CH.HoldTypeId, 'Hold Type', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains]),
      SearchField.data(CH.HoldTypeReasonId, 'Reason', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals]),
    ]),
    SearchField.number('balance', 'Balance', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.number('net', 'Net', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.none('holdbacks', 'Holdbacks', null, [
      SearchField.number(HB.Amount, 'Amount', VS.onlyCurrencyValidator, [SC.IsMissing]),
      SearchField.data(HB.HoldbackAccount, 'Accounts', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, ObservableOptionsHelper.getHoldbackOptions()),
    ], true),

    SearchField.data('electronicDeliveryEnabled', 'Electronic Delivery', 'id', 'name', SC.Equals, [SC.IsMissing, SC.Contains], null, ObservableOptionsHelper.getYesNoOptions()),

    SearchField.number('netDisbursementOutstanding', 'Unpaid Net', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.number('cashBalance', 'Cash Balance', VS.onlyCurrencyValidator, [SC.IsMissing]),

    SearchField.boolean('sPI', 'SPI'),

    SearchField.in('bKScrubStatus.id', 'BK Scrub Status', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, this.bKStatusOptions),
    SearchField.date('bKScrubLastDate', 'BK Scrub Last Date', null, [SC.IsMissing]),
    SearchField.in('bKScrubProductCode', 'BK Scrub Product Code', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, this.bKScrubProductCodeOptions),
    SearchField.text('bKScrubMatchCode', 'BK Scrub Match Code', null, null, [SC.IsMissing, SC.StartsWith, SC.EndsWith]),
    SearchField.date('bKScrubRemovalDate', 'BK Scrub Removal Date', null, [SC.IsMissing]),

    SearchField.date('productDetailsBankruptcySummary.finalDate', 'BK Final Date', null, [SC.IsMissing]),
    SearchField.boolean('productDetailsBankruptcySummary.abandoned', 'BK Abandoned'),
    SearchField.boolean('productDetailsBankruptcySummary.closingStatementNeeded', 'BK CS Needed'),
    SearchField.boolean('productDetailsBankruptcySummary.readyToPayTrustee', 'BK Ready to pay Trustee'),
    SearchField.number('productDetailsBankruptcySummary.amountToTrustee', 'BK Trustee Amt', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.number('productDetailsBankruptcySummary.amountToAttorney', 'BK Attorney Amt', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.number('productDetailsBankruptcySummary.amountToClaimant', 'BK Claimant Amt', VS.onlyCurrencyValidator, [SC.IsMissing]),

    SearchField.data('digitalPaymentStatus', 'Digital Payment', 'id', 'name', SC.Equals, [SC.IsMissing, SC.Contains], null, ObservableOptionsHelper.getDigitalPaymentStatusOptions()),
    SearchField.data('claimantPaymentMethod', 'Claimant Payment Method', 'id', 'name', null, [SC.IsMissing], null, ObservableOptionsHelper.getClaimantPaymentMethodOptions()),
    SearchField.date('claimantFundedDate', 'Claimant Funded Date', null, [SC.IsMissing]),
  ];

  private readonly exportOrder: string[] = [
    'Client ID',
    'Attorney Ref ID',
    'Attorney Status',
    'ARCHER ID',
    'First Name',
    'Last Name',
    'Primary Firm',
    'Group',
    'Stage',
    'Stage Date Modified',
    'Electronic Delivery',
    'Digital Payments?',
    'E-mail',
    'Status',
    'Claimant Net Disbursed',
    "Probate SPI Sync'ed",
    'Disbursement',
    'Income',
    'MDL',
    'Unpaid MDL',
    'CBF',
    'Unpaid CBF',
    'Atty Fees',
    'Unpaid Atty Fees',
    'Atty Expenses',
    'Unpaid Atty Expenses',
    'Liens',
    'Unpaid Liens',
    'ARCHER Fees',
    'Unpaid ARCHER Fees',
    'Other Fees',
    'Unpaid Other Fees',
    '3rd Party Payments',
    'Unpaid 3rd Party Payments',
    'Net',
    'Unpaid Net',
    'Balance',
    'Cash Balance',
    'Unreleased Holdback Attorney Fees',
    'Unreleased Holdback Attorney Expenses',
    'Unreleased Holdback Lien Data',
    'Unreleased Holdback ARCHER Fees',
    'Unreleased Holdback Other Fees',
    'Unreleased Holdback 3rd Party Payments',
    'Payment Hold Reason',
    'LPM Lien Status',
    'Ledger Lien Status',
    'Bankruptcy Status',
    'Bankruptcy Stage',
    'BK Final Date',
    'BK Abandoned',
    'BK CS Needed',
    'BK Ready to pay Trustee',
    'BK Trustee Amt',
    'BK Attorney Amt',
    'BK Claimant Amt',
    'Probate Status',
    'Probate Stage',
    'Release Status',
    'Release Stage',
    'SPI',
    'Disbursement',
    'Income',
    'MDL',
    'Unpaid MDL',
    'CBF',
    'Unpaid CBF',
    'Atty Fees',
    'Unpaid Atty Fees',
    'Atty Expenses',
    'Unpaid Atty Expenses',
    'Liens',
    'Unpaid Liens',
    'ARCHER Fees',
    'Unpaid ARCHER Fees',
    'Other Fees',
    'Unpaid Other Fees',
    '3rd Party Payments',
    'Unpaid 3rd Party Payments',
    'Net',
    'Unpaid Net',
    'Balance',
    'Cash Balance',
    'Unreleased Holdback Attorney Fees',
    'Unreleased Holdback Attorney Expenses',
    'Unreleased Holdback Lien Data',
    'Unreleased Holdback ARCHER Fees',
    'Unreleased Holdback Other Fees',
    'Unreleased Holdback 3rd Party Payments',
    'Payment Hold Reason',
    'LPM Lien',
    'Ledger Lien',
    'BK',
    'Probate',
    'Release',
    'SPI',
    'BK Scrub Status',
    'BK Scrub Last Date',
    'BK Scrub Product Code',
    'BK Scrub Match Code',
    'BK Scrub Removal Date',
    'Client Funded Date',
  ];

  public ngOnInit(): void {
    super.ngOnInit();
    this.actionBar$
      .pipe(first())
      .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));

    this.store.dispatch(claimantActions.GetLedgerStages());
    this.store.dispatch(GetSavedSearchListByEntityType({ entityType: EntityTypeEnum.ProjectClaimantSummary }));

    this.actionsSubj.pipe(
      ofType(actions.LoadTemplatesComplete),
      filter((action: {
        data: any;
      } & TypedAction<'[Claimants Summary] Load Templates Complete'>) => !!action.data),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: {
      data: any;
    } & TypedAction<'[Claimants Summary] Load Templates Complete'>) => {
      if (action.data?.templates?.length > 0) {
        const disbursementTemplate = action.data.templates.find((template: DocumentTemplate) => template.name === 'Disbursement Group Allocation Export');
        if (disbursementTemplate) {
          this.disbrusementGroupAllocationTemplate = disbursementTemplate;
        }
      }
    });

    this.subscribeCurrentProject();
    this.initExportSubscriptions();
    this.subscribeToData();
    this.subscribeToActions();

    this.subscribeToLedgerSettings();

    this.currentSearch$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((savedSearch: SavedSearch) => {
      if (!savedSearch) {
        this.currentSearch = null;
        this.advancedSearchId = null;
        return;
      }

      if (savedSearch.skipRestoring) {
        this.store.dispatch(ResetCurrentSearch({ entityType: this.entityType }));
        this.setAdvancedSearchVisible(false);
        return;
      }

      this.switchIsEditStateTo(false);

      if (savedSearch && savedSearch.entityType === this.entityType) {
        this.initSavedSearch(savedSearch);
        this.advancedSearchId = savedSearch?.id;
      }
    });

    this.authStore$.pipe(
      filter((user: UserInfo) => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((user: UserInfo) => {
      this.orgId = user.selectedOrganization.id;
    });

    this.projectCounts$.pipe(
      filter((projectCounts: ProjectCounts) => !!projectCounts),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((projectCounts: ProjectCounts) => {
      this.claimantsCount = projectCounts.clientCount || 0;
    });
  }

  private subscribeToLedgerSettings(): void {
    this.ledgerSettings$
      .pipe(
        filter((settings: ClaimSettlementLedgerSettings) => !!settings),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((settings: ClaimSettlementLedgerSettings) => {
        this.ledgerSettings = settings;
        this.setVisibleNetDisbursementOutstandingColumn();
      });
  }

  public setAdvancedSearchVisible(isVisible: boolean): void {
    this.store.dispatch(actions.SaveAdvancedSearchVisibility({ isVisible }));
    this.showAdvancedSearch = isVisible;
  }

  private setVisibleNetDisbursementOutstandingColumn(): void {
    if (this.gridApi) {
      this.gridApi.setColumnsVisible(['netDisbursementOutstanding'], this.ledgerSettings?.productId === QSFType.GrossToFirm);
    }
  }

  private subscribeCurrentProject(): void {
    this.project$
      .pipe(
        filter((c: Project) => !!c),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((c: Project) => {
        this.projectId = c.id;
        if (this.gridParams) {
          this.fetchData(this.gridParams);
        }
        this.store.dispatch(actions.LoadTemplates({
          templateTypes: [EntityTypeEnum.ProjectClaimantSummary],
          entityTypeId: EntityTypeEnum.Projects,
          documentTypes: [DocumentType.EVResponse],
          entityId: this.projectId,
        }));
        this.store.dispatch(fromShared.sharedActions.uploadBulkDocumentActions.LoadDisbursementGroupsData({ entityId: this.projectId, removeProvisionals: false }));
        if (this.permissionService.canRead(PermissionTypeEnum.Organizations)) {
          this.store.dispatch(projectActions.GetProjectFirmsOptions({ projectId: this.projectId }));
        }
        this.store.dispatch(claimantActions.GetLedgerStagesWithClaimantCount({ projectId: this.projectId }));
      });
  }

  gridReady(gridApi): void {
    super.gridReady(gridApi);
    this.setVisibleNetDisbursementOutstandingColumn();
  }

  protected saveAdvancedSearch(): void {
    if (!this.isSearchSaved) {
      this.store.dispatch(actions.SaveSearchParams({ items: this.searchState }));
    }
  }

  private exportClientsList(columns: ColDef[]): void {
    const columnsParam = columns.map((item: ColDef) => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.colId || item.field,
      };

      if (item.headerName === 'Stage' || item.headerName === 'Status') {
        container.field = item.field; // cause we need stage.name for export
      }
      return container;
    }).filter((item: ColumnExport) => item.field && item.name !== 'Actions');

    columnsParam.sort((a: ColumnExport, b: ColumnExport) => this.exportOrder.indexOf(a.name) - this.exportOrder.indexOf(b.name));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ClaimantsDisbursements, this.projectId, EntityTypeEnum.Clients);
    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map((i: { id: number; name: string; }) => i.name),
      this.exportClientsListCallback.bind(this),
      () => (this.store.dispatch(actions.DownloadClaimantsSummary({
        id: this.projectId,
        searchOptions: this.getStandardExportParams(this.gridLocalData),
        columns: columnsParam,
        channelName,
      }))),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private exportElectronicDeliveryReport(_columns: ColDef[]): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportElectronicDeliveryReport, this.projectId, EntityTypeEnum.Clients);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map((i: { id: number; name: string; }) => i.name),
      null,
      () => (this.store.dispatch(actions.DownloadElectronicDeliveryReport({ id: this.projectId }))),
    );
  }

  private initExportSubscriptions(): void {
    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => { this.isExporting = result; });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.DownloadClaimantsSummaryComplete),
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
      this.actionBar$.pipe(first())
        .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));
    });
  }

  private exportClientsListCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.actionBar$.pipe(first())
      .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(actions.DownloadClaimantsSummaryDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(actions.Error({ error: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  private getActionBar(actionBar: ActionHandlersMap): ActionHandlersMap {
    return {
      ...this.savedSearchActionBar,
      ...actionBar,
      advancedSearch: this.advancedSearchAction(),
      basicSearch: this.basicSearchAction(),
      clearFilter: {
        callback: (): void => {
          this.store.dispatch(ClearSelectedRecordsState({ gridId: GridId.ClaimantSummaryList }));
          this.clearFilters();
        },
        disabled: () => !this.canClearFilters(),
      },
      download: {
        disabled: () => this.isExporting || (SearchState.hasErrors(this.searchState) && this.showAdvancedSearch),
        options: [
          { name: 'Standard', callback: () => this.exportClientsList(this.getAllColumnDefs()) },
          { name: 'Electronic Delivery Report', callback: () => this.exportElectronicDeliveryReport(this.getAllColumnDefs()) },
          {
            name: 'Electronic Delivery Report',
            callback: () => this.exportElectronicDeliveryReport(this.getAllColumnDefs()),
            hidden: () => true, // Hiding in this release per Scott's request
          },
          {
            disabled: () => this.isExporting || (SearchState.hasErrors(this.searchState) && this.showAdvancedSearch),
            name: 'Export Disbursement Group Allocation',
            callback: () => this.exportDisbursementGroupWorkflow(),
          },
          {
            name: 'Export Lien Data',
            callback: () => this.onExportLienData(),
          },
          {
            name: 'Export ARCHER Fees',
            callback: () => this.onExportARCHERFees(),
          },
        ],
      },
      deleteSearch: {
        callback: () => this.deleteSearch(this.currentSearch?.id),
        disabled: () => !this.currentSearch?.id,
        hidden: () => !this.isOnSavedSearch,
      },
      exporting: { hidden: () => !this.isExporting },
      actions: {
        options: [
          {
            name: 'Generate Payment Request',
            disabled: () => !this.hasSelectedRow,
            callback: () => this.openGeneratePaymentRequestModal(),
            permissions: PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.GeneratePaymentRequest),
          },
          {
            name: 'Generate Disbursement Worksheet',
            callback: () => this.openFeeExpenseWorksheetModal(),
            disabled: () => !this.gridApi?.getDisplayedRowCount(),
            permissions: PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.GenerateFeeAndExpense),
          },
          {
            name: 'Update Stage',
            callback: () => this.openUpdateStageModal(),
            disabled: () => !this.gridApi?.getDisplayedRowCount(),
            permissions: PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.UpdateStage),
          },
          {
            name: 'Generate Closing Statement',
            callback: () => this.openClosingStatementModal(),
            disabled: () => !this.hasSelectedRow,
            permissions: PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.GenerateClosingStatement),
          },
          {
            name: 'Generate Firm Fee & Expense Worksheet',
            callback: () => this.openFirmFeeExpenseWorksheetModal(),
            permissions: PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.GenerateFirmFeeExpenseWorksheet),
          },
          {
            name: 'Reassign Disbursement Group',
            disabled: () => !this.hasSelectedRow,
            callback: () => this.openUpdateDisbursementGroupModal(),
          },
          {
            name: 'Update Funded Date',
            callback: () => this.openUpdateFundedDateModal(),
            disabled: () => !this.hasSelectedRow,
            permissions: PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.UpdateFundedDate),
          },
          {
            name: 'Update Lien Data',
            callback: () => this.openUpdateByTemplateIdModal(BatchActionTemplate.UpdateLedgerLienData),
            disabled: () => !this.hasSelectedRow,
            permissions: PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.UpdateLienData),
          },
          {
            name: 'Sync Probate Payment Info with Ledger',
            callback: () => this.openUpdateByTemplateIdModal(BatchActionTemplate.SyncProbateSpiWithLedger),
            disabled: () => !this.hasSelectedRow,
            permissions: PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.SyncProbatePaymentInfoWithLedger),
          },
          {
            name: 'Run QSF Sweep',
            callback: () => this.openRunQsfSweepModal(),
            permissions: PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.RunQSFSweep),
          },
        ],

        hidden: () => !this.permissionService.hasAny([
          PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.GeneratePaymentRequest),
          PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.GenerateFeeAndExpense),
          PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.UpdateStage),
          PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.GenerateClosingStatement),
          PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.GenerateFeeAndExpense),
        ]),

      },
    };
  }

  public deleteSearch(searchId: number): void {
    super.deleteSearch(searchId);
    this.store.dispatch(GoToClaimantSummary({ projectId: this.projectId }));
  }

  getAllColumnDefs(): any {
    return this.additionalColDefs
      ? this.gridOptions.columnDefs.filter((col: ColDef | ColGroupDef) => !this.additionalColDefs.find((addCol: ColDef) => 'field' in col && addCol.field === col.field))
        .concat(this.additionalColDefs)
      : [].concat(this.gridOptions.columnDefs);
  }

  public goToClaimantSummary({ data }): void {
    if (data.clientId) {
      const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
      this.store.dispatch(
        CreatePager({
          relatedPage: RelatedPage.ClaimantsFromClaimantSummary,
          settings: navSettings,
          pager: { payload: { projectId: this.projectId } as claimantActions.IClaimantSummaryPagerPayload },
        }),
      );

      const claimantDetailsRequest: ClaimantDetailsRequest = { gridParamsRequest: this.gridParams.request };
      this.store.dispatch(claimantActions.SetClaimantDetailsRequest({ claimantDetailsRequest }));
      this.store.dispatch(claimantActions.GoToClaimantLedgerSummary({ claimantId: data.clientId }));
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    // eslint-disable-next-line no-param-reassign
    agGridParams = this.mergeSearchFilters(agGridParams);
    this.gridParams = agGridParams;
    this.store.dispatch(actions.GetClaimantsSummaryGrid({ projectId: this.projectId, agGridParams }));
  }

  protected onRowDoubleClicked(param): void {
    this.goToClaimantSummary(param);
  }

  private openFeeExpenseWorksheetModal(): void {
    const disbursementWorksheetRef = this.modalService.show(DisbursementWorksheetModalComponent, {
      class: 'fee-expense-worksheet-modal',
      initialState: { projectId: this.projectId },
    });
    disbursementWorksheetRef.content.worksheetGeneratedSuccessfully.subscribe(() => {
      this.refreshGrid();
    });
  }

  private openFirmFeeExpenseWorksheetModal(): void {
    this.modalService.show(FirmFeeExpenseWorksheetModalComponent, {
      class: 'fee-expense-worksheet-modal',
      initialState: { projectId: this.projectId },
    });
  }

  private openStageHistoryModal(param): void {
    this.modalService.show(StageHistoryModalComponent, {
      class: 'history-modal',
      initialState: { id: param.data.claimSettlementLedgerId },
    });
  }

  private openClosingStatementModal(): void {
    this.claimantSummaryList$.pipe(
      first(),
    ).subscribe(() => {
      const clientSummaryGridSearchOpt = SearchOptionsHelper.createSearchOptions(this.gridLocalData, this.gridParams);
      this.modalService.show(ClosingStatementModalComponent, {
        class: 'fee-expense-worksheet-modal',
        initialState: {
          projectId: this.projectId,
          clientSummaryGridSearchOpt,
        },
      });
    });
  }

  private openUpdateStageModal(): void {
    const updateStageRef = this.modalService.show(UpdateLedgerStageModalComponent, {
      class: 'fee-expense-worksheet-modal',
      initialState: { projectId: this.projectId },
    });
    updateStageRef.content.stagesUpdated.subscribe(() => {
      this.refreshGrid();
    });
  }

  private openUpdateByTemplateIdModal(templateId: number): void {
    const updateByTemplateIdRef = this.modalService.show(UpdateByActionTemplateIdModalComponent, {
      class: 'fee-expense-worksheet-modal',
      initialState: {
        projectId: this.projectId,
        actionTemplateId: templateId,
      },
    });
    updateByTemplateIdRef.content.dataUpdated.subscribe(() => {
      this.refreshGrid();
    });
  }

  private openUpdateFundedDateModal(): void {
    const updateFundedDateRef = this.modalService.show(UpdateFundedDateModalComponent, {
      class: 'copy-special-payment-instructions-modal',
      initialState: {
        projectId: this.projectId,
      },
    });
    updateFundedDateRef.content.dataUpdated.subscribe(() => {
      this.refreshGrid();
    });
  }

  private openRunQsfSweepModal(): void {
    this.store.dispatch(qsfSweepActions.OpenRunQsfSweepModal({
      caseId: this.projectId,
      claimantsCount: this.claimantsCount,
    }));
  }

  private refreshGrid(): void {
    if (this.gridApi) {
      this.gridApi.refreshServerSide({ purge: true });
    }
  }

  private openGeneratePaymentRequestModal(): void {
    this.claimantSummaryList$.pipe(
      first(),
    ).subscribe(() => {
      const searchOptions: ISearchOptions = {
        ...AGGridHelper.getDefaultSearchRequest(),
        ...SearchOptionsHelper.createSearchOptions(this.gridLocalData, this.gridParams),
      };

      this.modalService.show(GeneratePaymentRequestModalComponent, {
        class: 'generate-payment-request-modal',
        initialState: this.buildModalState(searchOptions) as Partial<GeneratePaymentRequestModalComponent>,
      });
    });
  }

  private buildModalState(searchOptions: ISearchOptions): IGeneratePaymentRequestModalInitialState {
    return {
      projectId: this.projectId,
      searchOptions,
      paymentRequestEntityType: EntityTypeEnum.DisbursementGroupClaimant,
    };
  }

  private openUpdateDisbursementGroupModal(): void {
    const updateStageRef = this.modalService.show(UpdateDisbursementGroupModalComponent, {
      class: 'update-disbursement-group-modal',
      initialState: { projectId: this.projectId },
    });
    updateStageRef.content.stagesUpdated.subscribe(() => {
      this.refreshGrid();
    });
  }

  public ngOnDestroy(): void {
    this.switchIsEditStateTo(false);
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    this.store.dispatch(ClearSelectedRecordsState({ gridId: GridId.ClaimantSummaryList }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    if (this.isOnSavedSearch && this.isSearchSaved) {
      this.store.dispatch(ResetCurrentSearch({ entityType: this.entityType }));
      this.store.dispatch(actions.SaveSearchParams({ items: [] }));
    }
  }

  protected toggleAdvancedSearch(): void {
    super.toggleAdvancedSearch();
    this.store.dispatch(actions.SaveAdvancedSearchVisibility({ isVisible: this.showAdvancedSearch }));
  }

  private exportDisbursementGroupWorkflow(): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ClaimantsDisbursements, this.projectId, EntityTypeEnum.Projects);

    const gridParams = this.mergeSearchFilters(this.gridParams);
    const additionalRequest = SearchOptionsHelper
      .getFilterRequest([
        SearchOptionsHelper.getNumberFilter('caseId', FilterTypes.Number, 'equals', this.projectId),
        SearchOptionsHelper.getContainsFilter('disbursementGroupActive', FilterTypes.Boolean, 'equals', true.toString()),
      ]);

    gridParams.request.filterModel = gridParams.request.filterModel.concat(additionalRequest.filterModel);
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.gridLocalData, this.gridParams);

    const request: SaveDocumentGeneratorRequest = {
      id: null,
      channelName,
      name: 'Disbursement Group Allocation Export',
      entityTypeId: EntityTypeEnum.Projects,
      entityId: this.projectId,
      outputType: OutputType.Draft,
      outputFileType: OutputFileType.Xlsx,
      outputContainerType: OutputContainerType.Zip,
      outputFileNamingConvention: this.disbrusementGroupAllocationTemplate.outputFileNamingConvention,
      watermark: this.disbrusementGroupAllocationTemplate.watermark,
      templateIds: [this.disbrusementGroupAllocationTemplate.id],
      templateFilters: [
        { entityId: this.projectId, entityTypeId: EntityTypeEnum.Projects, searchOptions: null },
        { entityId: -1, entityTypeId: EntityTypeEnum.Projects, searchOptions },
      ],
      jobScheduleChronExpression: null,
      jobExternalId: null,
      generatorType: null,
      outputFileName: null,
      outputSaveChildDocs: null,
      recurrence: null,
      useIndividualTemplates: null,
    };

    this.store.dispatch(actions.GenerateDocuments({ controller: ControllerEndpoints.Projects, request, id: this.projectId }));
    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(DocumentGeneratorsLoading).map((i: { id: number; name: string; }) => i.name),
      this.exportDocumentGeneratorEventHandler.bind(this),
    );
  }

  private onExportLienData(): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportLienData, this.projectId, EntityTypeEnum.Projects);

    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(DocumentGeneratorsLoading).map((i: { id: number; name: string; }) => i.name),
      this.exportDocumentGeneratorEventHandler.bind(this),
      this.enqueueExportLienData.bind(this, channelName),
    );
  }

  private enqueueExportLienData(pusherChannelName: string): void {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.gridLocalData, this.clientSummaryGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    searchOptions.filterModel = [
      ...searchOptions.filterModel,
      new FilterModel({ filter: true, filterType: FilterTypes.Boolean, type: 'equals', key: 'disbursementGroupActive' }),
    ];

    const generationRequest: Partial<SaveDocumentGeneratorRequest> = {
      entityId: this.projectId,
      entityTypeId: EntityTypeEnum.Projects,
      templateFilters: [{ entityId: -1, entityTypeId: EntityTypeEnum.DisbursementGroupClaimant, searchOptions }],
      templateIds: [DocumentGenerationTemplates.LienDataExportTemplate],
      outputFileType: OutputFileType.Xlsx,
      name: 'Lien Data Export',
      channelName: pusherChannelName,
      outputFileNamingConvention: '{entityCode}_{entityId}_{name}_{timestamp}',
    };

    this.store.dispatch(projectActions.EnqueueDocumentGeneration({ generationRequest: <SaveDocumentGeneratorRequest>generationRequest }));
  }

  private onExportARCHERFees(): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportARCHERFees, this.projectId, EntityTypeEnum.Projects);

    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(DocumentGeneratorsLoading).map((i: { id: number; name: string; }) => i.name),
      this.exportDocumentGeneratorEventHandler.bind(this),
      this.enqueueExportARCHERFees.bind(this, channelName),
    );
  }

  private enqueueExportARCHERFees(pusherChannelName: string): void {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.gridLocalData, this.clientSummaryGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    searchOptions.filterModel = [
      ...searchOptions.filterModel,
      new FilterModel({ filter: true, filterType: FilterTypes.Boolean, type: 'equals', key: 'disbursementGroupActive' }),
    ];

    const generationRequest: Partial<SaveDocumentGeneratorRequest> = {
      entityId: this.projectId,
      entityTypeId: EntityTypeEnum.Projects,
      templateFilters: [{ entityId: this.projectId, entityTypeId: EntityTypeEnum.Projects, searchOptions }],
      templateIds: [DocumentGenerationTemplates.ARCHERFeesTemplate],
      outputFileType: OutputFileType.Xlsx,
      name: 'ARCHER Fees Export',
      channelName: pusherChannelName,
      outputFileNamingConvention: '{name}_{timestamp}',
    };

    this.store.dispatch(projectActions.EnqueueDocumentGeneration({ generationRequest: <SaveDocumentGeneratorRequest>generationRequest }));
  }

  private exportDocumentGeneratorEventHandler(data: any, event: string): void {
    switch (DocumentGeneratorsLoading[event]) {
      case DocumentGeneratorsLoading.Complete:
        this.store.dispatch(projectActions.DownloadGeneratedDocument({ generatorId: this.lienDataExportDocGenerator.id }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      case DocumentGeneratorsLoading.Error:
        this.logger.log('[exportLienDataChannelEventHandler]', data);
        this.store.dispatch(actions.Error({ error: `Error exporting: ${data.message}` }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      case DocumentGeneratorsLoading.LienDataExportDuplicateError:
        this.logger.log('[exportLienDataChannelEventHandler]', data);
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        this.store.dispatch(exportsActions.ShowAlertLienDataExportDuplicateError());
        break;
      default:
        break;
    }
  }

  private subscribeToActions(): void {
    this.actionsSubj.pipe(
      ofType(projectActions.EnqueueDocumentGenerationSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { generationRequest: SaveDocumentGeneratorRequest; } & TypedAction<string>) => {
      this.lienDataExportDocGenerator = action.generationRequest;
    });
  }

  private subscribeToData(): void {
    this.gridLocalData$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((data: IGridLocalData) => {
        this.gridLocalData = data;
      });

    this.ledgerStagesWithClaimantCount$.pipe(
      filter((items: LedgerStageWithClaimantCount[]) => !!items),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: LedgerStageWithClaimantCount[]) => {
      const opts = SelectHelper.toOptions(
        items,
        (opt: LedgerStageWithClaimantCount) => opt.stage.id,
        (opt: LedgerStageWithClaimantCount) => `${opt.stage.name} (${opt.claimantsCount})`,
      );
      if (this.ledgerStageOptions.length) {
        ArrayHelper.empty(this.ledgerStageOptions);
      }
      this.ledgerStageOptions.push(...opts);
    });

    this.store.select(selectors.gridParams)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((params: IServerSideGetRowsParamsExtended) => {
        this.clientSummaryGridParams = params;
      });
  }

  // If value is null or undefined it will show an empty string.
  // Otherwise, it will display value as is. We need this to take zero into account.
  private moneyFormatter(data: any): string {
    return !isNil(data?.value) ? CurrencyHelper.toUsdFormat(data) : '';
  }

  private renderAmount(data: any): string {
    if (isNil(data?.value)) {
      return '';
    }
    return data.value < 0 ? `(${formatCurrency(Math.abs(data.value), 'en-US', '$')})` : `${this.moneyFormatter(data)}`;
  }

  private getContextMenuItems(params: GetContextMenuItemsParams): (string | MenuItemDef)[] {
    return AGGridHelper.getCustomContextMenu([{
      name: 'Open In a New Tab',
      action: () => UrlHelper.openNewTab(`/claimants/${params.node.data.clientId}`),
    }]);
  }
}
