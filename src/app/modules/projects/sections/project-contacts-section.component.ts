import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-project-contacts-section',
  templateUrl: './project-section.component.html',
})
export class ProjectContactsSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Contacts',
      link: `${this.tabsUrl}/info`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectSettings, PermissionActionTypeEnum.Read),
    },
  ];
}
