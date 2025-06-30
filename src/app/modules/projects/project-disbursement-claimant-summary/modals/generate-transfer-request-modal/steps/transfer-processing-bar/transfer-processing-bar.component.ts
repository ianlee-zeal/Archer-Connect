import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { IdValue, PaymentRequest, Transfer, TransferItemsResponse } from '@app/models';
import { Store } from '@ngrx/store';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Channel } from 'pusher-js';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { PusherService } from '@app/services/pusher.service';
import { JobStatus } from '@app/models/enums';
import * as batchSelectors from '@app/modules/projects/state/selectors';
import { ProgressValuesPusherChannel } from '@app/models/file-imports/progress-values-with-channel';
import { TransferRequestProgressStatistics } from '@app/models/transfer-request/transfer-request-progress-statistics';
import { TransferRequestProgress } from '@app/models/transfer-request/transfer-request-progress';
import { RequestReviewOption } from '@app/models/payment-request/payment-request-review-result';

@Component({
  selector: 'app-transfer-processing-bar',
  templateUrl: './transfer-processing-bar.component.html',
  styleUrl: './transfer-processing-bar.component.scss',
})
export class TransferProcessingBarComponent implements OnDestroy {
  @Input() request: PaymentRequest;
  @Input() public type: string;

  readonly acceptPaymentRequestData$ = this.store.select(batchSelectors.acceptPaymentRequestData);
  readonly progressBarData$ = this.store.select(batchSelectors.progressBarData);
  readonly warningDeficiencies$ = this.store.select(batchSelectors.paymentRequestWarningDeficiencies);
  readonly criticalDeficiencies$ = this.store.select(batchSelectors.paymentRequestCriticalDeficiencies);
  readonly transferData$ = this.store.select(batchSelectors.transferData);
  protected channel: Channel;

  public progressWidth: string = '0%';
  public progressValue: string = '0';
  public progressCurrentCount: number = 0;
  public progressTotalCount: number = 0;
  public statistics: TransferRequestProgressStatistics = {
    Deficiencies: 0,
    Errors: 0,
    TransferItemsCount: 0,
    TransfersCount: 0,
  };

  constructor(
    private store: Store<any>,
    private readonly pusher: PusherService,
    private readonly enumToArrayPipe: EnumToArrayPipe,

  ) {
  }

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.acceptPaymentRequestData$.pipe(
      filter((data: IdValue) => data !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: IdValue) => {
      if (this.channel) {
        this.pusher.unsubscribeChannel(this.channel);
      }
      this.channel = this.pusher.subscribeChannel(
        data.name,
        this.enumToArrayPipe.transformToKeysArray(JobStatus),
        this.acceptPaymentRequestCallback.bind(this),
      );
    });

    this.progressBarData$.pipe(
      filter((data: ProgressValuesPusherChannel) => data !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: ProgressValuesPusherChannel) => {
      if (data.progressValue !== undefined) {
        this.setData(data);
      }
    });

    this.warningDeficiencies$.pipe(
      filter((data: RequestReviewOption[]) => !!data),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: RequestReviewOption[]) => {
      this.statistics.Deficiencies = data.length;
    });

    this.criticalDeficiencies$.pipe(
      filter((data: RequestReviewOption[]) => !!data),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: RequestReviewOption[]) => {
      this.statistics.Errors = data.length;
    });

    this.transferData$
      .pipe(first((transferData: TransferItemsResponse) => transferData !== null && transferData.items !== null))
      .subscribe((transferData: TransferItemsResponse) => {
        this.statistics.TransfersCount = transferData.items.length;
        this.statistics.TransferItemsCount = transferData.items
          .reduce((totalCount: number, item: Transfer) => totalCount + (item.items ? item.items.length : 0), 0);
      });
  }

  private acceptPaymentRequestCallback(data: TransferRequestProgress, event: string): void {
    switch (event) {
      case JobStatus[JobStatus.Progress]: {
        const result = data as TransferRequestProgress;
        this.progressCurrentCount = result.CurrentRow;
        this.progressTotalCount = result.TotalRows;
        this.progressValue = <any>((result.CurrentRow * 100) / result.TotalRows);
        this.progressWidth = `${this.progressValue}%`;
        if (result.Statistics) {
          this.statistics = { ...result.Statistics, Deficiencies: this.request?.ReviewDocId ? this.statistics.Deficiencies : result.Statistics.Deficiencies };
        }
        break;
      }
    }
  }

  private setData(data: ProgressValuesPusherChannel): void {
    this.progressWidth = data.progressWidth;
    this.progressValue = data.progressValue;
    this.progressCurrentCount = data.progressCurrentCount;
    this.progressTotalCount = data.progressTotalCount;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
