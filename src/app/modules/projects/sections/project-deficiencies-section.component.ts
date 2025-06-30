import { Component } from '@angular/core';
import { TabItem } from '@app/models';

@Component({
  selector: 'app-project-deficiencies-section',
  templateUrl: './project-section.component.html',
})
export class ProjectDeficienciesSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Deficiencies List',
      link: `${this.tabsUrl}/deficiencies-list`,
    },
  ];
}
