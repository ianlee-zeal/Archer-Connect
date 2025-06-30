import { Component } from '@angular/core';
import { TabItem } from '@app/models';

@Component({
  selector: 'app-lien-finalization-details-section',
  templateUrl: './lien-finalization-details-section.component.html',
})
export class LienFinalizationDetailsSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Finalization Details',
      link: `${this.tabsUrl}/finalization-details`,
    },
  ];
}
