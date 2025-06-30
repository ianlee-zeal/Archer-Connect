import { Component } from '@angular/core';
import { ContextBarElement } from '@app/entities';
import { CurrencyHelper } from '@app/helpers';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PaymentQueueCounts } from '@app/models/payment-queue-counts';
import * as selectors from '@app/modules/projects/state/selectors';
import { PermissionService } from '@app/services';
import { AppState } from '@app/state';
import { Store } from '@ngrx/store';
import { filter, Subject, takeUntil } from 'rxjs';
import { paymentQueueCounts } from '../projects/project-disbursement-payment-queue/state/selectors';
import * as projectActions from '../projects/state/actions';

@Component({
  selector: 'app-payment-queue-section',
  templateUrl: './payment-queue-section.component.html',
})
export class PaymentQueueSectionComponent {
  public headerElements: ContextBarElement[];
  private readonly globalPaymentQueueCounts$ = this.store.select(paymentQueueCounts);
  protected ngUnsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.subscribeToGlobalPaymentsQueueCounts();
  }

  constructor(
    private readonly store: Store<AppState>,
  ) {
  }

  public actionbar$ = this.store.select(selectors.actionBar);
  protected readonly tabsUrl = './tabs';
  public readonly tabs: TabItem[] = [
    {
      title: 'Payment Queue',
      link: `${this.tabsUrl}/list`,
      permission: PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.Read),
    },
  ];

  private subscribeToGlobalPaymentsQueueCounts(): void {
    this.globalPaymentQueueCounts$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter((counts: PaymentQueueCounts) => !!counts),
    ).subscribe((counts: PaymentQueueCounts) => {
      this.setGlobalHeader(counts);
    });
  }

  private setGlobalHeader(item: PaymentQueueCounts): void {
    if (item) {
      this.headerElements = [
        { column: 'Pending Count', valueGetter: () => (item.pendingCount > 0 ? item.pendingCount : '0') },
        { column: 'Authorized Count', valueGetter: () => (item.authorizedCount > 0 ? item.authorizedCount : '0') },
        { column: 'Total', valueGetter: () => CurrencyHelper.toUsdFormat({ value: item.totalAmount ? item.totalAmount : 0 }) },
      ];
    }
  }

  public ngOnDestroy(): void {
    this.store.dispatch(projectActions.UpdateContextBar({ contextBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
