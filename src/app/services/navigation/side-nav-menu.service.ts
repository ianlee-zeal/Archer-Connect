import { Injectable } from '@angular/core';
import { BaseNavService } from './base-nav.service';

@Injectable({ providedIn: 'root' })
export class SideNavMenuService extends BaseNavService {
  public visible: boolean = true;
  public isExpanded: boolean = true;

  expandMenu() {
    this.isExpanded = true;
  }

  collapseMenu() {
    this.isExpanded = false;
  }

  injectMainMenu() {
    this.expandMenu();
    super.injectMainMenu();
  }

  public hide() {
    this.visible = false;
  }

  public show() {
    this.visible = true;
  }
}
