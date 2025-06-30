import { ContextBarElementLink } from './context-bar-element-link';
import { ContextBarElementRouterLink } from './context-bar-element-router-link';

export interface ContextBarElement {
  column?: string;
  valueGetter?: () => string | number;
  class?: string;
  errorTooltip?: string;
  warningTooltip?: string;
  link?: ContextBarElementLink;
  routerLink?: ContextBarElementRouterLink;
  expandableIconAsValue?: boolean;
}
