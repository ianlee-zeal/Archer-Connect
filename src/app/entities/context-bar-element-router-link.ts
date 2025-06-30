import { IContextBarLocationDisplay } from "./context-bar-location-display";

interface IContextBarElementRouterLink {
  text: string;
  hidden: boolean;
  routerLink: string;
}

export type ContextBarElementRouterLink = IContextBarElementRouterLink & IContextBarLocationDisplay;
