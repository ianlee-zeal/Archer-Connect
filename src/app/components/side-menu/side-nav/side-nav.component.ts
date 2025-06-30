/* eslint-disable no-restricted-globals */
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  ViewRef,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';

import { NavItem } from '@app/models';
import { PermissionService } from '@app/services';

/**
 * Side menu navigation component
 *
 * @export
 * @class SideNavComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent implements OnInit {
  private activeRoute: string;

  /**
   * Gets or sets the flag indicating whether menu is collapsed or expanded
   *
   * @type {boolean}
   * @memberof SideNavComponent
   */
  @Input()
  collapsed: boolean;

  /**
   * Gets or sets menu navigation items
   *
   * @type {NavItem[]}
   * @memberof SideNavComponent
   */
  @Input()
  items: NavItem[];

  /**
   * Event fired after click on the menu item
   *
   * @memberof SideNavComponent
   */
  @Output()
  readonly itemClick = new EventEmitter();

  /**
   * Creates an instance of SideNavComponent.
   * @param {Router} router - application router
   * @param {ChangeDetectorRef} changeRef - reference of change detector
   * @memberof SideNavComponent
   */
  constructor(
    private readonly router: Router,
    private readonly changeRef: ChangeDetectorRef,
    private readonly permissionService: PermissionService,
  ) { }

  /** @inheritdoc */
  ngOnInit() {
    this.activeRoute = window.location.pathname;
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
          this.activeRoute = event.urlAfterRedirects;
          this.changeRef.detectChanges();
        }
      }
    });
  }

  /**
   * Returns true if checked route is an active one
   *
   * @param {string} menuRoute - checked route
   * @returns {boolean}
   * @memberof SideNavComponent
   */

  public isActivePath(menuRoute: string): boolean {
    if (typeof this.activeRoute !== 'string') {
      return false;
    }
    return this.activeRoute === menuRoute || this.activeRoute.startsWith(menuRoute + "/");
  }

  /**
   * Returns true if checked menu item can show child elements
   *
   * @param {NavItem} group - checked menu item
   * @returns {boolean}
   * @memberof SideNavComponent
   */
  public canShowGroup(group: NavItem): boolean {
    if (!group.visible || !this.hasPermittedItems(group)) {
      return false;
    }

    // hide group if menu is minimized and there are no children inside
    if (this.collapsed && !group.hasChildren) return false;

    return true;
  }

  /**
   * Event handler for item click event
   *
   * @param {NavItem} item - clicked item
   * @memberof SideNavComponent
   */
  public onItemClick(item: NavItem) {
    item.action();
    this.itemClick.emit(item);
  }

  private hasPermittedItems(group: NavItem) {
    // item check
    if ((!group.hasChildren && this.permissionService.has(group.permissions))) {
      return true;
    }

    // group check
    if (group.hasChildren && this.permissionService.has(group.permissions)) {
      for (const item of group.items) {
        if (this.hasPermittedItems(item)) {
          return true;
        }
      }
    }

    return false;
  }

}
