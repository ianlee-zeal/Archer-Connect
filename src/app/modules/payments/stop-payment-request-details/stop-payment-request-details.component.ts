import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';

import { AppState } from '@app/state/index';

import { StopPaymentRequest } from '@app/models/stop-payment-request';
import { YesNoPipe } from '@app/modules/shared/_pipes';
import { EntityTypeEnum } from '@app/models/enums';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';

@Component({
  selector: 'app-stop-payment-request-details',
  templateUrl: './stop-payment-request-details.component.html',
  styleUrls: ['./stop-payment-request-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StopPaymentRequestDetailsComponent implements OnInit {
  private readonly ngUnsubscribe$ = new Subject<void>();
  public readonly payment$ = this.store.select(selectors.item);
  public stopPaymentRequest: StopPaymentRequest;

  constructor(
    private readonly store: Store<AppState>,
    private readonly yesNoPipe: YesNoPipe,
  ) { }

  ngOnInit() {
    this.payment$
      .pipe(
        filter(data => !!data),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(data => {
        this.stopPaymentRequest = data.stopPaymentRequest;
      });
  }

  getStatusOfRequest(): string {
    return this.stopPaymentRequest.statusDescription ?? this.stopPaymentRequest.status.name;
  }

  viewDetails() {
    this.store.dispatch(actions.OpenStopPaymentRequestModal({ paymentId: this.stopPaymentRequest.paymentId, canEdit: false, loadPayment: false }));
  }

  downloadAttachments() {
    this.store.dispatch(actions.DownloadAttachments({ id: this.stopPaymentRequest.id, entityType: EntityTypeEnum.StopPaymentRequest }));
  }

  getAddressChange() {
    return this.yesNoPipe.transform(!this.stopPaymentRequest.isAddressCorrect);
  }

  getFullResendReason() {
    return `${this.stopPaymentRequest.resendReason?.name}  ${this.stopPaymentRequest.resendReasonSpecification ? `/ ${this.stopPaymentRequest.resendReasonSpecification?.name}` : ''} `;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
