import { Component } from '@angular/core';
import { TabItem } from '@app/models';

@Component({
  selector: 'app-user-permissions-section',
  templateUrl: './user-profile-section.component.html',
})
export class UserPermissionsSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    { title: 'Permissions', link: `${this.tabsUrl}/permissions` },
  ];
}
