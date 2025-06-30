import { OnDestroy, OnInit, Directive } from '@angular/core';

import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Directive()
export abstract class CommunicationPageBase implements OnInit, OnDestroy {
  private permissionType = PermissionTypeEnum.CommunicationNotes;
  protected readonly canReadNotes = this.permissionService.canRead(this.permissionType);

  readonly tabs: TabItem[] = [];

  constructor(
    protected readonly permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    if (this.canReadNotes) {
      this.tabs.push({
        title: 'Notes',
        link: './notes',
        permission: PermissionService.create(this.permissionType, PermissionActionTypeEnum.Read),
      });
    }
  }

  abstract ngOnDestroy(): void;
}
