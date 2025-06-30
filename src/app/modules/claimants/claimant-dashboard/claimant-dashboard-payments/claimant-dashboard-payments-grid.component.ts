import { Component, Input } from '@angular/core';
import { AGGridHelper, CurrencyHelper } from '@app/helpers';
import { Address, Payment, UserInfo } from '@app/models';
import { ClaimantOverviewPaymentItem } from '@app/models/claimant-overview/claimant-overview-payment-item';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromAuth from '@app/modules/auth/state';
import { AddressPipe, DateFormatPipe, TrackingLinkPipe } from '@app/modules/shared/_pipes';
import { Store } from '@ngrx/store';
import { GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ClaimantDetailsState } from '../../claimant-details/state/reducer';

@Component({
  selector: 'app-claimant-dashboard-payments-grid',
  templateUrl: './claimant-dashboard-payments-grid.component.html',
  styleUrls: [],
})
export class ClaimantDashboardPaymentsGridComponent {
   @Input('paymentItems') public paymentItems$: Observable<ClaimantOverviewPaymentItem[]>;

    public readonly gridId: GridId = GridId.ClaimantDashboardPayments;
    protected gridApi: GridApi;

    private timezone: string;
    public authStore$ = this.store.select(fromAuth.authSelectors.getUser);
    protected ngUnsubscribe$ = new Subject<void>();

    public readonly gridOptions: GridOptions = {
      ...AGGridHelper.defaultGridOptions,
      defaultColDef: {
        resizable: true,
        autoHeight: true,
        wrapText: true,
        floatingFilter: false,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
      columnDefs: [
        {
          headerName: 'Disbursement Type',
          field: 'disbursementType',
          ...AGGridHelper.nameColumnDefaultParams,
          minWidth: 250,
          width: 250,
        },
        {
          headerName: 'Payee',
          field: 'payeeName',
          ...AGGridHelper.nameColumnDefaultParams,
        },
        {
          headerName: 'Address',
          cellRenderer: (params: ICellRendererParams): string => {
            const data = params.data as Payment;
            const address = new Address();
            address.line1 = data.payeeAddress1;
            address.line2 = data.payeeAddress2;
            address.city = data.payeeAddressCity;
            address.state = data.payeeAddressState;
            address.zip = data.payeeAddressZip;
            return this.addressPipe.transform(address);
          },
          ...AGGridHelper.addressColumnDefaultParams,
        },
        {
          headerName: 'Pmt Item Amount',
          field: 'itemAmount',
          cellRenderer: (data: ICellRendererParams): string => CurrencyHelper.toUsdFormat(data),
          ...AGGridHelper.amountColumnDefaultParams,
          maxWidth: 150,
          width: 150,
          headerClass: 'ag-header-cell-aligned-left',
        },
        {
          headerName: 'Pmt Method',
          field: 'paymentMethod.name',
          ...AGGridHelper.fixedColumnDefaultParams,
          minWidth: 140,
          width: 140,
        },
        {
          headerName: 'Date Created',
          field: 'dateSubmitted',
          cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value, false, null, this.timezone, true),
          ...AGGridHelper.dateColumnDefaultParams,
          sort: 'desc',
        },
        {
          headerName: 'Tracking No',
          field: 'trackingNumber',
          ...AGGridHelper.nameColumnDefaultParams,
          cellRenderer: (params: ICellRendererParams): string => {
            return this.trackingPipe.transform(params.data?.postageCode?.providerCode, params.data?.trackingNumber);
          },
        },
      ],
      rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    };

    constructor(
      private store: Store<ClaimantDetailsState>,
      private datePipe: DateFormatPipe,
      private trackingPipe: TrackingLinkPipe,
      private readonly addressPipe: AddressPipe,
    ) {}

    public ngOnInit(): void {
      this.authStore$.pipe(
        filter((user: UserInfo) => !!user),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((user: UserInfo) => {
        this.timezone = user.timezone && user.timezone.name;
      });
    }

    public gridReady(gridApi: GridApi): void {
      this.gridApi = gridApi;
    }

    public ngOnDestroy(): void {
      this.ngUnsubscribe$.next();
      this.ngUnsubscribe$.complete();
    }
  }
