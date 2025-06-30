/* eslint-disable no-restricted-globals */
import { Component, Input, OnInit, ElementRef, EventEmitter, Output } from '@angular/core';
import { PusherService } from '@app/services/pusher.service';
import { Store } from '@ngrx/store';
import { GridOptions, GridApi } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import * as batchActions from '@app/modules/projects/state/actions';
import * as batchSelectors from '@app/modules/projects/state/selectors';
import { Address, IAcceptPaymentRequestData, PaymentItemListResponse, PaymentRequest, Note } from '@app/models';
import { EntityTypeEnum, JobStatus, PaymentMethodEnum } from '@app/models/enums';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridHeaderCheckboxComponent } from '@app/modules/shared/grid/grid-header-checkbox/grid-header-checkbox.component';
import { gridLocalDataByGridId } from '@app/state';
import { IGridLocalData } from '@app/state/root.state';
import * as rootActions from '@app/state/root.actions';
import { ContextBarElement } from '@app/entities';
import { AddressPipe, EnumToArrayPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { Payment } from '@app/models/payment';
import { Hidable } from '@app/modules/shared/_functions/hidable';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { Attachment } from '@app/models/attachment';
import * as selectors from '../../../../state/selectors';

@Component({
  selector: 'app-payments-review-step',
  templateUrl: './payments-review-step.component.html',
  styleUrls: ['./payments-review-step.component.scss'],
})
export class PaymentsReviewStepComponent extends ListView implements OnInit {
  private gridLocalData: IGridLocalData;

  @Output()
  readonly finish = new EventEmitter<PaymentRequest>();

  @Output()
  readonly fail = new EventEmitter<string>();

  @Input()
    projectId: number;

  @Input()
    request: PaymentRequest;

  @Input()
    paymentRequestEntityType: EntityTypeEnum;

  @Input()
    note: string;

  @Input()
    attachments: Attachment[];

  readonly gridId = GridId.GeneratedPayments;

  readonly paymentsData$ = this.store.select(batchSelectors.generatedPaymentsData);
  readonly acceptPaymentRequestData$ = this.store.select(batchSelectors.acceptPaymentRequestData);
  readonly gridLocalData$ = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));
  readonly paymentTypes$ = this.store.select(selectors.paymentTypes);

  headerElements: ContextBarElement[];

  public processLogDocId: number;

  readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        width: 40,
        maxWidth: 40,
        checkboxSelection: true,
        headerComponent: GridHeaderCheckboxComponent,
        headerComponentParams: { gridId: this.gridId, floatingFilter: false },
      },
      {
        headerName: 'Payee',
        field: 'payeeName',
        ...AGGridHelper.nameColumnDefaultParams,
        sortable: true
      },
      {
        headerName: 'Payee ID',
        field: 'payeeExternalId',
        ...AGGridHelper.nameColumnDefaultParams,
        wrapText: false,
        sortable: true
      },
      {
        headerName: 'Payment Type',
        field: 'disbursementType',
        ...AGGridHelper.nameColumnDefaultParams,
        sortable: true
      },
      {
        headerName: 'Amount',
        field: 'amount',
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        sortable: true
      },
      {
        headerName: '# of Claims',
        field: 'numberOfClients',
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 100,
        sortable: true
      },
      {
        headerName: 'Client ID',
        valueGetter: params => {
          const data = params.data as Payment;
          if (data.numberOfClients > 1) {
            return 'Multiple';
          }

          const firstPaymentItem = data.paymentItems[0];
          return firstPaymentItem.claimantId;
        },
        ...AGGridHelper.nameColumnDefaultParams,
        wrapText: false,
        sortable: true
      },
      {
        headerName: 'Payment Method',
        field: 'paymentMethodId',
        valueFormatter: params => PaymentMethodEnum[params.value],
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 135,
        sortable: true
      },
      {
        headerName: 'Reference #',
        field: 'referenceNumber',
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 100,
        sortable: true
      },
      {
        headerName: 'Check Memo',
        valueGetter: params => {
          const data = params.data as Payment;
          if (!data.memoText) {
            if (data.paymentItems.length === 1) {
              return '';
            }
            return 'Multiple';
          }

          return data.memoText;
        },
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 135,
        sortable: true
      },
      {
        headerName: 'Address',
        valueGetter: params => {
          const data = params.data as Payment;
          const address = new Address();
          address.line1 = data.payeeAddress1;
          address.line2 = data.payeeAddress2;
          address.city = data.payeeAddressCity;
          address.state = data.payeeAddressState;
          address.zip = data.payeeAddressZip;
          return this.addressPipe.transform(address);
        },
        ...AGGridHelper.nameColumnDefaultParams,
        sortable: true
      },
      {
        headerName: 'Bank Name',
        field: 'payeeBankName',
        ...AGGridHelper.nameColumnDefaultParams,
        sortable: true
      },
      {
        headerName: 'Routing #',
        field: 'payeeRoutingNumber',
        valueFormatter: params => this.formatNumber(params.value),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 100,
        sortable: true
      },
      {
        headerName: 'Account #',
        field: 'payeeAccountNumber',
        valueFormatter: params => this.formatNumber(params.value),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 120,
        sortable: true
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: false,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    suppressRowClickSelection: true,
  };

  get valid(): boolean {
    return this.gridLocalData
      && this.gridLocalData.selectedRecordsIds
      && [...this.gridLocalData.selectedRecordsIds.entries()].filter(entry => entry[1]).some(entry => entry);
  }

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly pusher: PusherService,
    private readonly addressPipe: AddressPipe,
    private readonly yesNoPIpe: YesNoPipe,
    private readonly enumToArrayPipe: EnumToArrayPipe,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.updateGridOptions();

    this.gridLocalData$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((data: IGridLocalData) => {
        this.gridLocalData = data;
      });

    this.acceptPaymentRequestData$.pipe(
      filter(data => data !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      this.store.dispatch(batchActions.IsPaymentRequestInProgress({ isPaymentRequestInProgress: true }));
      if (this.channel) {
        this.pusher.unsubscribeChannel(this.channel);
      }
      const acceptPaymentRequestData: IAcceptPaymentRequestData = {
        selectedPaymentIds: [...this.gridLocalData.selectedRecordsIds.entries()].filter(entry => entry[1]).map(entry => entry[0]),
        note: Note.toDto({ html: this.note, entityTypeId: EntityTypeEnum.ProjectDisbursementNotes, entityId: this.projectId } as Note),
        attachments: this.attachments,
      };

      const requestData = new FormData();
      for (let i = 0; i < this.attachments.length; i++) {
        const doc = this.attachments[i];
        requestData.append('file', doc.file, doc.fileName);
      }

      requestData.append('requestData', JSON.stringify(acceptPaymentRequestData));

      this.channel = this.pusher.subscribeChannel(
        data.name,
        this.enumToArrayPipe.transformToKeysArray(JobStatus),
        this.acceptPaymentRequestCallback.bind(this),
        () => this.store.dispatch(batchActions.StartAcceptPaymentRequestJob({
          paymentRequestId: this.request.Id,
          requestData,
        })),
      );
    });
  }

  onGridReady(gridApi: GridApi) {
    super.gridReady(gridApi);
    this.paymentsData$
      .pipe(first(paymentData => paymentData !== null && paymentData.payments !== null))
      .subscribe((paymentData: PaymentItemListResponse) => {
        this.processLogDocId = paymentData?.processLogDocId;
        this.setGridRowDataWithDelay(paymentData.payments, () => {
          this.store.dispatch(rootActions.SetAllRowSelected({ gridId: this.gridId, isAllRowSelected: true }));
          this.selectAllRows();
        });
        this.headerElements = [
          { column: 'Total', valueGetter: () => CurrencyHelper.toUsdFormat({ value: paymentData.amount }) },
          { column: 'Requestor', valueGetter: () => `${paymentData.firstName} ${paymentData.lastName}` },
          { column: 'QSF', valueGetter: () => paymentData.organizationName },
          { column: 'Project', valueGetter: () => paymentData.caseName },
        ];
      });
  }

  submit() {
    this.store.dispatch(batchActions.IsPaymentRequestInProgress({ isPaymentRequestInProgress: true }));
    this.store.dispatch(batchActions.AcceptPaymentRequest({ paymentRequestId: this.request.Id }));
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
  }

  private acceptPaymentRequestCallback(data: PaymentRequest | string, event: string) {
    switch (event) {
      case JobStatus[JobStatus.LoadingCompleted]: {
        const result = data as PaymentRequest;
        if (result.LoadingDocId) {
          this.store.dispatch(batchActions.GetPaymentRequestDataResult({
            projectId: this.projectId,
            paymentRequestId: this.request.Id,
            documentId: result.LoadingDocId,
          }));
          this.store.dispatch(batchActions.AcceptPaymentRequestJobSuccess());
          this.finish.emit(result);
        } else {
          this.store.dispatch(batchActions.AcceptPaymentRequestJobFailed());
          this.fail.emit(data ? data as string : 'Completed with empty response.');
        }
        break;
      }
      case JobStatus[JobStatus.Error]:
        this.store.dispatch(batchActions.AcceptPaymentRequestJobFailed());
        this.fail.emit(data as string);
        break;
    }
  }

  private formatNumber(value: string) {
    return Hidable.hideNumber(value || '', 9);
  }

  private updateGridOptions(): void {
    const isIndividualEntityTypes = [
      EntityTypeEnum.ClaimSettlementLedgerEntries,
      EntityTypeEnum.DisbursementGroupClaimant
    ]
    if (isIndividualEntityTypes.includes(this.paymentRequestEntityType)) {
      const isIndividualColDef = {
        headerName: 'Is Individual?',
        field: 'isIndividual',
        cellRenderer: data => this.yesNoPIpe.transform(data.value),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 120,
      };

      this.gridOptions.columnDefs.splice(1, 0, isIndividualColDef);
    }
  }
}
