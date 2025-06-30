import { Component } from '@angular/core';

@Component({
  selector: 'app-project-claimant-list-section',
  templateUrl: './project-section.component.html'
})

export class ProjectClaimantListSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs = [
    { title: 'Claimants List', link: `${this.tabsUrl}/overview` },
  ];
}
