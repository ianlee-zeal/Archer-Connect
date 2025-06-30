import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { ActionsSubject, Store } from '@ngrx/store';

import * as fromShared from '@app/modules/shared/state';
import * as projectActions from '@app/modules/projects/state/actions';
import { filter, takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { PaymentRequestReviewOptions } from '@app/models/payment-request/payment-request-options';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { PusherService } from '@app/services/pusher.service';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { RequestReviewOption } from '@app/models/payment-request/payment-request-review-result';
import { Subject } from 'rxjs';
import { Channel } from 'pusher-js';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { ProgressValuesPusherChannel } from '@app/models/file-imports/progress-values-with-channel';

@Component({
  selector: 'app-transfers-deficiency-summary',
  templateUrl: './transfers-deficiency-summary.component.html',
  styleUrl: './transfers-deficiency-summary.component.scss',
})
export class TransfersDeficiencySummaryComponent implements OnInit, OnDestroy {
  @Input() public projectId: number;
  @Input() public batchActionId: number;
  @Input() public transferRequestId: number;
  @Input() public pusherChannelName: string;

  @Output()
  readonly fail = new EventEmitter<string>();

  @Output()
  readonly warning = new EventEmitter<PaymentRequest>();

  @Output()
  readonly finishTransfer = new EventEmitter<GridPusherMessage>();

  readonly requestDeficiencies$ = this.store.select(projectSelectors.paymentRequesDeficiencies);
  readonly criticalDeficiencies$ = this.store.select(projectSelectors.paymentRequestCriticalDeficiencies);
  readonly updatePaymentRequestData$ = this.store.select(projectSelectors.updatePaymentRequestData);

  public submitting = false;
  public loadingWarningData = false;
  public paymentRequesDeficiencies: RequestReviewOption[];

  private ngUnsubscribe$ = new Subject<void>();
  private channel: Channel;
  private transferChannel: Channel;

  constructor(
    private readonly store: Store<fromShared.AppState>,
    private readonly actionsSubj: ActionsSubject,
    private readonly pusher: PusherService,
    private readonly enumToArrayPipe: EnumToArrayPipe,
  ) {
  }

  ngOnInit(): void {
    this.actionsSubj.pipe(
      ofType(projectActions.GetTransfersItemsSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.finishTransfer.emit();
    });

    this.actionsSubj.pipe(
      ofType(projectActions.GetPaymentRequestReviewWarningsSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.loadingWarningData = false;
    });

    this.actionsSubj.pipe(
      ofType(projectActions.UpdateTransferOptionsSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.loadingWarningData = false;
      this.unsubscribeFromChannel();
      this.transferChannel = this.pusher.subscribeChannel(
        this.pusherChannelName,
        this.enumToArrayPipe.transformToKeysArray(BatchActionStatus),
        this.generateTransferRequestCallback.bind(this),
        () => this.store.dispatch(projectActions.ProccessTransferRequest({
          batchActionId: this.batchActionId,
        })),
      );
    });

    this.requestDeficiencies$.pipe(
      filter((data: RequestReviewOption[]) => !!data),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: RequestReviewOption[]) => {
      this.paymentRequesDeficiencies = data;
    });

    this.loadingWarningData = true;
    this.store.dispatch(projectActions.GetTransferDeficiencies({
      transferRequestId: this.batchActionId,
    }));
  }

  submit(): void {
    const paymentRequestReviewOptions: PaymentRequestReviewOptions = {
      options: this.paymentRequesDeficiencies.map(RequestReviewOption.toDto),
    };

    this.store.dispatch(projectActions.UpdateTransferOptions({
      batchActionId: this.batchActionId,
      transferRequestId: this.transferRequestId,
      params: paymentRequestReviewOptions.options,
    }));

    this.submitting = true;
  }

  private generateTransferRequestCallback(data: GridPusherMessage | string, event: string): void {
    switch (event) {
      case BatchActionStatus[BatchActionStatus.Complete]: {
        const message = GridPusherMessage.toModel(data);
        const progressBarData = ProgressValuesPusherChannel.toModel(message, this.transferChannel.name);
        this.store.dispatch(projectActions.GetReviewTransfers({ transferRequestId: this.transferRequestId }));
        this.store.dispatch(projectActions.UpdateProgressBarData({ progressBarData }));
        this.stopSubmitting();
        break;
      }
      case BatchActionStatus[BatchActionStatus.Validating]: {
        const message = GridPusherMessage.toModel(data);
        const progressBarData = ProgressValuesPusherChannel.toModel(message, this.transferChannel.name);
        this.store.dispatch(projectActions.UpdateProgressBarData({ progressBarData }));
        break;
      }
      case BatchActionStatus[BatchActionStatus.Error]:
        this.store.dispatch(projectActions.GeneratePaymentRequestJobFailed());
        this.fail.emit(data as string);
        this.unsubscribeFromChannel();
        this.stopSubmitting();
        break;
    }
  }

  private stopSubmitting(): void {
    this.submitting = false;
    this.unsubscribeFromChannel();
  }

  private unsubscribeFromChannel(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
    }
    if (this.transferChannel) {
      this.pusher.unsubscribeChannel(this.transferChannel);
      this.transferChannel = null;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeFromChannel();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
