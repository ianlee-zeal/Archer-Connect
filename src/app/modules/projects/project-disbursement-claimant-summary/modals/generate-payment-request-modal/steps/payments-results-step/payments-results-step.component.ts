/* eslint-disable no-restricted-globals */
import { Component, ElementRef, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { GridId } from '@app/models/enums/grid-id.enum';
import { ContextBarElement } from '@app/entities';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Router } from '@angular/router';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { Store } from '@ngrx/store';
import * as batchSelectors from '@app/modules/projects/state/selectors';
import { first } from 'rxjs/operators';
import { CurrencyHelper } from '@app/helpers';
import { PaymentItemListResponse } from '@app/models';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { PaymentRequestResultResponse } from '@app/models/payment-request/payment-request-result-response';

@Component({
  selector: 'app-payments-results-step',
  templateUrl: './payments-results-step.component.html',
  styleUrls: ['./payments-results-step.component.scss'],
})
export class PaymentsResultsStepComponent extends ListView implements OnInit {
  headerElements: ContextBarElement[];

  readonly gridId = GridId.GeneratedPaymentsResults;
  readonly paymentsData$ = this.store.select(batchSelectors.generatedPaymentsData);
  readonly paymentsResultData$ = this.store.select(batchSelectors.generatedPaymentsResultData);

  public processLogDocId: number;

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Payment Request ID',
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
        field: 'totalRows',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Results',
        field: 'summary',
        ...AGGridHelper.nameColumnDefaultParams,
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: false,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    suppressRowClickSelection: true,
  };

  ngOnInit(): void {
    this.paymentsData$
      .pipe(first(paymentData => paymentData !== null && paymentData.payments !== null))
      .subscribe((paymentData: PaymentItemListResponse) => {
        this.headerElements = [
          { column: 'Total', valueGetter: () => CurrencyHelper.toUsdFormat({ value: paymentData.amount }) },
          { column: 'Requestor', valueGetter: () => `${paymentData.firstName} ${paymentData.lastName}` },
          { column: 'QSF', valueGetter: () => paymentData.organizationName },
          { column: 'Project', valueGetter: () => paymentData.caseName },
        ];
      });
    this.paymentsResultData$
      .pipe(first(data => data !== null))
      .subscribe((data: PaymentRequestResultResponse) => {
        this.processLogDocId = data.processLogDocId;
        this.gridApi?.setGridOption('rowData', [data]);
      });
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
  }
}
