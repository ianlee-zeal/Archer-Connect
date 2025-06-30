import { Component } from '@angular/core';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum, EntityTypeEnum } from '@app/models/enums';
import { TabItem } from '@app/models';
import { SectionContainingTabsComponent } from '@app/modules/shared/_abstractions/section-containing-tabs.component';
import { ClaimantSectionBase } from './claimant-section-base.component';

@Component({
  selector: 'app-claimant-overview-section',
  templateUrl: './claimant-section.component.html',
  styleUrls: ['./claimant-section.component.scss'],
})
export class ClaimantOverviewSectionComponent extends SectionContainingTabsComponent implements ClaimantSectionBase {
  entityType = EntityTypeEnum.Clients;
  isClaimantInfoExpanded: boolean = false;
  isExpandable: boolean = true;
  private readonly tabsUrl = './tabs';

  protected readonly tabTitles = {
    [EntityTypeEnum.Addresses]: 'Addresses',
    [EntityTypeEnum.ClaimantsOrganizationAccess]: 'Organization Access',
    [EntityTypeEnum.ClientContacts]: 'Contacts',
    [EntityTypeEnum.Communications]: 'Communications',
    [EntityTypeEnum.Notes]: 'Notes',
    [EntityTypeEnum.Documents]: 'Documents',
  };

  public readonly tabs: TabItem[] = [
    {
      title: 'Claimant Overview',
      link: `${this.tabsUrl}/overview`,
      permission: PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.ClaimantOverviewTab),
    },
    {
      title: 'Details',
      link: `${this.tabsUrl}/details`,
      permission: PermissionService.create(PermissionTypeEnum.Persons, PermissionActionTypeEnum.Read),
    },
    {
      id: EntityTypeEnum.Addresses,
      title: this.tabTitles[EntityTypeEnum.Addresses],
      link: `${this.tabsUrl}/addresses`,
      permission: PermissionService.create(PermissionTypeEnum.PersonAddresses, PermissionActionTypeEnum.Read),
    },
    {
      id: EntityTypeEnum.ClaimantsOrganizationAccess,
      title: this.tabTitles[EntityTypeEnum.ClaimantsOrganizationAccess],
      link: `${this.tabsUrl}/representatives`,
      permission: PermissionService.create(PermissionTypeEnum.ClientOrgAccess, PermissionActionTypeEnum.Read),
    },
    {
      id: EntityTypeEnum.ClientContacts,
      title: this.tabTitles[EntityTypeEnum.ClientContacts],
      link: `${this.tabsUrl}/contacts`,
      permission: PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Read),
    },
    {
      id: EntityTypeEnum.Communications,
      title: this.tabTitles[EntityTypeEnum.Communications],
      link: `${this.tabsUrl}/communications`,
      permission: PermissionService.create(PermissionTypeEnum.ClientCommunications, PermissionActionTypeEnum.Read),
    },
    {
      id: EntityTypeEnum.Notes,
      title: this.tabTitles[EntityTypeEnum.Notes],
      link: `${this.tabsUrl}/notes`,
      permission: PermissionService.create(PermissionTypeEnum.ClientNotes, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Identifiers',
      link: `${this.tabsUrl}/identifiers`,
      permission: PermissionService.create(PermissionTypeEnum.ClientIdentifiers, PermissionActionTypeEnum.Read),
    },
    {
      id: EntityTypeEnum.Documents,
      title: this.tabTitles[EntityTypeEnum.Documents],
      link: `${this.tabsUrl}/documents`,
      permission: PermissionService.create(PermissionTypeEnum.ClientDocuments, PermissionActionTypeEnum.Read),
    },
  ];
}
