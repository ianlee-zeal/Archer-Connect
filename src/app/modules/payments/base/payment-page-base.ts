import { Directive, OnDestroy, OnInit } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { AppState } from '@app/state/index';
import { PaymentVoidService } from '@app/services/payment/payment-void.service';
import { Payment, TabItem } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { PermissionTypeEnum, PermissionActionTypeEnum, PaymentMethodEnum, PaymentProviderEnum } from '@app/models/enums';
import { PermissionService, ToastService } from '@app/services';
import { StopPaymentRequestStatusEnum } from '@app/models/enums/payment-status.enum';
import { ofType } from '@ngrx/effects';
import { filter, takeUntil } from 'rxjs/operators';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';

@Directive()
export abstract class AbstractPaymentPage implements OnInit, OnDestroy {
  public payment: Payment;
  public paymentId: number;
  public requiredActionBar: ActionHandlersMap = {
    stopPaymentRequest: {
      callback: () => this.showStopPaymentModal(),
      disabled: () => this.isDisabledStopPaymentRequest() || (!this.isPaymentMethodCheck() && !(this.isPaymentMethodDigital() && this.isWesternAllianceProvider())),
      permissions: PermissionService.create(PermissionTypeEnum.StopPaymentRequest, PermissionActionTypeEnum.Create),
    },
    voidPayment: {
      callback: () => this.onClickVoidPayment(),
      disabled: () => this.paymentVoidService.isDisabledVoidPaymentAction(this.payment),
      tooltip: () => this.paymentVoidService.tooltipTextVoidPayment(this.payment),
      permissions: PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.VoidPayments),
    },
    checkVerification: {
      callback: () => this.showCheckVerificationModal(),
      disabled: () => this.isDisabledCheckVerificationAction(),
      permissions: PermissionService.create(PermissionTypeEnum.CheckVerification, PermissionActionTypeEnum.Create),
    },
  };
  protected readonly ngUnsubscribe$ = new Subject<void>();

  public readonly payment$ = this.store.select(selectors.item);

  public abstract tabs: TabItem[];
  protected readonly PMT_DETAILS_TITLE = 'Payment Details';
  protected readonly TR_DETAILS_TITLE = 'Transfer Details';
  protected readonly CHECK_VERIFICATION_TITLE = 'Check Verification';
  protected readonly PMT_ITEM_DETAILS_TITLE = 'Payment Item Details';
  protected readonly TR_ITEM_DETAILS_TITLE = 'Transfer Item Details';

  constructor(
    protected readonly store: Store<AppState>,
    protected readonly paymentVoidService: PaymentVoidService,
    protected readonly actionsSubj: ActionsSubject,
    protected readonly toaster: ToastService,
  ) {
  }
  public ngOnInit(): void {
    this.actionsSubj.pipe(
      ofType(
        actions.VoidPaymentRequestSuccess,
      ),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.store.dispatch(actions.GetPaymentDetails({ paymentId: this.paymentId }));
    });
    this.payment$
      .pipe(
        filter(p => !!p),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(payment => {
        this.payment = payment;
        if (payment.checkVerifications?.length) {
          this.toaster.showWarning('Check Verification has been performed on this payment');
        }
      });
  }

  showStopPaymentModal(): void {
    this.store.dispatch(actions.OpenStopPaymentRequestModal({ paymentId: this.paymentId, canEdit: true, loadPayment: false }));
  }

  private isDisabledStopPaymentRequest(): boolean {
    return !!this.payment?.stopPaymentRequest && this.payment?.stopPaymentRequest?.status?.id !== StopPaymentRequestStatusEnum.RejectedWrongCheck;
  }

  private isPaymentMethodCheck(): boolean {
    return this.payment?.paymentMethod?.id === PaymentMethodEnum.Check;
  }

  private isPaymentMethodDigital(): boolean {
    return this.payment?.paymentMethod?.id === PaymentMethodEnum.DigitalPayment;
  }

  private isWesternAllianceProvider(): boolean {
    return this.payment?.acPaymentProviderId == PaymentProviderEnum.WesternAlliance;
  }

  protected onClickVoidPayment(): void {
    const showNoteField = this.payment?.disbursementGroupClaimantId != null || this.payment?.caseId != null;
    this.paymentVoidService.showConfirmationDialog(showNoteField).subscribe(answer => {
      const isBooleanAnswer = typeof(answer) == 'boolean';
      const confirmed = isBooleanAnswer ? answer : answer.confirmed;
      const note = isBooleanAnswer ? null : answer.note;
      if (!confirmed) {
        return;
      }

      if (this.paymentVoidService.isSPRWithDuplicateWarningStatus(this.payment?.stopPaymentRequest?.status?.id)) {
        this.paymentVoidService.showDuplicateWarningConfirmationDialog().subscribe(answerWarning => {
          if (answerWarning) {
            this.voidPayment(note);
          }
        });
      } else {
        this.voidPayment(note);
      }
    });
  }

  protected voidPayment(note: string): void {
    this.store.dispatch(actions.VoidPaymentRequest({ id: this.paymentId, note }));
  }

  private isDisabledCheckVerificationAction(): boolean {
    return (!!this.payment?.stopPaymentRequest
      && this.payment?.stopPaymentRequest?.status?.id !== StopPaymentRequestStatusEnum.RejectedWrongCheck)
      || this.payment?.checkVerifications?.length > 1
      || this.payment?.paymentMethod?.id !== PaymentMethodEnum.Check;
  }

  private showCheckVerificationModal(): void {
    this.store.dispatch(actions.OpenCheckVerificationModal({ paymentId: this.paymentId, canEdit: true }));
  }

  protected updateTabNamesPaymentOrTransfer(payment: Payment): void {
    const detailsTab = this.tabs.find((t: TabItem) => t.title === this.PMT_DETAILS_TITLE || t.title === this.TR_DETAILS_TITLE);
    const checkVerificationTab = this.tabs.find((t: TabItem) => t.title === this.CHECK_VERIFICATION_TITLE);
    const itemsTab = this.tabs.find((t: TabItem) => t.title === this.PMT_ITEM_DETAILS_TITLE || t.title === this.TR_ITEM_DETAILS_TITLE);

    if (payment?.hasTransferItems) {
      detailsTab.title = this.TR_DETAILS_TITLE;
      itemsTab.title = this.TR_ITEM_DETAILS_TITLE;
    } else {
      detailsTab.title = this.PMT_DETAILS_TITLE;
      itemsTab.title = this.PMT_ITEM_DETAILS_TITLE;
    }
    checkVerificationTab.inactive = payment.hasTransferItems;
  }

  protected getActionBarPaymentOrTransfer(payment: Payment): ActionHandlersMap {
    if (payment?.hasTransferItems) {
      return {
        // back button is added in details in getActionBarContent
        voidPayment: this.requiredActionBar.voidPayment,
      };
    }
    return {
      // back button is added in details in getActionBarContent
      ...this.requiredActionBar,
    };
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ResetStopPaymentRequest());
    this.store.dispatch(actions.ResetPaymentDetails());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
