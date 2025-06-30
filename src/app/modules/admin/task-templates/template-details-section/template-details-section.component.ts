import { Component } from '@angular/core';
import { EntityTypeEnum } from '@app/models/enums';
import { TabItem } from '@app/models';
import { SectionContainingTabsComponent } from '@app/modules/shared/_abstractions/section-containing-tabs.component';

@Component({
  selector: 'app-template-details-section',
  templateUrl: './template-details-section.component.html',
})
export class TemplateDetailsSectionComponent extends SectionContainingTabsComponent {
  entityType = EntityTypeEnum.Clients;
  private readonly tabsUrl = './tabs';

  protected readonly tabTitles = { [EntityTypeEnum.Addresses]: 'Sub-tasks' };

  public readonly tabs: TabItem[] = [
    {
      title: 'Sub-tasks',
      link: `${this.tabsUrl}/sub-tasks`,
    },

  ];
}
