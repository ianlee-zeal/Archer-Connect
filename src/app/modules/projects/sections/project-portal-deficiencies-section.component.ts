import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-project-portal-deficiencies-section',
  templateUrl: './project-section.component.html',
})
export class ProjectPortalDeficienciesSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Deficiencies',
      link: `${this.tabsUrl}/deficiencies-list`,
    },
    {
      title: 'Recent Reports',
      link: `${this.tabsUrl}/recent-reports`,
      permission:  PermissionService.create(PermissionTypeEnum.ProjectDeficiencies, PermissionActionTypeEnum.RecentReports),
    },
  ];
}
