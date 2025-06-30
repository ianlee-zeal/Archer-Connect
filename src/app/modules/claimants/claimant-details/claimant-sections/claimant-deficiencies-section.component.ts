import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { ClaimantSectionBase } from './claimant-section-base.component';

@Component({
  selector: 'app-claimant-deficiencies-section',
  templateUrl: './claimant-section.component.html',
  styleUrls: ['./claimant-section.component.scss'],
})
export class ClaimantsDeficienciesSectionComponent implements ClaimantSectionBase {
  isClaimantInfoExpanded: boolean = true;
  isExpandable: boolean = false;
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Deficiencies List',
      link: `${this.tabsUrl}/deficiencies-list`,
    },
  ];
}
