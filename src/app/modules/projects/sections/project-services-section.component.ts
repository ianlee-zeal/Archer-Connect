import { Component } from '@angular/core';

@Component({
  selector: 'app-project-services-section',
  templateUrl: './project-section.component.html'
})
export class ProjectServicesSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs = [
    { title: 'Overview', link: `${this.tabsUrl}/overview` },
  ];
}
