export class NavItemBadge {
  icon: string;
  title: string;
  tooltip: string;
  className?: string;

  constructor(icon: string, title: string, tooltip?: string, className?: string) {
    this.icon = icon;
    this.title = title;
    this.tooltip = tooltip;
    this.className = className;

    if (icon && title != null) {
      throw new Error('Can only use icon or title at a time.');
    }
  }
}
