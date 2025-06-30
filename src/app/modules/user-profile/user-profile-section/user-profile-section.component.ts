import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionTypeEnum, PermissionActionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-user-profile-section',
  templateUrl: './user-profile-section.component.html',
})
export class UserProfileSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    { title: 'Details', link: `${this.tabsUrl}/details` },
    { title: 'Security Settings', link: `${this.tabsUrl}/security-settings` },
    {
      title: 'Roles',
      link: `${this.tabsUrl}/roles`,
      permission: PermissionService.create(PermissionTypeEnum.UserRoles, PermissionActionTypeEnum.Read),
    },
    //{ title: 'Subscriptions', link: `${this.tabsUrl}/subscriptions` },
    { title: 'Actions Log', link: `${this.tabsUrl}/actions` },
  ];
}
