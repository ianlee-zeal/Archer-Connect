import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { IdValue, PaymentRequest } from '@app/models';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { Channel } from 'pusher-js';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { PusherService } from '@app/services/pusher.service';
import { JobStatus } from '@app/models/enums';
import * as batchSelectors from '@app/modules/projects/state/selectors';
import { PaymentRequestProgress, PaymentRequestProgressStatistics } from '@app/models/payment-request';
import { ProgressValuesPusherChannel } from '@app/models/file-imports/progress-values-with-channel';

@Component({
  selector: 'app-top-payment-request-progress-bar',
  templateUrl: './top-progress-bar.component.html',
  styleUrls: ['./top-progress-bar.component.scss'],
})
export class TopPaymentRequstProgressBarComponent implements OnDestroy {
  @Input() request: PaymentRequest;
  @Input() type: string;

  readonly generatePaymentRequestData$ = this.store.select(batchSelectors.generatePaymentRequestData);
  readonly updatePaymentRequestData$ = this.store.select(batchSelectors.updatePaymentRequestData);
  readonly progressBarData$ = this.store.select(batchSelectors.progressBarData);
  protected channel: Channel;

  public progressWidth: string = '0%';
  public progressValue: string = '0';
  public progressCurrentCount: number = 0;
  public progressTotalCount: number = 0;
  public message: string = 'Retrieving Payment Items';
  public statistics: PaymentRequestProgressStatistics;

  public hasLedgerEntryErrors: boolean = false;

  constructor(
    private store: Store<any>,
    private readonly pusher: PusherService,
    private readonly enumToArrayPipe: EnumToArrayPipe,

  ) {

  }

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.generatePaymentRequestData$.pipe(
      filter((data: IdValue) => data !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: IdValue) => {
      this.pusherSubscribe(data);
    });

    this.updatePaymentRequestData$.pipe(
      filter((data: IdValue) => data !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: IdValue) => {
      this.setInitialValues();
      this.pusherSubscribe(data);
    });

    this.progressBarData$.pipe(
      filter((data: ProgressValuesPusherChannel) => data !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: ProgressValuesPusherChannel) => {
      if (data.progressValue !== undefined) {
        this.setData(data);
      }
    });
  }

  private pusherSubscribe(data: IdValue): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
    this.channel = this.pusher.subscribeChannel(
      data.name,
      this.enumToArrayPipe.transformToKeysArray(JobStatus),
      this.generatePaymentRequestCallback.bind(this),
    );
  }

  private setInitialValues(): void {
    this.progressWidth = '0%';
    this.progressValue = '0';
    this.progressCurrentCount = 0;
    this.progressTotalCount = 0;
    this.message = 'Retrieving Payment Items';
  }

  private setData(data: ProgressValuesPusherChannel): void {
    this.progressWidth = data.progressWidth;
    this.progressValue = data.progressValue;
    this.progressCurrentCount = data.progressCurrentCount;
    this.progressTotalCount = data.progressCurrentCount;
    this.message = data.message;
  }

  private generatePaymentRequestCallback(data: PaymentRequestProgress, event: string): void {
    switch (event) {
      case JobStatus[JobStatus.Progress]: {
        const result = data as PaymentRequestProgress;
        this.progressCurrentCount = result.CurrentRow;
        this.progressTotalCount = result.TotalRows;
        this.progressValue = <any>((result.CurrentRow * 100) / result.TotalRows);
        this.progressWidth = `${this.progressValue}%`;
        this.message = result.Message;
        if (result.Statistics) {
          this.statistics = { ...result.Statistics, Deficiencies: this.request?.ReviewDocId ? this.statistics.Deficiencies : result.Statistics.Deficiencies };
          this.hasLedgerEntryErrors = this.statistics.LedgerEntryErrors > 0 || this.statistics.Errors > 0;
        }
        break;
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
