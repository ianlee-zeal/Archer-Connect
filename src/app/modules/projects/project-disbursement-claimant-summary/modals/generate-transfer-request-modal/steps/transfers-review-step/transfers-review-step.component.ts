/* eslint-disable no-restricted-globals */
import { Component, Input, OnInit, ElementRef, EventEmitter, Output } from '@angular/core';
import { PusherService } from '@app/services/pusher.service';
import { ActionsSubject, Store } from '@ngrx/store';
import { GridOptions, GridApi } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { first, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

import * as batchActions from '@app/modules/projects/state/actions';
import * as batchSelectors from '@app/modules/projects/state/selectors';
import { Address, Transfer, TransferItemsResponse } from '@app/models';
import { EntityTypeEnum, PaymentMethodEnum } from '@app/models/enums';
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
import { ITransferAccept } from '@app/models/transfer-request/transfer-accept-request';
import { ofType } from '@ngrx/effects';
import { FormDataHelper } from '@app/helpers/form-data.helper';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { Channel } from 'pusher-js';
import { ProgressValuesPusherChannel } from '@app/models/file-imports/progress-values-with-channel';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { TransferItem } from '@app/models/transfer-item';
import * as selectors from '../../../../state/selectors';

@Component({
  selector: 'app-transfers-review-step',
  templateUrl: './transfers-review-step.component.html',
  styleUrl: './transfers-review-step.component.scss',
})
export class TransfersReviewStepComponent extends ListView implements OnInit {
  private gridLocalData: IGridLocalData;

  @Output()
  readonly finishTransfer = new EventEmitter<string[]>();

  @Output()
  readonly fail = new EventEmitter<string>();

  @Input()
    projectId: number;

  @Input()
    transferRequestEntityType: EntityTypeEnum;

  @Input()
    note: string;

  @Input()
    attachments: Attachment[];

  @Input()
    transferRequestId: number;

  @Input()
    batchActionId: number;

  @Input()
    pusherChannelName: string;

  public transferChannel: Channel;

  readonly gridId = GridId.GeneratedPayments;

  readonly paymentsData$ = this.store.select(batchSelectors.generatedPaymentsData);
  readonly gridLocalData$ = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));
  readonly paymentTypes$ = this.store.select(selectors.paymentTypes);

  readonly transferData$ = this.store.select(batchSelectors.transferData);

  headerElements: ContextBarElement[];

  public processLogDocId: number;
  public selectedTransferIds: string[];

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
        sortable: true,
      },
      {
        headerName: 'Payee ID',
        field: 'payeeExternalId',
        ...AGGridHelper.nameColumnDefaultParams,
        wrapText: false,
        sortable: true,
      },
      {
        headerName: 'Payment Type',
        field: 'disbursementType',
        ...AGGridHelper.nameColumnDefaultParams,
        sortable: true,
      },
      {
        headerName: 'Amount',
        field: 'amount',
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        sortable: true,
      },
      {
        headerName: '# of Claims',
        valueGetter: params => {
          const data = params.data as Transfer;
          const distinctClaimantCount = Array.from(new Set((data?.items ?? []).map((p: TransferItem) => p.claimantId))).length;
          return distinctClaimantCount;
        },
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 100,
        sortable: true,
      },
      {
        headerName: 'Client ID',
        valueGetter: params => {
          const data = params.data as Transfer;
          if (Array.from(new Set((data?.items ?? []).map((p: TransferItem) => p.claimantId))).length > 1) {
            return 'Multiple';
          }

          const firstTransferItem = data.items[0];
          return firstTransferItem.claimantId;
        },
        ...AGGridHelper.nameColumnDefaultParams,
        wrapText: false,
        sortable: true,
      },
      {
        headerName: 'Payment Method',
        field: 'paymentMethodId',
        valueFormatter: params => PaymentMethodEnum[params.value],
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 135,
        sortable: true,
      },
      {
        headerName: 'Reference #',
        field: 'referenceNumber',
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 100,
        sortable: true,
      },
      {
        headerName: 'Check Memo',
        valueGetter: params => {
          const data = params.data as Payment;
          if (!data.memoText) {
            if (data.paymentItems?.length === 1) {
              return '';
            }
            return 'Multiple';
          }

          return data.memoText;
        },
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 135,
        sortable: true,
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
        sortable: true,
      },
      {
        headerName: 'Bank Name',
        field: 'payeeBankName',
        ...AGGridHelper.nameColumnDefaultParams,
        sortable: true,
      },
      {
        headerName: 'Routing #',
        field: 'payeeRoutingNumber',
        valueFormatter: params => this.formatNumber(params.value),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 100,
        sortable: true,
      },
      {
        headerName: 'Account #',
        field: 'payeeAccountNumber',
        valueFormatter: params => this.formatNumber(params.value),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 120,
        sortable: true,
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
      && [...this.gridLocalData.selectedRecordsIds.entries()].filter((entry: [string, boolean]) => entry[1]).some((entry: [string, boolean]) => entry);
  }

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly pusher: PusherService,
    private readonly addressPipe: AddressPipe,
    private readonly yesNoPIpe: YesNoPipe,
    private readonly enumToArrayPipe: EnumToArrayPipe,
    private readonly actionsSubj: ActionsSubject,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.updateGridOptions();
    this.actionsSubj.pipe(
      ofType(batchActions.GetTransfersItemsSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.finishTransfer.emit(this.selectedTransferIds);
    });

    this.actionsSubj.pipe(
      ofType(batchActions.AcceptTransferRequestSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.store.dispatch(batchActions.IsPaymentRequestInProgress({ isPaymentRequestInProgress: true }));
      if (this.transferChannel) {
        this.pusher.unsubscribeChannel(this.transferChannel);
      }
      this.transferChannel = this.pusher.subscribeChannel(
        this.pusherChannelName,
        this.enumToArrayPipe.transformToKeysArray(BatchActionStatus),
        this.generateTransferRequestCallback.bind(this),
        () => this.store.dispatch(batchActions.LoadTransferRequest({
          batchActionId: this.batchActionId,
        })),
      );
    });

    this.gridLocalData$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((data: IGridLocalData) => {
        this.gridLocalData = data;
      });
  }

  onGridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
    this.transferData$
      .pipe(first((transferData: TransferItemsResponse) => transferData !== null && transferData.items !== null))
      .subscribe((transferData: TransferItemsResponse) => {
        this.processLogDocId = transferData?.processLogDocId;
        this.setGridRowDataWithDelay(transferData.items, () => {
          this.store.dispatch(rootActions.SetAllRowSelected({ gridId: this.gridId, isAllRowSelected: true }));
          this.selectAllRows();
        });
        this.headerElements = [
          { column: 'Total', valueGetter: () => CurrencyHelper.toUsdFormat({ value: transferData.amount }) },
          { column: 'Requestor', valueGetter: () => `${transferData.firstName} ${transferData.lastName}` },
          { column: 'QSF', valueGetter: () => transferData.organizationName },
          { column: 'Project', valueGetter: () => transferData.caseName },
        ];
      });
  }

  submit(): void {
    this.store.dispatch(batchActions.IsPaymentRequestInProgress({ isPaymentRequestInProgress: true }));
    this.selectedTransferIds = [...this.gridLocalData.selectedRecordsIds.entries()].filter((entry: [string, boolean]) => entry[1]).map((entry: [string, boolean]) => entry[0]);
    const transferRequestData: ITransferAccept = {
      selectedTransfersIds: this.selectedTransferIds,
      note: this.note,
    };
    const formData = FormDataHelper.objectToFormData(transferRequestData) as FormData;
    for (let i = 0; i < this.attachments.length; i++) {
      const doc = this.attachments[i];
      formData.append('files', doc.file, doc.fileName);
    }

    this.store.dispatch(batchActions.AcceptTransferRequest({ transferRequestId: this.transferRequestId, request: formData }));
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
  }

  private generateTransferRequestCallback(data: GridPusherMessage | string, event: string): void {
    switch (event) {
      case BatchActionStatus[BatchActionStatus.Complete]: {
        const message = GridPusherMessage.toModel(data);
        const result = ProgressValuesPusherChannel.toModel(message, this.transferChannel.name);
        this.store.dispatch(batchActions.GetReviewTransfers({ transferRequestId: this.transferRequestId }));
        this.store.dispatch(batchActions.GetBatchAction({ batchActionId: this.batchActionId }));
        this.store.dispatch(batchActions.UpdateProgressBarData({ progressBarData: result }));
        this.unsubscribeTransferChannel();
        break;
      }
      case BatchActionStatus[BatchActionStatus.Error]: {
        const error = GridPusherMessage.toModel(data);
        this.store.dispatch(batchActions.AcceptPaymentRequestJobFailed());
        this.fail.emit(error.ErrorMessage);
        break;
      }
    }
  }

  private formatNumber(value: string): string {
    return Hidable.hideNumber(value || '', 9);
  }

  private updateGridOptions(): void {
    const isIndividualEntityTypes = [
      EntityTypeEnum.ClaimSettlementLedgerEntries,
      EntityTypeEnum.DisbursementGroupClaimant,
    ];
    if (isIndividualEntityTypes.includes(this.transferRequestEntityType)) {
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

  private unsubscribeTransferChannel(): void {
    if (this.transferChannel) {
      this.pusher.unsubscribeChannel(this.transferChannel);
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribeTransferChannel();
  }
}
