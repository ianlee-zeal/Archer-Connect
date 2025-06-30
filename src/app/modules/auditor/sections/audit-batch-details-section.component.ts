import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-audit-batch-details-section',
  templateUrl: './auditor-section.component.html',
})
export class AuditBatchDetailsSectionComponent {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Audit Details',
      link: `${this.tabsUrl}/audit-details`,
      permission: PermissionService.create(PermissionTypeEnum.DataProcessingAuditor, PermissionActionTypeEnum.Read),
    },
  ];
}
