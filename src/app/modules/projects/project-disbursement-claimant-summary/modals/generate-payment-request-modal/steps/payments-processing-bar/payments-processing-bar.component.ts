import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { PaymentRequest } from '@app/models';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { Channel } from 'pusher-js';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { PusherService } from '@app/services/pusher.service';
import { JobStatus } from '@app/models/enums';
import * as batchSelectors from '@app/modules/projects/state/selectors';
import { PaymentRequestProgress } from '@app/models/payment-request/payment-request-progress';

@Component({
  selector: 'app-payments-processing-bar',
  templateUrl: './payments-processing-bar.component.html',
  styleUrls: ['./payments-processing-bar.component.scss'],
})
export class PaymentsProcessingBarComponent implements OnDestroy {
  @Input() request: PaymentRequest;

  readonly acceptPaymentRequestData$ = this.store.select(batchSelectors.acceptPaymentRequestData);
  protected channel: Channel;

  public progressWidth: string = '0%';
  public progressValue: string = '0';
  public progressCurrentCount: number = 0;
  public progressTotalCount: number = 0;

  constructor(
    private store: Store<any>,
    private readonly pusher: PusherService,
    private readonly enumToArrayPipe: EnumToArrayPipe,

  ) {

  }

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  ngOnInit() {
    this.acceptPaymentRequestData$.pipe(
      filter(data => data !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      if (this.channel) {
        this.pusher.unsubscribeChannel(this.channel);
      }
      this.channel = this.pusher.subscribeChannel(
        data.name,
        this.enumToArrayPipe.transformToKeysArray(JobStatus),
        this.acceptPaymentRequestCallback.bind(this),
      );
    });
  }

  private acceptPaymentRequestCallback(data: PaymentRequestProgress, event: string) {
    switch (event) {
      case JobStatus[JobStatus.Progress]: {
        const result = data as PaymentRequestProgress;
        this.progressCurrentCount = result.CurrentRow;
        this.progressTotalCount = result.TotalRows;
        this.progressValue = <any>((result.CurrentRow * 100) / result.TotalRows);
        this.progressWidth = `${this.progressValue}%`;
        break;
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
