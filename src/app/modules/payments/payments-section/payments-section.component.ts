import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { AppState } from '@app/state';
import { Store } from '@ngrx/store';
import * as selectors from './../state/selectors';

@Component({
  selector: 'app-payments-section',
  templateUrl: './payments-section.component.html',
})
export class PaymentsSectionComponent {
  public actionbar$ = this.store.select(selectors.actionBar);
  protected readonly tabsUrl = './tabs';
  public readonly tabs: TabItem[] = [
    {
      title: 'Payments',
      link: `${this.tabsUrl}/payments`,
      permission: PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Transfers',
      link: `${this.tabsUrl}/transfers`,
      permission: PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferToSubAccount),
    }
  ];

  constructor(
    private readonly store: Store<AppState>,
  ) {
  }
}
