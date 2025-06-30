import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

import { AppState } from '@app/state/index';

import { ActivatedRoute } from '@angular/router';
import { TooltipPositionEnum } from '@app/models/enums/tooltip-position.enum';
import * as actions from '../state/actions';
import { item } from '../state/selectors';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.scss'],
})
export class PaymentDetailsComponent implements OnInit {
  protected readonly ngUnsubscribe$ = new Subject<void>();
  public readonly payment$ = this.store.select(item);

  public tooltipPosition: TooltipPositionEnum = TooltipPositionEnum.Right;
  public digitalPaymentCreatedDateTooltip: string = 'Date the claimant was included in the roster file';
  public digitalPaymentSubmittedDateTooltip: string = 'Date of most recent claimant payment selection';
  public digitalPaymentDisbursedDateTooltip: string = 'Disbursement initiated via claimant\'s selected payment method';
  public digitalPaymentFinishedDateTooltip: string = 'Date WAB received confirmation file from payment platform; usually means the payment was completed, unless status is "Unsuccessful"';

  constructor(
    protected readonly store: Store<AppState>,
    protected readonly route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.params
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(params => {
        if (params.id) {
          this.store.dispatch(actions.GetPaymentDetails({ paymentId: params.id }));
        }
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  showDigitalValue(value?: string | Date, paymentProviderName?: string): string | Date {
    if (paymentProviderName === 'Western Alliance') {
      return value;
    }
    return null;
  }

  public truncatePayeeName(payeeName: string, maxLength: number = 35): { displayName: string; fullName: string } {
    if (!payeeName) return { displayName: '', fullName: '' };
    return {
      displayName: payeeName.length > maxLength ? payeeName.slice(0, maxLength) + '...' : payeeName,
      fullName: payeeName,
    };
  }
}
