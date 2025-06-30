import * as uuid from 'uuid';
import { NavItemBadge } from './nav-item-badge';

export class NavItem {
  id: string;
  parentId: string;
  name: string;
  icon: string;
  iconTooltip: string;
  route: string;
  disabled: boolean;
  expanded: boolean;
  items: NavItem[];
  dummyItemName: string;
  permissions: string | string[];
  badges: NavItemBadge[];
  autoScrollEnabled: boolean;
  action: () => void;
  visible: () => boolean;

  // TODO bad way to implement Top 5/Load All.
  // This breaks the levels of abstraction.
  // Need to be implemented as a NavItem with action to load all data or only 5 elements
  maxItemsCount?: number | null;
  visibleItemsCount?: number | null;
  allItemsDisplayed: boolean;
  isTopLevelItem: boolean;
  isRedirectable: boolean;
  withPointer: boolean;

  constructor(
    name: string,
    icon?: string,
    iconTooltip?: string,
    route?: string,
    items?: NavItem[],
    expanded: boolean = true,
    disabled?: boolean,
    dummyItemName?: string,
    permissions?: string | string[],
    badges?: NavItemBadge[],
    autoScrollEnabled?: boolean,
    action?: () => void,
    visible?: () => boolean,
    maxItemsCount?: number | null,
    isTopLevelItem: boolean = false,
    isRedirectable: boolean = true,
    withPointer: boolean = false,
  ) {
    this.id = uuid.v4();
    this.name = name;
    this.icon = icon;
    this.iconTooltip = iconTooltip;
    this.route = route || '.';
    this.disabled = disabled;
    this.expanded = expanded;
    this.items = items || [];
    this.dummyItemName = dummyItemName || 'No items';
    this.permissions = permissions;
    this.badges = badges;
    this.action = action || function () { };
    this.visible = visible || (() => true);
    this.autoScrollEnabled = autoScrollEnabled || false;

    this.maxItemsCount = maxItemsCount;
    this.visibleItemsCount = maxItemsCount;
    this.allItemsDisplayed = false;
    this.isTopLevelItem = isTopLevelItem;
    this.isRedirectable = isRedirectable;
    this.withPointer = withPointer;
  }

  public get hasChildren(): boolean {
    return this.items != null && this.items.length > 0;
  }

  public static create(item: NavItem): NavItem {
    return new NavItem(
      item.name,
      item.icon,
      item.iconTooltip,
      item.route,
      item.items,
      item.expanded,
      item.disabled,
      item.dummyItemName,
      item.permissions,
      item.badges,
      item.autoScrollEnabled,
      item.action,
      item.visible,
      item.maxItemsCount,
      item.isTopLevelItem,
      item.isRedirectable,
      item.withPointer,
    );
  }
}
