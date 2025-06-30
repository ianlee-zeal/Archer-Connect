import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AppState } from '@app/modules/projects/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AddressPipe, DateFormatPipe } from '@app/modules/shared/_pipes';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers';
import { CurrencyHelper, PercentageHelper } from '@app/helpers';
import { ClaimSettlementLedgerEntry } from '@app/models/claim-settlement-ledger-entry';
import { Address } from '@app/models/address';
import * as actions from '../../../state/actions';
import * as selectors from '../../../state/selectors';

@Component({
  selector: 'app-payment-tracking-list',
  templateUrl: './payment-tracking-list.component.html',
  styleUrls: ['./payment-tracking-list.component.scss'],
})
export class PaymentTrackingListComponent extends ListView {
  public readonly gridId = GridId.PaymentTracking;

  public readonly paymentTrackingTotalCount$ = this.store.select(selectors.paymentTrackingTotalCount);

  public enabledAutoHeight: boolean = false;
  public skipSetContentHeight: boolean = true;
  public isContentAutoHeight: boolean = true;

  @Input() ledgerEntryId: number;

  @Output()
  readonly closeModal = new EventEmitter<string[]>();

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    defaultColDef: {
      floatingFilter: true,
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Payment ID',
        field: 'paymentId',
        colId: 'id',
        ...AGGridHelper.nameColumnDefaultParams,
        width: 110,
        minWidth: 110,
        sort: 'desc',
      },
      {
        headerName: 'Disbursement Type',
        field: 'disbursementType',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Payee',
        field: 'payee',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Method',
        field: 'method',
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 150,
      },
      {
        headerName: 'Ref Number',
        field: 'referenceNumber',
        ...AGGridHelper.nameColumnDefaultParams,
        cellRendererSelector: () => AGGridHelper.getLinkActionRenderer({
          onAction: this.goToPaymentDetails.bind(this),
          showLink: this.onShowLink.bind(this),
        }),
        width: 110,
        minWidth: 110,
      },
      {
        headerName: 'Amount',
        field: 'totalAmount',
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.amountColumnDefaultParams,
        width: 110,
        minWidth: 110,
      },
      {
        headerName: 'Sent On',
        field: 'dateSent',
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'status',
        ...AGGridHelper.nameColumnDefaultParams,
        width: 110,
        minWidth: 110,
      },
      {
        headerName: 'Cleared On',
        field: 'clearedDate',
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'Tracking Number',
        field: 'trackingNumber',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Address',
        cellRenderer: (params: ICellRendererParams): string => {
          const data = params.data as ClaimSettlementLedgerEntry;
          const address = new Address();
          address.line1 = data.payeeAddress1;
          address.line2 = data.payeeAddress2;
          return this.addressPipe.transform(address);
        },
        ...AGGridHelper.addressColumnDefaultParams,
      },
      {
        headerName: 'City',
        field: 'payeeAddressCity',
        ...AGGridHelper.cityColumnDefaultParams,
      },
      {
        headerName: 'State',
        field: 'payeeAddressState',
        ...AGGridHelper.stateColumnDefaultParams,
      },
      {
        headerName: 'Zip',
        field: 'payeeAddressZip',
        ...AGGridHelper.zipColumnDefaultParams,
      },
      {
        headerName: 'Stop Payment Reason',
        field: 'stopPaymentReason',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Type',
        field: 'type',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Spi Percentage',
        field: 'spiPercentage',
        cellRenderer: data => PercentageHelper.toFractionPercentage(data.value * 100, 8),
        ...AGGridHelper.amountColumnDefaultParams,
      },
    ],
    pagination: false,
    alwaysShowHorizontalScroll: true,
    components: {
      linkActionRenderer: LinkActionRendererComponent,
    },
  };

  constructor(
    private readonly store: Store<AppState>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    private datePipe: DateFormatPipe,
    private readonly addressPipe: AddressPipe,
  ) {
    super(router, elementRef);
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    this.gridParams.request.endRow = -1;
    this.gridParams.request.startRow = 0;
    this.store.dispatch(actions.GetPaymentsByLedgerEntryId({ gridParams: this.gridParams, ledgerEntryId: this.ledgerEntryId }));
  }

  public onShowLink(): boolean {
    return true;
  }

  public goToPaymentDetails({ data }): void {
    this.closeModal.emit();
    const url = this.router.url.split('ledger-summary')[0];
    this.router.navigate([`${url}history/${data.paymentId}/tabs/details`]);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
