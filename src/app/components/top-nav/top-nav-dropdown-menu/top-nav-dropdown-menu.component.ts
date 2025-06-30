import { UserInfo } from './../../../models/users/user-info';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';

/**
 * Dropdown menu for top navigation bar
 *
 * @export
 * @class TopNavDropdownMenuComponent
 */
@Component({
  selector: 'app-top-nav-dropdown-menu',
  templateUrl: './top-nav-dropdown-menu.component.html',
  styleUrls: ['./top-nav-dropdown-menu.component.scss']
})
export class TopNavDropdownMenuComponent {
  constructor(
    private readonly permissionService: PermissionService,
  ) {  }

  /**
   * Event fired when menu should be closed
   *
   * @memberof TopNavDropdownMenuComponent
   */
  @Output()
  readonly close = new EventEmitter();

  /**
   * Event fired when current user should logout from the system
   *
   * @memberof TopNavDropdownMenuComponent
   */
  @Output()
  readonly logout = new EventEmitter();

  /**
   * Event fired when user must switch to another organization
   *
   * @memberof TopNavDropdownMenuComponent
   */
  @Output()
  readonly switchOrganization = new EventEmitter<number>();

  /**
   * Event fired when user must switch to default organization
   *
   * @memberof TopNavDropdownMenuComponent
   */
  @Output()
  readonly switchToDefaultOrganization = new EventEmitter<number>();

  /**
   * Event fired when user should impersonate another organization
   *
   * @memberof TopNavDropdownMenuComponent
   */
  @Output()
  readonly impersonateOrganization = new EventEmitter<number>();

  /**
   * Event fired when current user should logout from the system
   *
   * @memberof TopNavDropdownMenuComponent
   */
  @Output()
  readonly depersonateOrganization = new EventEmitter();

  /**
   * Gets or sets current user information
   *
   * @type {UserInfo}
   * @memberof TopNavDropdownMenuComponent
   */
  @Input()
  user: UserInfo;

  /**
   * Gets or sets the flag indicating that user can switch to default organization (Archer)
   *
   * @type {boolean}
   * @memberof TopNavDropdownMenuComponent
   */
  @Input()
  canSwitchToDefaultOrg: boolean;

  switchOrganizationPermission = PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.SwitchOrganization);
  impersonateOrgPermission: string = PermissionService.create(PermissionTypeEnum.ImpersonateOrg, PermissionActionTypeEnum.Read);

  get showHorizontalRule(): boolean {
    return this.permissionService.has(this.impersonateOrgPermission) || this.permissionService.has(this.switchOrganizationPermission) || this.isImpersonating;
  }

  get isImpersonating(): boolean {
    return this.user && this.user.isImpersonating;
  }
}
