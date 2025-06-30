import { Component } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Params } from '@angular/router';

import * as commonActions from 'src/app/modules/projects/state/actions';
import { PaymentVoidService } from '@app/services/payment/payment-void.service';
import { AbstractPaymentPage } from '@app/modules/payments/base/payment-page-base';
import { AppState } from '@app/state';
import { PermissionService, ToastService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { Payment, TabItem } from '@app/models';
import * as paymentSelectors from '@app/modules/payments/state/selectors';
import * as paymentActions from '@app/modules/payments/state/actions';

@Component({
  selector: 'app-project-payments-details',
  templateUrl: './project-payments-details.component.html',
})
export class ProjectPaymentsDetailsComponent extends AbstractPaymentPage {
  constructor(
    protected readonly store: Store<AppState>,
    private readonly route: ActivatedRoute,
    protected readonly paymentVoidService: PaymentVoidService,
    protected readonly actionsSubj: ActionsSubject,
    protected readonly toaster: ToastService,
  ) {
    super(store, paymentVoidService, actionsSubj, toaster);
  }

  public readonly checkVerificationCount$ = this.store.select(paymentSelectors.checkVerificationCount);
  public readonly payment$ = this.store.select(paymentSelectors.item);

  private readonly tabsUrl = './tabs';
  public readonly tabs: TabItem[] = [
    {
      title: this.PMT_DETAILS_TITLE,
      link: `${this.tabsUrl}/details`,
      permission: PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
    },

    {
      title: this.CHECK_VERIFICATION_TITLE,
      link: `${this.tabsUrl}/check-verification`,
      count: this.checkVerificationCount$,
      permission: PermissionService.create(PermissionTypeEnum.CheckVerification, PermissionActionTypeEnum.Read),
    },
    {
      title: this.PMT_ITEM_DETAILS_TITLE,
      link: `${this.tabsUrl}/payment-item-details`,
      permission: PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
    },
  ];

  ngOnInit(): void {
    super.ngOnInit();

    this.route.params
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((params: Params) => {
        this.paymentId = params.id;
        if (params.id) {
          this.store.dispatch(paymentActions.GetPaymentDetails({ paymentId: params.id }));
        }
      });

    this.payment$
      .pipe(
        filter((p: Payment) => !!p),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((payment: Payment) => {
        this.updateTabNamesPaymentOrTransfer(payment);
        const actionBar = this.getActionBarPaymentOrTransfer(payment);
        this.store.dispatch(commonActions.UpdateActionBar({
          actionBar,
        }));
      });
  }
}
