import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { SectionContainingTabsComponent } from '@app/modules/shared/_abstractions/section-containing-tabs.component';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-project-overview-section',
  templateUrl: './project-section.component.html',
})
export class ProjectOverviewSectionComponent extends SectionContainingTabsComponent {
  entityType = EntityTypeEnum.Projects;
  private readonly tabsUrl = './tabs';

  protected readonly tabTitles = {
    [EntityTypeEnum.Notes]: 'Notes',
    [EntityTypeEnum.ProjectsCommunications]: 'Communications',
  };

  public readonly tabs: TabItem[] = [
    { title: 'Project Overview',
      link: `${this.tabsUrl}/overview`,
      permission: PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.ProjectOverviewTab),
    },
    { title: 'Details', link: `${this.tabsUrl}/details` },
    {
      title: 'Imports',
      link: `${this.tabsUrl}/imports`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectImports, PermissionActionTypeEnum.Read),
    },
    {
      id: EntityTypeEnum.Notes,
      title: this.tabTitles[EntityTypeEnum.Notes],
      link: `${this.tabsUrl}/notes`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectNotes, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Documents',
      link: `${this.tabsUrl}/documents`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectsDocuments, PermissionActionTypeEnum.Read),
    },
    {
      id: EntityTypeEnum.ProjectsCommunications,
      title: this.tabTitles[EntityTypeEnum.ProjectsCommunications],
      link: `${this.tabsUrl}/communications`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectsCommunications, PermissionActionTypeEnum.Read)
    },
  ];
}
