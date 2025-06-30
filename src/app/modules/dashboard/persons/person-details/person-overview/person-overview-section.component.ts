import { Component } from '@angular/core';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { TabItem } from '@app/models';

@Component({
  selector: 'app-person-overview-section',
  templateUrl: './person-section.component.html',
})
export class PersonOverviewSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Details',
      link: `${this.tabsUrl}/details`,
      permission: PermissionService.create(PermissionTypeEnum.Persons, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Addresses',
      link: `${this.tabsUrl}/addresses`,
      permission: PermissionService.create(PermissionTypeEnum.PersonAddresses, PermissionActionTypeEnum.Read),
    },
    // hide Contacts tab on Persons page - https://jira.s3betaplatform.com/browse/AC-4721
    // {
    //   title: 'Contacts',
    //   link: `${this.tabsUrl}/contacts`,
    //   permission: PermissionService.create(PermissionTypeEnum.PersonRelationship, PermissionActionTypeEnum.Read),
    // },
  ];
}
