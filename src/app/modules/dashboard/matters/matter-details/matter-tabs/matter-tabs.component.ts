import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-matter-tabs',
  templateUrl: './matter-tabs.component.html',
})
export class MatterTabsComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    { title: 'Tort Details', link: `${this.tabsUrl}/matter-information` },
    {
      title: 'Notes',
      link: `${this.tabsUrl}/matter-notes`,
      permission: PermissionService.create(PermissionTypeEnum.MatterNotes, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Documents',
      link: `${this.tabsUrl}/matter-documents`,
      permission: PermissionService.create(PermissionTypeEnum.MatterDocuments, PermissionActionTypeEnum.Read),
    },
    { title: 'Related Settlements', link: `${this.tabsUrl}/related-settlements` },
  ];
}
