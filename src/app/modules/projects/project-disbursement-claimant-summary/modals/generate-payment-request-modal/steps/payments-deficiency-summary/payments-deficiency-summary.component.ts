import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { ActionsSubject, Store } from '@ngrx/store';

import * as fromShared from '@app/modules/shared/state';
import * as projectActions from '@app/modules/projects/state/actions';
import { filter, takeUntil } from 'rxjs/operators';
import { PaymentRequest } from '@app/models';
import { ofType } from '@ngrx/effects';
import { PaymentRequestReviewOptions } from '@app/models/payment-request/payment-request-options';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { PusherService } from '@app/services/pusher.service';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { JobStatus } from '@app/models/enums';
import { RequestReviewOption } from '@app/models/payment-request/payment-request-review-result';
import { Subject } from 'rxjs';
import { Channel } from 'pusher-js';

@Component({
  selector: 'app-payments-deficiency-summary',
  templateUrl: './payments-deficiency-summary.component.html',
  styleUrls: ['./payments-deficiency-summary.component.scss'],
})
export class PaymentsDeficiencySummaryComponent  implements OnInit, OnDestroy {
  @Input() public paymentRequest: PaymentRequest;
  @Input() public projectId: number;

  @Output()
  readonly finish = new EventEmitter();

  @Output()
  readonly fail = new EventEmitter<string>();

  @Output()
  readonly warning = new EventEmitter<PaymentRequest>();


  readonly paymentRequesDeficiencies$ = this.store.select(projectSelectors.paymentRequesDeficiencies);
  readonly criticalDeficiencies$ = this.store.select(projectSelectors.paymentRequestCriticalDeficiencies);
  readonly updatePaymentRequestData$ = this.store.select(projectSelectors.updatePaymentRequestData);

  public submitting = false;
  public loadingWarningData = false;
  public paymentRequesDeficiencies: RequestReviewOption[];

  private ngUnsubscribe$ = new Subject<void>();
  private channel: Channel;

  constructor(
    private readonly store: Store<fromShared.AppState>,
    private readonly actionsSubj: ActionsSubject,
    private readonly pusher: PusherService,
    private readonly enumToArrayPipe: EnumToArrayPipe,
  ) {
  }

  ngOnInit() {
    this.actionsSubj.pipe(
      ofType(projectActions.GetPaymentRequestDataSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.finish.emit();
    });

    this.actionsSubj.pipe(
      ofType(projectActions.GetPaymentRequestReviewWarningsSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.loadingWarningData = false;
    });

    this.updatePaymentRequestData$.pipe(
      filter(data => data !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      this.unsubscribeFromChannel();
      this.channel = this.pusher.subscribeChannel(
        data.name,
        this.enumToArrayPipe.transformToKeysArray(JobStatus),
        this.generatePaymentRequestCallback.bind(this),
        () => this.store.dispatch(projectActions.StartPaymentRequestJob({ paymentRequestId: this.paymentRequest.Id })),
      );
    });

    this.paymentRequesDeficiencies$.pipe(
      filter(data => !!data),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      this.paymentRequesDeficiencies = data;
    });

    this.loadingWarningData= true;
    this.store.dispatch(projectActions.GetPaymentRequestReviewWarnings({
      projectId: this.projectId,
      paymentRequestId: this.paymentRequest.Id,
      documentId: this.paymentRequest.ReviewDocId,
    }));
  }

  submit() {
    const paymentRequestReviewOptions: PaymentRequestReviewOptions = {
      options: this.paymentRequesDeficiencies.map(RequestReviewOption.toDto)
    };
    this.store.dispatch(projectActions.UpdatePaymentRequest({
      paymentRequestId: this.paymentRequest.Id,
      params: { paymentRequestReviewOptions },
    }));
    this.submitting = true;
  }

  private generatePaymentRequestCallback(data: PaymentRequest | string, event: string) {
    switch (event) {
      case JobStatus[JobStatus.ProcessingCompleted]: {
        const result = data as PaymentRequest;
        if (result.ProcessDocId) {
          this.store.dispatch(projectActions.GeneratePaymentRequestJobSuccess());
          this.finish.emit(result);
        } else {
          this.store.dispatch(projectActions.GeneratePaymentRequestJobFailed());
          this.fail.emit(data ? data as string : 'Completed with empty response.');
        }
        this.stopSubmitting();
        this.unsubscribeFromChannel();
        break;
      }

      case JobStatus[JobStatus.Warning]:
        this.store.dispatch(projectActions.GeneratePaymentRequestJobFailed());
        this.warning.emit(data as PaymentRequest);
        this.stopSubmitting();
        break;
      case JobStatus[JobStatus.Error]:
        this.store.dispatch(projectActions.GeneratePaymentRequestJobFailed());
        this.fail.emit(data as string);
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
  }

  ngOnDestroy(): void {
    this.unsubscribeFromChannel();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
