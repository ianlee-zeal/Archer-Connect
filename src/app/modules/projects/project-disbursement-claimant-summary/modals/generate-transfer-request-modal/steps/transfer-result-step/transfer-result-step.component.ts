/* eslint-disable no-restricted-globals */
import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { GridApi, GridOptions } from 'ag-grid-community';

import { GridId } from '@app/models/enums/grid-id.enum';
import { ContextBarElement } from '@app/entities';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Router } from '@angular/router';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { Store } from '@ngrx/store';
import * as batchSelectors from '@app/modules/projects/state/selectors';
import { first } from 'rxjs/operators';
import { CurrencyHelper } from '@app/helpers';
import { TransferItemsResponse } from '@app/models';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { PaymentRequestResultResponse } from '@app/models/payment-request/payment-request-result-response';
import { JobStatus } from '@app/models/enums';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { TransferItem } from '@app/models/transfer-item';
import * as batchActions from '@app/modules/projects/state/actions';

@Component({
  selector: 'app-transfer-result-step',
  templateUrl: './transfer-result-step.component.html',
  styleUrl: './transfer-result-step.component.scss',
})
export class TransferResultStepComponent extends ListView implements OnInit {
  headerElements: ContextBarElement[];

  @Input() selectedTransferIds: string[];

  readonly gridId = GridId.GeneratedPaymentsResults;
  readonly transferData$ = this.store.select(batchSelectors.transferData);
  readonly batchActionData$ = this.store.select(batchSelectors.batchActionData);

  public processLogDocId: number;
  public transferData: TransferItemsResponse;

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: false,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    suppressRowClickSelection: true,
  };

  ngOnInit(): void {
    this.gridOptions.columnDefs = [
      {
        headerName: 'Transfer Request ID',
        field: 'name',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Payment Count',
        field: 'totalRows',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: '# of Claims',
        field: 'transferCount',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Results',
        field: 'summary',
        ...AGGridHelper.nameColumnDefaultParams,
      },
    ];
  }

  gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
    this.transferData$
      .pipe(first((transferData: TransferItemsResponse) => transferData !== null && transferData.items !== null))
      .subscribe((transferData: TransferItemsResponse) => {
        this.transferData = transferData;
        this.headerElements = [
          { column: 'Total', valueGetter: () => CurrencyHelper.toUsdFormat({ value: transferData.amount }) },
          { column: 'Requestor', valueGetter: () => `${transferData.firstName} ${transferData.lastName}` },
          { column: 'QSF', valueGetter: () => transferData.organizationName },
          { column: 'Project', valueGetter: () => transferData.caseName },
        ];
        const data: PaymentRequestResultResponse = {
          name: this.transferData.caseName,
          summary: JobStatus[JobStatus.LoadingCompleted],
          totalRows: this.selectedTransferIds?.length || 0,
          transferCount: this.selectedTransferIds.reduce((sum: number, selectedId: string) => {
            // Parse selected Ids
            const index = parseInt(selectedId, 10) - 1;

            // Select item by index
            const item = this.transferData?.items?.[index];

            // Sum only the unique claimants for each selected transfer
            return item && Array.isArray(item.items) ? sum + Array.from(new Set((item?.items ?? []).map((p: TransferItem) => p.claimantId))).length : sum;
          }, 0) ?? 0,
        };
        this.processLogDocId = this.transferData.processLogDocId;
        this.gridApi?.setGridOption('rowData', [data]);
      });
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
  }

  public ngOnDestroy(): void {
    this.store.dispatch(batchActions.ClearProgressBarData());
    this.store.dispatch(batchActions.ClearTransferData());
  }
}
