import { Component, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import * as fromAuth from '@app/modules/auth/state';
import { GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { Address, Payment, UserInfo } from '@app/models';
import { GridId } from '@app/models/enums/grid-id.enum';
import { AGGridHelper, CurrencyHelper } from '@app/helpers';
import { DateFormatPipe, AddressPipe, TrackingLinkPipe } from '@app/modules/shared/_pipes';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ClaimantOverviewPaymentItem } from '@app/models/claimant-overview/claimant-overview-payment-item';
import { Pager, RelatedPage } from '@app/modules/shared/grid-pager';
import * as paymentsActions from '@app/modules/payments/state/actions';
import { EntityTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { commonSelectors } from '@shared/state/common.selectors';
import { Claimant } from '@app/models/claimant';
import { ClaimantDetailsState } from '../../../state/reducer';
import * as selectors from '../../../state/selectors';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-claimant-overview-payments-renderer',
  templateUrl: './claimant-overview-payments-renderer.component.html',
  styleUrls: ['../claimant-overview-product-renderer.component.scss'],
})
export class ClaimantOverviewPaymentsRendererComponent {
  @Input('paymentItems') public paymentItems$: Observable<ClaimantOverviewPaymentItem[]>;
  private readonly pager$ = this.store.select(commonSelectors.pager);
  private client$ = this.store.select(selectors.item);

  public readonly gridId: GridId = GridId.Payments;
  protected gridApi: GridApi;
  private clientId: number;

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
    },
    columnDefs: [
      {
        headerName: 'Payment ID',
        field: 'id',
        width: 100,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Disbursement Type',
        field: 'disbursementType',
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 310,
        width: 310,
      },
      {
        headerName: 'Payee',
        field: 'payeeName',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Method',
        field: 'paymentMethod.name',
        width: 140,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Ref No',
        field: 'referenceNumber',
        width: 150,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Total Pmt Amount',
        field: 'amount',
        cellRenderer: (data: ICellRendererParams): string => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Pmt Item Amount',
        field: 'itemAmount',
        cellRenderer: (data: ICellRendererParams): string => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Date Created',
        field: 'dateSubmitted',
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value, false, null, this.timezone, true),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'Tracking No',
        field: 'trackingNumber',
        ...AGGridHelper.nameColumnDefaultParams,
        cellRenderer: (params: ICellRendererParams): string => {
          return this.trackingPipe.transform(params.data?.postageCode?.providerCode, params.data?.trackingNumber);
        },
      },
      {
        headerName: 'Address',
        cellRenderer: (params: ICellRendererParams): string => {
          const data = params.data as Payment;
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
        headerName: 'Disbursement Group',
        field: 'disbursementGroupName',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Stop Payment Reason',
        field: 'stopPaymentRequest.resendReason.name',
        ...AGGridHelper.nameColumnDefaultParams,
        width: 160,
        minWidth: 160,
      },
    ],
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),

  };

  constructor(
    private store: Store<ClaimantDetailsState>,
    protected router: Router,
    private datePipe: DateFormatPipe,
    private trackingPipe: TrackingLinkPipe,
    private readonly addressPipe: AddressPipe,
    protected elementRef: ElementRef,
    protected permissionService: PermissionService,
  ) {}

  public ngOnInit(): void {
    this.authStore$.pipe(
      filter((user: UserInfo) => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((user: UserInfo) => {
      this.timezone = user.timezone && user.timezone.name;
    });

    this.client$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter((client: Claimant) => !!client),
    ).subscribe((client: Claimant) => {
      this.clientId = client.id;
    });
  }

  public gridReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
  }

  protected onRowDoubleClicked({ data: row }): void {
    if (!this.permissionService.canRead(PermissionTypeEnum.Payments)) {
      return;
    }

    const navSettings = AGGridHelper.getNavSettings(this.gridApi);

    if (row) {
      const relatedPage: RelatedPage = RelatedPage.PaymentsFromClaimantOverview;
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
        entityId: this.clientId,
        entityType: EntityTypeEnum.Clients,
        parentPage,
      };

      this.store.dispatch(paymentsActions.GoToPaymentsDetails({ payload }));
      this.store.dispatch(commonActions.CreatePager({
        relatedPage,
        settings: navSettings,
        pager: { payload },
      }));
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
