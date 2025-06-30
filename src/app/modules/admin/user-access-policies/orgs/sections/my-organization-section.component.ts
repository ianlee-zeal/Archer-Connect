import { Component } from '@angular/core';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';

@Component({
  selector: 'app-my-organization-section',
  templateUrl: './org-section.component.html',
})
export class MyOrganizationSectionComponent {
  public readonly tabs = [
    {
      title: 'Details',
      link: './tabs/details',
    },
    {
      title: 'Types',
      link: './tabs/types',
      permission: PermissionService.create(PermissionTypeEnum.OrganizationTypes, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Addresses',
      link: './tabs/addresses',
      permission: PermissionService.create(PermissionTypeEnum.OrganizationAddresses, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Documents',
      link: './tabs/documents',
      permission: PermissionService.create(PermissionTypeEnum.OrganizationDocuments, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Notes',
      link: './tabs/notes',
      permission: PermissionService.create(PermissionTypeEnum.OrganizationNotes, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Portal Access Projects',
      link: './tabs/portal-access',
      permission: PermissionService.create(PermissionTypeEnum.OrgPortalAccess, PermissionActionTypeEnum.Read),
    },
  ];
}
