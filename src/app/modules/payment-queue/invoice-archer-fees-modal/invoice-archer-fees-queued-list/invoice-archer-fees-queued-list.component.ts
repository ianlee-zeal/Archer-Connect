import { Component, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { FileImportReviewTabs } from '@app/models/enums';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';
import { GridId } from '@app/models/enums/grid-id.enum';
import { InvoiceArcherFeesValidationResultItem } from '@app/models/payment-queue/invoice-archer-fees-validation-result-item';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ExtendedCurrencyPipe } from '@app/modules/shared/_pipes';
import * as fromShared from '@app/modules/shared/state';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { takeUntil } from 'rxjs';
import * as globalPaymentQueueActions from '../../state/actions';

@Component({
  selector: 'app-invoice-archer-fees-queued-list',
  templateUrl: './invoice-archer-fees-queued-list.component.html',
  styleUrls: ['./invoice-archer-fees-queued-list.component.scss'],
})
export class InvoiceArcherFeesQueuedListComponent extends ListView {
  @Input() public batchAction: BatchAction;
  @Input() public resultDocId: number;
  @Input() public documentTypeId: BatchActionDocumentType;
  @Input() public tab: FileImportReviewTabs;
  public fetchDataSuccess: boolean;
  public totalAmount: number = 0;
  public totalCount: number = 0;

  public gridId: GridId = GridId.InvoiceArcherFeesQueuedList;

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
    private actionSubj: ActionsSubject,
    private currencyPipe: ExtendedCurrencyPipe,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.actionSubj.pipe(
      ofType(globalPaymentQueueActions.GetInvoiceArcherFeesResultRequestSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.calculateTotals();
    });
  }

  public gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      suppressMenu: true,
      autoHeight: true,
      wrapText: true,
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Account Number',
        field: 'accountNumber',
      },
      {
        headerName: 'Account Name',
        field: 'accountName',
      },
      {
        headerName: 'Total Amount',
        field: 'totalAmount',
        cellRendererSelector: () => ({
          component: (data: { value: number; }) => this.currencyPipe.transform(data.value),
        }),
      },
      {
        headerName: 'RecordCount',
        field: 'recordCount',
      },
    ],
  };

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    if (!this.fetchDataSuccess) {
      this.fetchDataSuccess = true;
      this.store.dispatch(globalPaymentQueueActions.GetInvoiceArcherFeesResultRequest({
        entityId: this.batchAction.id,
        documentTypeId: this.documentTypeId,
        tab: this.tab,
        agGridParams,
        status: BatchActionResultStatus.Successful,
      }));
    }
  }

  calculateTotals(): void {
    this.totalAmount = 0;
    this.totalAmount = 0;

    this.gridApi.forEachNode((node: any) => {
      const data: InvoiceArcherFeesValidationResultItem = node.data;

      if (data) {
        this.totalAmount += data.totalAmount;
        this.totalCount += data.recordCount;
      }
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
