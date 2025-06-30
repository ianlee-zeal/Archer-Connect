import { Component, Input, OnInit, ElementRef, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { filter, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PaymentRequest } from '@app/models';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ContextBarElement } from '@app/entities';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import * as fromAuth from '@app/modules/auth/state/index';
import { ManualPaymentRequestDocsResponse } from '../../../../../../../models/manual-payment-request-docs-response';
import * as projectSelectors from '../../../../../state/selectors';
@Component({
  selector: 'app-disbursement-payment-request-result-step',
  templateUrl: './disbursement-payment-request-result-step.component.html',
  styleUrls: ['./disbursement-payment-request-result-step.component.scss'],
})
export class DisbursementPaymentRequestResultStepComponent extends ListView implements OnInit {
  @Input() projectId: number;
  @Input() projectName: number;
  @Output() readonly finish = new EventEmitter<PaymentRequest>();
  @Output() readonly fail = new EventEmitter<string>();

  readonly gridId = GridId.GeneratedPayments;
  public userName: string;
  headerElements: ContextBarElement[];
  public form = new UntypedFormGroup({ note: new UntypedFormControl(null) });

  public user$ = this.store.select<any>(fromAuth.authSelectors.getUser);
  public paymentRequestImportsResult$ = this.store.select(projectSelectors.paymentRequestImportsResult);
  public manualPaymentRequestDocsResponse$ = this.store.select(projectSelectors.manualPaymentRequestDocsResponse);

  readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Payment Request ID',
        field: 'paymentRequestID',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Payment Count',
        field: 'paymentCount',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: '# of Claims',
        field: 'numberOfClaims',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Results',
        field: 'results',
        ...AGGridHelper.nameColumnDefaultParams,
      },
    ],
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: false,
    },
    suppressRowClickSelection: true,
  };

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.subscribeToUser();
    this.subscribeToManualPaymentRequestDocsResponse();
    this.subscribeToPaymentRequestImportsResult();
  }

  private subscribeToUser() {
    this.user$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.userName = user.displayName;
    });
  }

  private subscribeToManualPaymentRequestDocsResponse() {
    this.manualPaymentRequestDocsResponse$.pipe(
      filter(data => !!data),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((value: ManualPaymentRequestDocsResponse) => {
      const data = [
        {
          paymentRequestID: value.paymentRequestId,
          paymentCount: value.paymentsCount,
          numberOfClaims: value.numberOfClaims,
          results: 'Loading Completed',
        },
      ];
      this.setGridRowDataWithDelay(data);
    });
  }

  private subscribeToPaymentRequestImportsResult() {
    this.paymentRequestImportsResult$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter(data => !!data),
      )
      .subscribe(paymentData => {
        const rows = paymentData.rows.map(item => (item.fields)).filter(item => item.QsfOrgName);
        const total = rows.reduce((sum, cur) => sum + cur.Amount, 0);
        const qsf = rows[0].QsfOrgName;

        this.setGridRowDataWithDelay(rows);
        this.headerElements = [
          { column: 'Total', valueGetter: () => CurrencyHelper.toUsdFormat({ value: total }) },
          { column: 'Requestor', valueGetter: () => this.userName },
          { column: 'QSF', valueGetter: () => qsf },
          { column: 'Project', valueGetter: () => this.projectName },
        ];
      });
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
  }
}
