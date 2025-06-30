import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';

import { PermissionService } from '@app/services';
import { PermissionConsolePrinterService } from '@app/services/permissions-console-printer.service';

@Directive({ selector: '[permissions]' })
export class PermissionDirective {
  @Input() permissions: string | string[];

  private static printPermissionsToConsoleFlag: boolean | null = null;

  constructor(
    private readonly service: PermissionService,
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
    private readonly permissionConsolePrinterService: PermissionConsolePrinterService,
  ) {
    if (PermissionDirective.printPermissionsToConsoleFlag === null) {
      PermissionDirective.printPermissionsToConsoleFlag = this.service.has(`${PermissionTypeEnum.TracePermissions}-${PermissionActionTypeEnum.Read}`)
      console.log(`setting printPermissionsToConsoleFlag, value = ${PermissionDirective.printPermissionsToConsoleFlag}`);
    }
  }

  ngOnInit() {
    const hasAccess = this.service.has(this.permissions);

    if (PermissionDirective.printPermissionsToConsoleFlag) {
      this.permissionConsolePrinterService.printPermissionsCheckToConsole(this.permissions, hasAccess);
    }
    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
