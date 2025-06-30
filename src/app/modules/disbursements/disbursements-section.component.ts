import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { AppState } from '@app/state';
import { Store } from '@ngrx/store';
import * as selectors from './state/selectors';

@Component({
  selector: 'app-disbursements-section',
  templateUrl: './disbursements-section.component.html',
})
export class DisbursementsSectionComponent {
  public actionbar$ = this.store.select(selectors.actionBar);
  protected readonly tabsUrl = './tabs';
  public readonly tabs: TabItem[] = [
    {
      title: 'Payment Requests',
      link: `${this.tabsUrl}/payment-requests`,
      permission: PermissionService.create(PermissionTypeEnum.GlobalDisbursementSearch, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Transfer Requests',
      link: `${this.tabsUrl}/transfer-requests`,
      permission: PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferToSubAccount),
    },
    {
      title: 'Stop Payment Request',
      link: `${this.tabsUrl}/stop-payment-requests`,
      permission: PermissionService.create(PermissionTypeEnum.StopPaymentRequest, PermissionActionTypeEnum.Read),
    },
  ];

  constructor(
    private readonly store: Store<AppState>,
  ) {
  }
}
