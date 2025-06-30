import { Component } from "@angular/core";
import { TabItem } from "@app/models";
import { PermissionActionTypeEnum, PermissionTypeEnum } from "@app/models/enums";
import { PermissionService } from "@app/services";

@Component({
    selector: 'app-document-batch-details-section',
    templateUrl: './document-batch-details-section.component.html',
    styleUrls: ['./document-batch-details-section.component.scss']
  })
  export class DocumentBatchDetailsSectionComponent
  {
    private readonly tabsUrl = './tabs';

    public readonly tabs: TabItem[] = [
      {
        title: "Batch Documents",
        link: `${this.tabsUrl}/batch-details`,
        permission: PermissionService.create(PermissionTypeEnum.DocumentBatch, PermissionActionTypeEnum.Read),

      }
    ]
  }