import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-accounting-details-section',
  templateUrl: './project-section.component.html',
})
export class AccountingDetailsSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Fees',
      link: `${this.tabsUrl}/invoice-items`,
      permission: PermissionService.create(PermissionTypeEnum.AccountingDetails, PermissionActionTypeEnum.Read),
    },
  ];
}
