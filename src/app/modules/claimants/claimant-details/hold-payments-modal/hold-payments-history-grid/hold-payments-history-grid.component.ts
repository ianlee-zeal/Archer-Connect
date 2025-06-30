import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { Subject } from 'rxjs';
import * as claimantDetailsStore from '../../state/reducer';
import * as claimantDetailsActions from '../../state/actions';

@Component({
  selector: 'app-hold-payments-history-grid',
  templateUrl: './hold-payments-history-grid.component.html',
  styleUrls: ['./hold-payments-history-grid.component.scss'],
})
export class HoldPaymentsHistoryGridComponent extends ListView implements OnInit, OnDestroy {
  @Input() clientId: number;
  public gridId: GridId = GridId.PaymentHoldHistory;
  public gridDataLoaded: boolean = false;

  public ngDestroyed$ = new Subject<void>();

  constructor(
    private readonly datePipe: DateFormatPipe,
    private store: Store<claimantDetailsStore.ClaimantDetailsState>,
    protected router: Router,
    elementRef : ElementRef,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Action',
        headerTooltip: 'Action',
        field: 'clientPaymentStateName',
        maxWidth: 120,
        autoHeight: true,
        wrapText: true,
      },
      {
        headerName: 'Type',
        headerTooltip: 'Type',
        field: 'holdTypeName',
        maxWidth: 120,
        autoHeight: true,
        wrapText: true,
      },
      {
        headerName: 'Responsible',
        headerTooltip: 'Responsible',
        field: 'responsibleName',
        maxWidth: 120,
        autoHeight: true,
        wrapText: true,
      },
      {
        headerName: 'Date of Update',
        headerTooltip: 'Date of Update',
        field: 'lastModifiedDate',
        sort: 'desc',
        cellRenderer: data => (data ? this.datePipe.transform(data.value) : null),
        maxWidth: 110,
        autoHeight: true,
        wrapText: true,
      },
      {
        headerName: 'Reason',
        headerTooltip: 'Reason',
        field: 'holdTypeReasonName',
        maxWidth: 120,
        autoHeight: true,
        wrapText: true,
      },
      {
        headerName: 'Follow-up date',
        headerTooltip: 'Follow-up date',
        field: 'followUpDate',
        cellRenderer: data => (data ? this.datePipe.transform(data.value) : null),
        maxWidth: 110,
        autoHeight: true,
        wrapText: true,
      },
      {
        headerName: 'Notes',
        headerTooltip: 'Notes',
        field: 'description',
        maxWidth: 320,
        autoHeight: true,
        wrapText: true,
      },
    ],
  };

  protected fetchData(params): void {
    this.gridParams = params;
    this.store.dispatch(claimantDetailsActions.HoldPaymentHistoryRequest({ gridParams: this.gridParams, clientId: this.clientId }));
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
