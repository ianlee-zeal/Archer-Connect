import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavItem } from '@app/models';
import { SideNavMenuService } from '@app/services/navigation/side-nav-menu.service';

@Component({
  selector: 'app-user-profile-permissions-side-nav',
  templateUrl: './user-profile-side-nav.component.html',
})
export class UserProfilePermissionsSideNavComponent implements OnInit, OnDestroy {
  private localMenu: NavItem;

  constructor(
    private sideNavMenuService: SideNavMenuService,
  ) { }

  ngOnInit() {
    this.sideNavMenuService.ejectMainMenu();

    const baseUrl = '/user-profile';

    this.localMenu = new NavItem('My Account', null, null, null, [
      new NavItem('Overview', 'assets/images/My Account.svg', null, `${baseUrl}/permissions`),
    ]);

    this.sideNavMenuService.add(this.localMenu, null, true);
  }

  ngOnDestroy(): void {
    this.sideNavMenuService.remove(this.localMenu.id);
    this.sideNavMenuService.injectMainMenu();
  }
}
