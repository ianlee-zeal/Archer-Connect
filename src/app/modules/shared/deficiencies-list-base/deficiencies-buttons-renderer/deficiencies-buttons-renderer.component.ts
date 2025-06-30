import { Component } from '@angular/core';

import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { GridActionsRendererComponent } from '@app/entities';
import { Deficiency } from '@app/models/deficiency';

@Component({
  selector: 'app-deficiencies-buttons-renderer',
  templateUrl: './deficiencies-buttons-renderer.component.html',
  styleUrls: ['./deficiencies-buttons-renderer.component.scss'],
})
export class DeficienciesButtonsRendererComponent extends GridActionsRendererComponent<Deficiency> {
  public get isDisabled(): boolean {
    const { data } = this.params;
    return !!data.isCured || !data.isOverridePermitted;
  }

  public get title(): string {
    if (this.params?.data?.isCured) {
      return 'Deficiency is not active';
    }
    if (this.isDisabled) {
      return 'Override not permitted for this deficiency type';
    }
    return 'Override Deficiency';
  }

  get hasPermissions(): boolean {
    return this.permissionService.has([
      PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.OverrideDeficiency),
      PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.Edit),
    ]);
  }

  constructor(private readonly permissionService: PermissionService) {
    super();
  }

  onOverrideClick(): void {
    this.params.editHandler(this.params.data);
  }
}
