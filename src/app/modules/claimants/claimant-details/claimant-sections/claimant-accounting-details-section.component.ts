import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ClaimantSectionBase } from './claimant-section-base.component';

@Component({
  selector: 'app-claimant-accounting-details-section',
  templateUrl: './claimant-section.component.html',
  styleUrls: ['./claimant-section.component.scss'],
})
export class ClaimantAccountingDetailsSectionComponent implements ClaimantSectionBase {
  isClaimantInfoExpanded: boolean = true;
  isExpandable: boolean = false;
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Invoice Items',
      link: `${this.tabsUrl}/invoice-items`,
      permission: PermissionService.create(PermissionTypeEnum.AccountingDetails, PermissionActionTypeEnum.Read),
    },
  ];
}
