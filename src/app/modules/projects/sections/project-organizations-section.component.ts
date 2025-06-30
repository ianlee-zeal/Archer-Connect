import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-project-organizations-section',
  templateUrl: './project-section.component.html',
})
export class ProjectOrganizationsSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Organizations List',
      link: `${this.tabsUrl}/organizations-list`,
      permission: PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Read),
    },
  ];
}
