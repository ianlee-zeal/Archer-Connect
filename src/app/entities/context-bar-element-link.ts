import { IContextBarLocationDisplay } from "./context-bar-location-display";

interface IContextBarElementLink {
  text: string;
  hidden: boolean;
  action: () => void;
}

export type ContextBarElementLink = IContextBarElementLink & IContextBarLocationDisplay;
