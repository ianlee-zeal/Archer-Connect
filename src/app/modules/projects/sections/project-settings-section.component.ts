import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-project-settings-section',
  templateUrl: './project-section.component.html',
})
export class ProjectSettingsSectionComponent {
  private readonly tabsUrl = './tabs';

  constructor(private readonly permissionService: PermissionService) {
    this.selectOldDeficienciesSettingsTab();
    this.createReportingTab();
  }

  public readonly tabs: TabItem[] = [
    {
      title: 'Scope Of Work',
      link: `${this.tabsUrl}/scope-of-work`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectSettings, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Receivables',
      link: `${this.tabsUrl}/receivables`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectSettings, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Contract Rules',
      link: `${this.tabsUrl}/contract-rules`,
      permission: PermissionService.create(PermissionTypeEnum.BillingRule, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Ledger Settings',
      link: `${this.tabsUrl}/settings`,
      permission: PermissionService.create(PermissionTypeEnum.LedgerSettings, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Chart Of Accounts',
      link: `${this.tabsUrl}/accounts`,
      permission: PermissionService.create(PermissionTypeEnum.ChartOfAccounts, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Project Messaging',
      link: `${this.tabsUrl}/messaging`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectMessaging, PermissionActionTypeEnum.Read),
    },
    {
      title: 'QSF Admin Deficiencies',
      link: `${this.tabsUrl}/deficiencies`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.ManageDeficienciesSettingsTemplates),
    }
  ];

  private selectOldDeficienciesSettingsTab(): void {
    const projectDeficienciesReadPermission = PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.Read);
    const manageDeficienciesSettingsTemplatesPermission = PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.ManageDeficienciesSettingsTemplates);
    if (this.permissionService.has(projectDeficienciesReadPermission) && !this.permissionService.has(manageDeficienciesSettingsTemplatesPermission)) {
      this.tabs.push({
        title: 'QSF Admin Deficiencies',
        link: `${this.tabsUrl}/deficiencies/old-details`,
      });
    }
  }

  private createReportingTab(): void {
    this.tabs.push({
      title: 'Reporting',
      link: `${this.tabsUrl}/reporting`,
      permission: PermissionService.create(PermissionTypeEnum.ReportSettings, PermissionActionTypeEnum.Read),
    })
  }
}
