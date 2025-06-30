import { Component } from '@angular/core';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state';
import { TabItem } from '@app/models';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-payment-instructions-section',
  templateUrl: './payment-section.component.html',
})
export class PaymentInstructionsSectionComponent {
  protected readonly tabsUrl = './tabs';

  public actionbar$ = this.store.select(selectors.actionBar);
  public headerTitle$ = this.store.select(selectors.headerTitle);

  public readonly tabs: TabItem[] = [
    {
      title: 'Bank Accounts',
      link: `${this.tabsUrl}/bank-accounts`,
      permission: PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Payment Instructions',
      link: `${this.tabsUrl}/payment-instructions`,
      permission: PermissionService.create(PermissionTypeEnum.OrganizationPaymentInstruction, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Payment Settings',
      link: `${this.tabsUrl}/payment-settings`,
      permission: PermissionService.create(PermissionTypeEnum.OrganizationPaymentInstruction, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Documents',
      link: `${this.tabsUrl}/documents`,
      permission: PermissionService.create(PermissionTypeEnum.OrganizationDocuments, PermissionActionTypeEnum.Read),
    },
  ];

  constructor(
    private readonly store: Store<AppState>,
  ) {
  }
}
