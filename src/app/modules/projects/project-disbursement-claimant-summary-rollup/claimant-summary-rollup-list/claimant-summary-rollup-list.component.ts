/* eslint-disable no-param-reassign */
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchField } from '@app/models/advanced-search/search-field';
import {
  ClientHoldAdvancedSearchKey as CH,
  ClientWorkflowAdvancedSearchKey as CW,
  EntityTypeEnum, ExportLoadingStatus,
  HoldbacksAdvancedSearchKey as HB,
  JobNameEnum, ProductWorkflowAdvancedSearchKey as PW,
  ProductCategory,
  SearchGroupType as SG,
  UnpaidLedgerEntriesAdvancedSearchKey as UL,
} from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';

import { formatCurrency } from '@angular/common';
import { CurrencyHelper, SearchOptionsHelper, StringHelper } from '@app/helpers';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ObservableOptionsHelper } from '@app/helpers/observable-options.helper';
import { SelectHelper } from '@app/helpers/select.helper';
import { ColumnExport, Project, UserInfo } from '@app/models';
import { SearchConditionsEnum as SC } from '@app/models/advanced-search/search-conditions.enum';
import { SearchState } from '@app/models/advanced-search/search-state';
import { ClaimantSummaryRollup } from '@app/models/claimant-summary-rollup';
import { BKScrubProductCodeEnumSearchMapping } from '@app/models/enums/bk-scrub-product-code.enum';
import { BKScrubStatusCodesEnum } from '@app/models/enums/bk-scrub-status-codes.enum';
import { SavedSearch } from '@app/models/saved-search';
import { ISearchOptions } from '@app/models/search-options';
import * as fromAuth from '@app/modules/auth/state';
import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { AdvancedSearchListView } from '@app/modules/shared/_abstractions/advanced-search-list-view';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { DateFormatPipe, EnumToArrayPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { GetSavedSearchListByEntityType, ResetCurrentSearch } from '@app/modules/shared/state/saved-search/actions';
import * as savedSearchSelectors from '@app/modules/shared/state/saved-search/selectors';
import { MessageService, ModalService, PermissionService, ValidationService as VS } from '@app/services';
import { PusherService } from '@app/services/pusher.service';
import { ValidationService } from '@app/services/validation.service';
import { gridLocalDataByGridId } from '@app/state';
import { entityStatuses } from '@app/state';
import { ClearSelectedRecordsState } from '@app/state/root.actions';
import { IGridLocalData } from '@app/state/root.state';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import * as exportsActions from '@shared/state/exports/actions';
import { CellClassParams, ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Observable } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';
import * as claimantActions from '../../../claimants/claimant-details/state/actions';
import * as fromShared from '../../../shared/state';
import { ClaimantSummaryButtonsRendererComponent } from '../../project-disbursement-claimant-summary/renderers/claimant-summary-renderer/claimant-summary-buttons-renderer';
import { OnHoverPlaceholderRendererComponent } from '../../project-disbursement-claimant-summary/renderers/on-hover-placeholder-renderer/on-hover-placeholder-renderer.component';
import { StatusRendererComponent } from '../../project-disbursement-claimant-summary/renderers/status-renderer/status-renderer.component';
import * as projectActions from '../../state/actions';
import * as projectSelectors from '../../state/selectors';
import { NetPaidInFullRendererComponent } from '../renderers/net-paid-in-full-renderer/net-paid-in-full-renderer.component';
import * as actions from '../state/actions';
import { advancedSearch, gridParams } from '../state/selectors';
import { ClaimantStatusEnum } from '@app/models/enums/claimant-status.enum';

@Component({
  selector: 'app-claimant-summary-rollup-list',
  templateUrl: './claimant-summary-rollup-list.component.html',
  styleUrls: ['./claimant-summary-rollup-list.component.scss'],
})
export class ClaimantSummaryRollupListComponent extends AdvancedSearchListView implements OnInit, OnDestroy {
  entityType: EntityTypeEnum = EntityTypeEnum.ProjectClaimantSummaryRollup;
  public projectId: number;
  private gridLocalData: IGridLocalData;
  private claimantSummaryRollupGridParams: IServerSideGetRowsParamsExtended;

  private readonly project$ = this.store.select(projectSelectors.item);
  private readonly actionBar$ = this.store.select(projectSelectors.actionBar);
  private readonly statuses$ = this.store.select(entityStatuses);
  public advancedSearch$ = this.store.select(advancedSearch);
  public savedSearchOptions$ = this.store.select(savedSearchSelectors.savedSearchSelectors.savedSearchListByEntityType);
  public currentSearch$ = this.store.select(savedSearchSelectors.savedSearchSelectors.currentSearchByEntityType({ entityType: this.entityType }));
  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);
  public gridLocalData$: Observable<any>;
  public bKStatusOptions: SelectOption[] = SelectHelper.enumToOptions(BKScrubStatusCodesEnum, (option: SelectOption) => option.id, (option: SelectOption) => option.name);
  public bKScrubProductCodeOptions: SelectOption[] = SelectHelper.enumToOptions(BKScrubProductCodeEnumSearchMapping, (option: SelectOption) => option.name, (option: SelectOption) => option.name);

  private readonly exportFieldValueColumns = new Set([
    'disbursementGroupSummary.productDetailsBankruptcySummary.finalDate',
    'disbursementGroupSummary.productDetailsBankruptcySummary.abandoned',
    'disbursementGroupSummary.productDetailsBankruptcySummary.closingStatementNeeded',
    'disbursementGroupSummary.productDetailsBankruptcySummary.readyToPayTrustee',
    'disbursementGroupSummary.productDetailsBankruptcySummary.amountToTrustee',
    'disbursementGroupSummary.productDetailsBankruptcySummary.amountToAttorney',
    'disbursementGroupSummary.productDetailsBankruptcySummary.amountToClaimant',
  ]);

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Client ID',
        field: 'id',
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
        colId: 'org.name',
        sortable: true,
        suppressSizeToFit: true,
        width: 250,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Status',
        field: 'claimantStatus.name',
        colId: 'statusId',
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
        headerName: 'Ledger Count',
        headerTooltip: 'Ledger Count',
        field: 'disbursementGroupSummary.ledgerCount',
        sortable: true,
        suppressSizeToFit: true,
        width: 250,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Net Paid in Full',
        headerTooltip: 'Net Paid in Full',
        field: 'disbursementGroupSummary.netPaidInFull',
        sortable: true,
        width: 130,
        minWidth: 130,
        suppressSizeToFit: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: 'netPaidInFullRenderer',
      },
      {
        headerName: 'Expected Allocation',
        headerTooltip: 'Expected Allocation',
        field: 'disbursementGroupSummary.expectedAllocation',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.expectedAllocation < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Assigned Disbursements',
        headerTooltip: 'Assigned Disbursements',
        field: 'disbursementGroupSummary.assignedDisbursement',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.assignedDisbursement < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 200,
        maxWidth: 200,
      },
      {
        headerName: 'Income',
        field: 'disbursementGroupSummary.income',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.income < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'MDL',
        field: 'disbursementGroupSummary.mdl',
        colId: 'disbursementGroupSummary.mDL',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.mdl < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid MDL',
        headerTooltip: 'Unpaid MDL',
        field: 'disbursementGroupSummary.unpaidMDL',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => !(params.data as ClaimantSummaryRollup).disbursementGroupSummary?.isPositiveUnpaidMDL && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'CBF',
        field: 'disbursementGroupSummary.cbf',
        colId: 'disbursementGroupSummary.cBF',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.cbf < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid CBF',
        headerTooltip: 'Unpaid CBF',
        field: 'disbursementGroupSummary.unpaidCBF',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => !(params.data as ClaimantSummaryRollup).disbursementGroupSummary?.isPositiveUnpaidCBF && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Atty Fees',
        headerTooltip: 'Atty Fees',
        field: 'disbursementGroupSummary.attyFeesAttyExpenses',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.attyFeesAttyExpenses < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid Atty Fees',
        headerTooltip: 'Unpaid Atty Fees',
        field: 'disbursementGroupSummary.unpaidAttyFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => !(params.data as ClaimantSummaryRollup).disbursementGroupSummary?.isPositiveUnpaidAttyFees && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Atty Expenses',
        headerTooltip: 'Atty Expenses',
        field: 'disbursementGroupSummary.expenses',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.expenses < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid Atty Expenses',
        headerTooltip: 'Unpaid Atty Expenses',
        field: 'disbursementGroupSummary.unpaidAttyExpenses',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => !(params.data as ClaimantSummaryRollup).disbursementGroupSummary?.isPositiveUnpaidAttyExpenses && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 200,
        maxWidth: 200,
      },
      {
        headerName: 'Liens',
        headerTooltip: 'Liens',
        field: 'disbursementGroupSummary.liens',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.liens < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid Liens',
        headerTooltip: 'Unpaid Liens',
        field: 'disbursementGroupSummary.unpaidLiens',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => !(params.data as ClaimantSummaryRollup).disbursementGroupSummary?.isPositiveUnpaidLiens && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'ARCHER Fees',
        headerTooltip: 'ARCHER Fees',
        field: 'disbursementGroupSummary.aRCHERFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.aRCHERFees < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid ARCHER Fees',
        headerTooltip: 'Unpaid ARCHER Fees',
        field: 'disbursementGroupSummary.unpaidARCHERFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => !(params.data as ClaimantSummaryRollup).disbursementGroupSummary?.isPositiveUnpaidARCHERFees && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 200,
        maxWidth: 200,
      },
      {
        headerName: 'Other Fees',
        headerTooltip: 'Other Fees',
        field: 'disbursementGroupSummary.otherFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.otherFees < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid Other Fees',
        headerTooltip: 'Unpaid Other Fees',
        field: 'disbursementGroupSummary.unpaidOtherFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => !(params.data as ClaimantSummaryRollup).disbursementGroupSummary?.isPositiveUnpaidOtherFees && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: '3rd Party Payments',
        headerTooltip: '3rd Party Payments',
        field: 'disbursementGroupSummary.otherLiens',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.otherLiens < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid 3rd Party Payments',
        headerTooltip: 'Unpaid 3rd Party Payments',
        field: 'disbursementGroupSummary.unpaidOtherLiens',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => !(params.data as ClaimantSummaryRollup).disbursementGroupSummary?.isPositiveUnpaidOtherLiens && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 250,
      },
      {
        headerName: 'Net',
        field: 'disbursementGroupSummary.net',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.net < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unpaid Net',
        headerTooltip: 'Unpaid Net',
        field: 'disbursementGroupSummary.availableDisbursements',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.availableDisbursements < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 160,
        maxWidth: 160,
      },
      {
        headerName: 'Balance',
        field: 'disbursementGroupSummary.balance',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.balance < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Cash Balance',
        field: 'disbursementGroupSummary.cashBalance',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.cashBalance < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Unreleased Holdback Attorney Fees',
        headerTooltip: 'Unreleased Holdback Attorney Fees',
        field: 'disbursementGroupSummary.holdbackAttorneyFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.holdbackAttorneyFees < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 250,
      },
      {
        headerName: 'Unreleased Holdback Attorney Expenses',
        headerTooltip: 'Unreleased Holdback Attorney Expenses',
        field: 'disbursementGroupSummary.holdbackAttorneyExpenses',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.holdbackAttorneyExpenses < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 250,
      },
      {
        headerName: 'Unreleased Holdback Lien Data',
        headerTooltip: 'Unreleased Holdback Lien Data',
        field: 'disbursementGroupSummary.holdbackLienFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.holdbackLienFees < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 250,
      },
      {
        headerName: 'Unreleased Holdback ARCHER Fees',
        headerTooltip: 'Unreleased Holdback ARCHER Fees',
        field: 'disbursementGroupSummary.holdbackARCHERFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.holdbackARCHERFees < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 250,
      },
      {
        headerName: 'Unreleased Holdback Other Fees',
        headerTooltip: 'Unreleased Holdback Other Fees',
        field: 'disbursementGroupSummary.holdbackOtherFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.holdbackOtherFees < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 250,
        maxWidth: 250,
      },
      {
        headerName: 'Unreleased Holdback 3rd Party Payments',
        headerTooltip: 'Unreleased Holdback 3rd Party Payments',
        field: 'disbursementGroupSummary.holdbackThirdPartyFees',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        cellClass: (params: CellClassParams):string => (params.data as ClaimantSummaryRollup).disbursementGroupSummary?.holdbackThirdPartyFees < 0 && 'ag-cell-red',
        ...AGGridHelper.amountColumnDefaultParams,
        width: 300,
        maxWidth: 300,
      },
      {
        headerName: 'Payment Hold Reason',
        headerTooltip: 'Payment Hold Reason',
        field: 'holdTypeReason.holdTypeReasonName',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 170,
      },
      {
        headerName: 'Lien Status',
        field: 'disbursementGroupSummary.lien',
        sortable: true,
        cellRenderer: 'statusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 120,
        minWidth: 120,
      },
      {
        headerName: 'Bankruptcy Status',
        field: 'disbursementGroupSummary.bankruptcy',
        sortable: true,
        cellRenderer: 'statusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 140,
        minWidth: 140,
      },
      {
        headerName: 'Bankruptcy Stage',
        field: 'disbursementGroupSummary.bankruptcyStage',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        width: 250,
      },
      {
        headerName: 'BK Final Date',
        field: 'disbursementGroupSummary.bankruptcyFinalDate',
        colId: 'disbursementGroupSummary.productDetailsBankruptcySummary.finalDate',
        sortable: true,
        cellRenderer: (data: any): string => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'BK Abandoned',
        field: 'disbursementGroupSummary.bankruptcyAbandoned',
        colId: 'disbursementGroupSummary.productDetailsBankruptcySummary.abandoned',
        sortable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => this.yesNoPipe.transform(data.value),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'BK CS Needed',
        field: 'disbursementGroupSummary.bankruptcyClosingStatementNeeded',
        colId: 'disbursementGroupSummary.productDetailsBankruptcySummary.closingStatementNeeded',
        sortable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => this.yesNoPipe.transform(data.value),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'BK Ready to pay Trustee',
        field: 'disbursementGroupSummary.bankruptcyReadyToPayTrustee',
        colId: 'disbursementGroupSummary.productDetailsBankruptcySummary.readyToPayTrustee',
        sortable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => this.yesNoPipe.transform(data.value),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'BK Trustee Amt',
        field: 'disbursementGroupSummary.bankruptcyAmountToTrustee',
        colId: 'disbursementGroupSummary.productDetailsBankruptcySummary.amountToTrustee',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'BK Attorney Amt',
        field: 'disbursementGroupSummary.bankruptcyAmountToAttorney',
        colId: 'disbursementGroupSummary.productDetailsBankruptcySummary.amountToAttorney',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'BK Claimant Amt',
        field: 'disbursementGroupSummary.bankruptcyAmountToClaimant',
        colId: 'disbursementGroupSummary.productDetailsBankruptcySummary.amountToClaimant',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: this.renderAmount.bind(this),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Probate Status',
        field: 'disbursementGroupSummary.probate',
        sortable: true,
        cellRenderer: 'statusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 120,
        minWidth: 120,
      },
      {
        headerName: 'Probate Stage',
        field: 'disbursementGroupSummary.probateStage',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        width: 250,
      },
      {
        headerName: 'Release Status',
        field: 'disbursementGroupSummary.release',
        sortable: true,
        cellRenderer: 'statusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 110,
        minWidth: 110,
      },
      {
        headerName: 'Release Stage',
        field: 'disbursementGroupSummary.releaseStage',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        width: 250,
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
      AGGridHelper.getActionsColumn({ goToClaimantSummaryHandler: this.goToClaimantSummary.bind(this) }),

    ],
    components: {
      statusRenderer: StatusRendererComponent,
      buttonRenderer: ClaimantSummaryButtonsRendererComponent,
      netPaidInFullRenderer: NetPaidInFullRendererComponent,
      onHoverPlacerHolderRenderer: OnHoverPlaceholderRendererComponent,
    },
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public readonly gridId: GridId = GridId.ClaimantSummaryRollupList;

  private readonly exportOrder: string[] = [
    'Client ID',
    'Attorney Ref ID',
    'ARCHER ID',
    'First Name',
    'Last Name',
    'Primary Firm',
    'Status',
    'Ledger Count',
    'Net Paid in Full',
    'Expected Allocation',
    'Assigned Disbursements',
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
    'Lien Status',
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
    'BK Scrub Status',
    'BK Scrub Last Date',
    'BK Scrub Product Code',
    'BK Scrub Match Code',
    'BK Scrub Removal Date',
  ];

  public searchFields: SearchField[] = [
    SearchField.stringIdentifier('externalIdentifiers.identifier', 'Identifier'),
    SearchField.numberIdentifier('id', 'Client ID', VS.onlyNumbersValidator, SC.Equals, [SC.Contains, SC.StartsWith, SC.EndsWith, SC.NotContains]),
    SearchField.number('archerId', 'ARCHER ID', ValidationService.onlyNumbersValidator, [SC.IsMissing]),
    SearchField.text('firstName', 'First Name', null, null, [SC.IsMissing]),
    SearchField.text('lastName', 'Last Name', null, null, [SC.IsMissing]),
    SearchField.stringIdentifier('cleanAttorneyReferenceId', 'Attorney Ref ID', SC.Contains, null, null, StringHelper.stripDashes),
    SearchField.text('org.name', 'Primary Firm'),
    SearchField.data('statusId', 'Claimant Status', 'id', 'name', null, [SC.IsMissing, SC.Contains], null, this.statuses$),
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
    SearchField.number('disbursementGroupSummary.balance', 'Balance', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.number('disbursementGroupSummary.net', 'Net', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.none('holdbacks', 'Holdbacks', null, [
      SearchField.number(HB.Amount, 'Amount', VS.onlyCurrencyValidator, [SC.IsMissing]),
      SearchField.data(HB.HoldbackAccount, 'Accounts', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, ObservableOptionsHelper.getHoldbackOptionsForRollback()),
    ], true),
    SearchField.none('unpaidLedgerEntries', 'Unpaid Ledger Entries', null, [
      SearchField.number(UL.Amount, 'Amount', VS.onlyCurrencyValidator, [SC.IsMissing]),
      SearchField.data(UL.AccountGroups, 'Account Groups', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, ObservableOptionsHelper.getUnpaidLedgerEntriesOptionsForRollback()),
    ], true),
    SearchField.number('disbursementGroupSummary.availableDisbursements', 'Unpaid Net', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.number('disbursementGroupSummary.cashBalance', 'Cash Balance', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.number('disbursementGroupSummary.ledgerCount', 'Ledger Count', VS.onlyNumbersValidator, [SC.IsMissing]),
    SearchField.data('disbursementGroupSummary.netPaidInFull', 'Net Paid in Full', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains], null, ObservableOptionsHelper.getYesNoOptions()),
    // specialized filters
    SearchField.none('defenseApproval', 'Defense approval', SG.Specialized),
    SearchField.none('additionalAllocationMoney', 'Additional allocation money', SG.Specialized),

    SearchField.date('disbursementGroupSummary.productDetailsBankruptcySummary.finalDate', 'BK Final Date', null, [SC.IsMissing]),
    SearchField.boolean('disbursementGroupSummary.productDetailsBankruptcySummary.abandoned', 'BK Abandoned'),
    SearchField.boolean('disbursementGroupSummary.productDetailsBankruptcySummary.closingStatementNeeded', 'BK CS Needed'),
    SearchField.boolean('disbursementGroupSummary.productDetailsBankruptcySummary.readyToPayTrustee', 'BK Ready to pay Trustee'),
    SearchField.number('disbursementGroupSummary.productDetailsBankruptcySummary.amountToTrustee', 'BK Trustee Amt', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.number('disbursementGroupSummary.productDetailsBankruptcySummary.amountToAttorney', 'BK Attorney Amt', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.number('disbursementGroupSummary.productDetailsBankruptcySummary.amountToClaimant', 'BK Claimant Amt', VS.onlyCurrencyValidator, [SC.IsMissing]),

    SearchField.in('bKScrubStatus.id', 'BK Scrub Status', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, this.bKStatusOptions),
    SearchField.date('bKScrubLastDate', 'BK Scrub Last Date', null, [SC.IsMissing]),
    SearchField.in('bKScrubProductCode', 'BK Scrub Product Code', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, this.bKScrubProductCodeOptions),
    SearchField.text('bKScrubMatchCode', 'BK Scrub Match Code', null, null, [SC.IsMissing, SC.StartsWith, SC.EndsWith]),
    SearchField.date('bKScrubRemovalDate', 'BK Scrub Removal Date', null, [SC.IsMissing]),
  ];

  constructor(
    public readonly store: Store<fromShared.AppState>,
    public readonly router: Router,
    public readonly modalService: ModalService,
    public readonly elementRef: ElementRef,
    public readonly messageService: MessageService,
    public readonly route: ActivatedRoute,
    public readonly permissionService: PermissionService,
    private readonly yesNoPipe: YesNoPipe,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly actionsSubj: ActionsSubject,
    private readonly datePipe: DateFormatPipe,
  ) {
    super(store, modalService, messageService, route, elementRef, router, permissionService);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(GetSavedSearchListByEntityType({ entityType: EntityTypeEnum.ProjectClaimantSummaryRollup }));
    this.actionBar$
      .pipe(first())
      .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));
    this.subscribeCurrentProject();
    this.initExportSubscriptions();
    this.gridLocalData$ = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));
    this.subscribeToData();
    this.subscribeToSavedSearch();
    this.authStore$.pipe(
      filter((user: UserInfo) => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((user: UserInfo) => {
      this.orgId = user.selectedOrganization.id;
    });
  }

  private subscribeToSavedSearch(): void {
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
  }

  public goToClaimantSummary({ data }): void {
    if (data.id) {
      const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
      this.store.dispatch(
        CreatePager({
          relatedPage: RelatedPage.ClaimantsFromClaimantSummaryRollup,
          settings: navSettings,
          pager: { payload: { projectId: this.projectId } as claimantActions.IClaimantSummaryPagerPayload },
        }),
      );

      const claimantDetailsRequest: ClaimantDetailsRequest = { gridParamsRequest: this.gridParams.request };
      this.store.dispatch(claimantActions.SetClaimantDetailsRequest({ claimantDetailsRequest }));
      this.store.dispatch(claimantActions.GoToClaimantLedgerSummary({ claimantId: data.id }));
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    agGridParams = this.mergeSearchFilters(agGridParams);
    this.gridParams = agGridParams;
    this.store.dispatch(actions.GetClaimantsSummaryRollupGrid({ projectId: this.projectId, agGridParams }));
  }

  protected saveAdvancedSearch(): void {
    if (!this.isSearchSaved) {
      this.store.dispatch(actions.SaveSearchParams({ items: this.searchState }));
    }
  }

  protected onRowDoubleClicked(param): void {
    this.goToClaimantSummary(param);
  }

  private getActionBar(actionBar: ActionHandlersMap): ActionHandlersMap {
    return {
      ...this.savedSearchActionBar,
      ...actionBar,
      advancedSearch: this.advancedSearchAction(),
      basicSearch: this.basicSearchAction(),
      clearFilter: {
        callback: (): void => {
          this.store.dispatch(ClearSelectedRecordsState({ gridId: GridId.ClaimantSummaryRollupList }));
          this.clearFilters();
        },
        disabled: () => !this.canClearFilters(),
      },
      download: {
        disabled: () => this.isExporting || (SearchState.hasErrors(this.searchState) && this.showAdvancedSearch),
        options: [
          { name: 'Standard', callback: () => this.exportClientsList(this.getAllColumnDefs()) },
        ],
      },
      deleteSearch: {
        callback: () => this.deleteSearch(this.currentSearch?.id),
        disabled: () => !this.currentSearch?.id,
        hidden: () => !this.isOnSavedSearch,
      },
      exporting: { hidden: () => !this.isExporting },
    };
  }

  private getAllColumnDefs(): any {
    return this.additionalColDefs
      ? this.gridOptions.columnDefs.filter((col: ColDef | ColGroupDef) => !this.additionalColDefs.find((addCol: ColDef) => 'field' in col && addCol.field === col.field))
        .concat(this.additionalColDefs)
      : [].concat(this.gridOptions.columnDefs);
  }

  private exportClientsList(columns: ColDef[]): void {
    const columnsParam = columns.map((item: ColDef) => {
      const container: ColumnExport = {
        name: item.headerName,
        field: this.exportFieldValueColumns.has(item.colId) ? item.field : (item.colId || item.field),
      };

      if (item.headerName === 'Status') {
        container.field = item.field; // cause we need status.name for export
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
      this.enumToArray.transform(ExportLoadingStatus).map((i: {
        id: number;
        name: string;
      }) => i.name),
      this.exportClientsListCallback.bind(this),
      () => (this.store.dispatch(actions.DownloadClaimantsSummaryRollup({
        id: this.projectId,
        searchOptions: this.getClaimantSummaryRollupExportParams(),
        columns: columnsParam,
        channelName,
      }))),
    );
  }

  protected getClaimantSummaryRollupExportParams(): ISearchOptions {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.gridLocalData, this.claimantSummaryRollupGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    return searchOptions;
  }

  private exportClientsListCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.actionBar$.pipe(first())
      .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(actions.DownloadClaimantsSummaryRollupDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(actions.Error({ error: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  private initExportSubscriptions(): void {
    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => { this.isExporting = result; });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.DownloadClaimantsSummaryRollupComplete),
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
      this.actionBar$.pipe(first())
        .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));
    });
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
      });
  }

  private subscribeToData(): void {
    this.gridLocalData$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((data: IGridLocalData) => {
        this.gridLocalData = data;
      });

    this.store.select(gridParams)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((params: IServerSideGetRowsParamsExtended) => {
        this.claimantSummaryRollupGridParams = params;
      });
  }

  private moneyFormatter(data: any): string {
    return !isNil(data?.value) ? CurrencyHelper.toUsdFormat(data) : '';
  }

  private renderAmount(data: any): string {
    if (isNil(data?.value)) {
      return '';
    }
    return data.value < 0 ? `(${formatCurrency(Math.abs(data.value), 'en-US', '$')})` : `${this.moneyFormatter(data)}`;
  }

  protected toggleAdvancedSearch(): void {
    super.toggleAdvancedSearch();
    this.store.dispatch(actions.SaveAdvancedSearchVisibility({ isVisible: this.showAdvancedSearch }));
  }

  public setAdvancedSearchVisible(isVisible: boolean): void {
    this.store.dispatch(actions.SaveAdvancedSearchVisibility({ isVisible }));
    this.showAdvancedSearch = isVisible;
  }

  public ngOnDestroy(): void {
    this.switchIsEditStateTo(false);
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    this.store.dispatch(ClearSelectedRecordsState({ gridId: GridId.ClaimantSummaryRollupList }));
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
}
