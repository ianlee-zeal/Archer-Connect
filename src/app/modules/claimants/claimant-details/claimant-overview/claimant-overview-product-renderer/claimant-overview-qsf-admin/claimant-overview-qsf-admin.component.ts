import { Component, Input, OnDestroy } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromAuth from '@app/modules/auth/state';
import { CellClassParams, CellRendererSelectorResult, GridApi, GridOptions, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import { filter, first, takeUntil } from 'rxjs/operators';
import { AGGridHelper, IconHelper } from '@app/helpers';
import { GridId } from '@app/models/enums/grid-id.enum';
import { Observable, Subject } from 'rxjs';
import { FirmPaidStatus, PermissionTypeEnum } from '@app/models/enums';
import { DateFormatPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { TextWithIconRendererComponent } from '@app/modules/shared/_renderers/text-with-icon-renderer/text-with-icon-renderer.component';
import { QSFAdminItem } from '@app/models/claimant-overview/claimant-overview-qsf-admin-item';
import { QSFAdmin } from '@app/models/claimant-overview/claimant-overview-qsf-admin';
import { NegativeAmountRendererComponent } from '@app/modules/shared/_renderers/negative-amount-renderer/negative-amount-renderer.component';
import { UserInfo } from '@app/models';
import { Pager, RelatedPage } from '@app/modules/shared/grid-pager';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { commonSelectors } from '@shared/state/common.selectors';
import { ClaimantDetailsState } from '../../../state/reducer';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-claimant-overview-qsf-admin',
  templateUrl: './claimant-overview-qsf-admin.component.html',
  styleUrls: ['../claimant-overview-product-renderer.component.scss'],
})
export class ClaimantOverviewQSFAdminComponent implements OnDestroy {
  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);
  private claimantId: number;
  private readonly pager$ = this.store.select(commonSelectors.pager);
  private gridApi: GridApi;

  @Input('qsfData') public qsfData$: Observable<QSFAdmin>;
  @Input('items') public items$: Observable<QSFAdminItem[]>;

  public readonly gridId: GridId = GridId.ClaimantOverviewQsfAdminGrid;
  private timezone: string;
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
        headerName: 'Disbursement Group Name',
        field: 'disbursementGroupName',
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 220,
        width: 220,
      },
      {
        headerName: 'Ledger Stage',
        field: 'ledgerStage',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Claimant Payment',
        field: 'claimantPayment.id',
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => (
          AGGridHelper.getTextBoxWithIconRenderer({
            text: params.data?.claimantPayment?.name || '',
            icon: IconHelper.getClaimantPaymentIcon(params.data?.claimantPayment?.id),
          })
        ),
        minWidth: 140,
      },
      {
        headerName: 'Firm Paid',
        field: 'firmPaid',
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => (
          AGGridHelper.getTextBoxWithIconRenderer({
            text: this.getFirmPaidTitle(params.value),
            icon: IconHelper.getFirmPaidIcon(params.value),
          })
        ),
        width: 130,
        minWidth: 130,
      },
      {
        headerName: 'Disbursement Amount',
        field: 'disbursementAmount',
        cellRenderer: 'negativeAmountRenderer',
        ...AGGridHelper.amountColumnDefaultParams,
        minWidth: 150,
        maxWidth: 150,
      },
      {
        headerName: 'Payee',
        field: 'payee',
        ...AGGridHelper.nameColumnDefaultParams,

      },
      {
        headerName: 'DW Sent to Firm',
        field: 'dwSentToFirmDate',
        valueGetter: (params: ValueGetterParams): string => this.datePipe.transform(params.data.dwSentToFirmDate, false, null, this.timezone, true),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'DW Approved',
        field: 'dwApprovedDate',
        valueGetter: (params: ValueGetterParams): string => this.datePipe.transform(params.data.dwApprovedDate, false, null, this.timezone, true),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'CS Published',
        cellRenderer: (params: ICellRendererParams): string => this.datePipe.transform(params.data.csSentDate, false, null, this.timezone, true),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'CS Sent Date',
        cellRenderer: (params: ICellRendererParams): string => {
          if (params.data.isCSSentStage) {
            return this.datePipe.transform(params.data.csSentDate, false, null, this.timezone, true);
          }
          return '';
        },
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'EF Rec',
        field: 'efRecDate',
        valueGetter: (params: ValueGetterParams): string => this.datePipe.transform(params.data.efRecDate, false, null, this.timezone, true),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'Hold/Reason',
        field: 'holdReason',
        width: 100,
        minWidth: 100,
      },
      {
        headerName: 'Paid with HB',
        field: 'paidWithHB',
        valueGetter: (params: ValueGetterParams): string => this.yesNoPipe.transform(params.data.paidWithHB),
        width: 100,
        minWidth: 100,
      },
      {
        headerName: 'Holdback Amount',
        field: 'holdbackAmount',
        cellRenderer: 'negativeAmountRenderer',
        ...AGGridHelper.amountColumnDefaultParams,
        cellClass: (params: CellClassParams): string => (params.data as QSFAdminItem).holdbackAmount < 0 && 'ag-cell-red',
      },
    ],
    components: {
      textWithIconRenderer: TextWithIconRendererComponent,
      negativeAmountRenderer: NegativeAmountRendererComponent,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    private store: Store<ClaimantDetailsState>,
    private readonly datePipe: DateFormatPipe,
    private readonly yesNoPipe: YesNoPipe,
    protected readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly permissionService: PermissionService
  ) {

  }

  public ngOnInit(): void {
    this.authStore$.pipe(
      filter((user: UserInfo) => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((user: UserInfo) => {
      this.timezone = user.timezone && user.timezone.name;
    });

    this.route.parent.parent.parent.params.subscribe((params: Params) => {
      this.claimantId = params.id;
    });
  }

  getFirmPaidTitle(status: string): string {
    if (!status) {
      return '';
    }
    switch (status) {
      case FirmPaidStatus.Yes:
        return 'Paid';
      case FirmPaidStatus.No:
        return 'Pending';
      default:
        return 'N/A';
    }
  }

  onGridReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
  }

  protected onRowDoubleClicked({ data: row }): void {
    if (!this.permissionService.canEdit(PermissionTypeEnum.ClaimSettlementLedgers)) {
      return;
    }

    if (!row || !this.claimantId) {
      return;
    }

    const navSettings = AGGridHelper.getNavSettings(this.gridApi);
    const relatedPage: RelatedPage = RelatedPage.LedgerSummaryFromClaimantOverview;
    let parentPage: RelatedPage;
    this.pager$.pipe(
      first(),
    ).subscribe((pager: Pager) => {
      if (pager) {
        parentPage = pager.relatedPage;
      }
    });

    const payload = {
      id: row.ledgerId,
      entityId: this.claimantId,
      parentPage,
    };

    this.store.dispatch(commonActions.CreatePager({
      relatedPage,
      settings: navSettings,
      pager: { payload },
    }));

    this.router.navigate(['claimants', `${this.claimantId}`,
      'payments', 'tabs', 'ledger-summary', `${row.ledgerId}`]);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
