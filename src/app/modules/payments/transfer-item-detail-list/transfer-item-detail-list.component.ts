import { Component, ElementRef, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
import { filter, takeUntil } from 'rxjs/operators';

import { Payment, TransferItemDetail } from '@app/models';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AppState, sharedActions, sharedSelectors } from '@app/modules/shared/state';
import { SearchField } from '@app/models/advanced-search/search-field';

import * as paymentActions from '@app/modules/payments/state/actions';
import * as selectors from '@app/modules/payments/state/selectors';
import { EntityTypeEnum } from '@app/models/enums';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { CurrencyHelper } from '@app/helpers';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { SelectHelper } from '@app/helpers/select.helper';
import { ArrayHelper } from '@app/helpers/array.helper';
import * as claimantActions from '@app/modules/claimants/claimant-details/state/actions';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-transfer-item-detail-list',
  templateUrl: './transfer-item-detail-list.component.html',
  styleUrls: ['./transfer-item-detail-list.component.scss'],
})
export class TransferItemDetailListComponent extends ListView implements OnInit {
  readonly gridId: GridId = GridId.TransferItemDetailList;
  public transfer: Payment;
  public entityType: EntityTypeEnum = EntityTypeEnum.TransferItem;
  private ledgerAccounts: SelectOption[] = [];
  private ledgerAccountGroups: SelectOption[] = [];
  private stages: SelectOption[] = [];
  private statuses: SelectOption[] = [];

  public readonly transfer$ = this.store.select(selectors.item);
  public readonly advancedSearch$ = this.store.select(selectors.advancedSearch);
  private readonly ledgerAccounts$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.ledgerAccounts);
  private readonly ledgerAccountGroups$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.ledgerAccountGroups);
  private readonly stages$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.stages);
  private readonly statuses$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.statuses);

  constructor(
    private readonly store: Store<AppState>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Client ID',
        headerTooltip: 'Client ID',
        field: 'clientId',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Client',
        headerTooltip: 'Client',
        field: 'client',
        width: 180,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Disbursement Group Id',
        headerTooltip: 'Disbursement Group Id',
        field: 'disbursementGroupId',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Disbursement Group',
        headerTooltip: 'Disbursement Group',
        field: 'disbursementGroup',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Stage',
        headerTooltip: 'Stage',
        field: 'stage',
        colId: 'stageId',
        width: 140,
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.stages }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Amount',
        headerTooltip: 'Amount',
        field: 'amount',
        sortable: true,
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
      {
        headerName: 'Payee Entity Id',
        headerTooltip: 'Payee Entity Id',
        field: 'payeeEntityId',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Payee Entity Type',
        headerTooltip: 'Payee Entity Type',
        field: 'payeeEntityType',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Account No',
        headerTooltip: 'Account No',
        field: 'accountNo',
        width: 100,
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.ledgerAccounts }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Account Group No',
        headerTooltip: 'Account Group No',
        field: 'accountGroupNo',
        width: 100,
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.ledgerAccountGroups }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Display Name',
        headerTooltip: 'Display Name',
        field: 'displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Source Entity Type',
        headerTooltip: 'Source Entity Type',
        field: 'sourceEntityType',
        width: 180,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Payment Item Status',
        headerTooltip: 'Payment Item Status',
        field: 'paymentItemStatus',
        colId: 'paymentItemStatusId',
        width: 140,
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.statuses }, 'agTextColumnFilter'),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
  }

  public searchFields: SearchField[] = [];

  public ngOnInit(): void {
    super.ngOnInit();
    this.subscribeToTransfer();
    this.subscribeToLedgerAccountGroups();
    this.subscribeToLedgerAccounts();
    this.subscribeToStages();
    this.subscribeToStatuses();
    this.store.dispatch(sharedActions.dropDownsValuesActions.GetLedgerAccounts(null));
    this.store.dispatch(sharedActions.dropDownsValuesActions.GetLedgerAccountGroups(null));
    this.store.dispatch(sharedActions.dropDownsValuesActions.GetStages({ entityTypeId: EntityTypeEnum.ClaimSettlementLedgers }));
    this.store.dispatch(sharedActions.dropDownsValuesActions.GetStatuses({ entityTypeId: EntityTypeEnum.PaymentItemStatus }));
  }

  private subscribeToTransfer() {
    this.transfer$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(data => !!data),
    ).subscribe(data => {
      this.transfer = data;
    });
  }

  protected fetchData(gridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = gridParams;
    if (this.transfer) {
      this.store.dispatch(paymentActions.GetTransferItemDetails({ params: gridParams, transferId: +this.transfer.id }));
    } else {
      this.transfer$.pipe(
        takeUntil(this.ngUnsubscribe$),
        filter(data => !!data),
      ).subscribe(data => {
        this.store.dispatch(paymentActions.GetTransferItemDetails({ params: gridParams, transferId: +data.id }));
      });
    }
  }

  public onRowDoubleClicked(params): void {
    const transferItemDetail = params.data as TransferItemDetail;
    if (transferItemDetail.clientId && transferItemDetail.claimSettlementLedgerId) {
      const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
      this.store.dispatch(
        CreatePager({
          relatedPage: RelatedPage.TransferItemsDetails,
          settings: navSettings,
          pager: { payload: { paymentId: transferItemDetail.paymentId } as claimantActions.IClaimantSummaryPagerPayload },
        }),
      );

      const claimantDetailsRequest: ClaimantDetailsRequest = { gridParamsRequest: this.gridParams.request };
      this.store.dispatch(claimantActions.SetClaimantDetailsRequest({ claimantDetailsRequest }));
      this.store.dispatch(claimantActions.GotoLedgerDetails({ claimantId: transferItemDetail.clientId, ledgerId: transferItemDetail.claimSettlementLedgerId }));
    } else if (transferItemDetail.clientId) {
      const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
      this.store.dispatch(
        CreatePager({
          relatedPage: RelatedPage.TransferItemsDetails,
          settings: navSettings,
          pager: { payload: { paymentId: transferItemDetail.paymentId } as claimantActions.IClaimantSummaryPagerPayload },
        }),
      );

      const claimantDetailsRequest: ClaimantDetailsRequest = { gridParamsRequest: this.gridParams.request };
      this.store.dispatch(claimantActions.SetClaimantDetailsRequest({ claimantDetailsRequest }));
      this.store.dispatch(claimantActions.GoToClaimantLedgerSummary({ claimantId: transferItemDetail.clientId }));
    }
  }

  private subscribeToLedgerAccounts(): void {
    this.ledgerAccounts$.pipe(
      filter(account => !!account),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(items => {
      const opts = SelectHelper.toOptions(
        items,
        opt => opt.accountNo,
        opt => `(${opt.accountNo}) ${opt.accountName}`,
      );
      if (this.ledgerAccounts.length) {
        ArrayHelper.empty(this.ledgerAccounts);
      }
      this.ledgerAccounts.push(...opts);
    });
  }

  private subscribeToLedgerAccountGroups(): void {
    this.ledgerAccountGroups$.pipe(
      filter(accountGroup => !!accountGroup),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(items => {
      const opts = SelectHelper.toOptions(
        items,
        opt => opt.accountGroupNo,
        opt => `(${opt.accountGroupNo}) ${opt.accountGroupName}`,
      );
      if (this.ledgerAccountGroups.length) {
        ArrayHelper.empty(this.ledgerAccountGroups);
      }
      this.ledgerAccountGroups.push(...opts);
    });
  }

  private subscribeToStages(): void {
    this.stages$.pipe(
      filter(stg => !!stg),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(items => {
      const opts = SelectHelper.toOptions(
        items,
        opt => opt.id,
        opt => opt.name,
      );
      if (this.stages.length) {
        ArrayHelper.empty(this.stages);
      }
      this.stages.push(...opts);
    });
  }

  private subscribeToStatuses(): void {
    this.statuses$.pipe(
      filter(stat => !!stat),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(items => {
      const opts = SelectHelper.toOptions(
        items,
        opt => opt.id,
        opt => opt.name,
      );
      if (this.statuses.length) {
        ArrayHelper.empty(this.statuses);
      }
      this.statuses.push(...opts);
    });
  }
}
