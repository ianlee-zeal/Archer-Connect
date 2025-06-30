/* eslint-disable no-restricted-globals */
import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';

import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { DateFormatPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { AppState } from '@app/modules/shared/state';
import { ModalService, MessageService } from '@app/services';
import { PusherService } from '@app/services/pusher.service';
import { DefaultGlobalSearchType, EntityTypeEnum } from '@app/models/enums';

import { GridId } from '@app/models/enums/grid-id.enum';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { PermissionService } from '../../../services/permissions.service';
import * as paymentsActions from '../state/actions';
import { PaymentsGridComponent } from '../payments-grid/payments-grid.component';
import { first } from 'rxjs';
import { Pager, RelatedPage } from '@app/modules/shared/grid-pager';

import * as commonActions from '@app/modules/shared/state/common.actions';

@Component({
  selector: 'app-transfers-grid',
  templateUrl: './transfers-grid.component.html',
  styleUrls: ['./transfers-grid.component.scss'],
})
export class TransfersGridComponent extends PaymentsGridComponent implements OnInit {
  @Input() isAdvancedSearchEnabled: boolean = true;
  entityType: EntityTypeEnum = EntityTypeEnum.Payments;
  @Input() entityTypeId: EntityTypeEnum;
  @Input() entityId: number;
  @Input() exportOnlyFilteredData: boolean = true;

  public readonly gridId: GridId = GridId.Transfers;


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
        hide: true,
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
    super(store, modalService, messageService, route, actionsSubj, router, datePipe, elementRef, pusher, yesNoPipe, permissionService);
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
      this.store.dispatch(paymentsActions.GoToTransfersDetails({ payload }));
      switch (this.entityTypeId) {
        case EntityTypeEnum.Clients:
          relatedPage = RelatedPage.TransfersFromClaimant;
          break;
        case EntityTypeEnum.Projects:
          relatedPage = RelatedPage.TransfersFromProject;
          break;
        default:
          relatedPage = RelatedPage.TransfersFromSearch;
          break;
      }
      this.store.dispatch(commonActions.CreatePager({
        relatedPage,
        settings: navSettings,
        pager: { payload },
      }));
    }
  }

  protected fetchData(params): void {
    // eslint-disable-next-line no-param-reassign
    this.setupTansferFilter(params, true);
    params = this.mergeSearchFilters(params);
    this.gridParams = params;
    this.store.dispatch(paymentsActions.GetPayments({
      entityId: this.entityId,
      entityTypeId: this.entityTypeId,
      params,
    }));
  }
}
