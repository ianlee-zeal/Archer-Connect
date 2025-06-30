import { NavigationExtras } from '@angular/router';

export class RouteEvent {
  url: string;
  extras: NavigationExtras;
  componentId: string;
  ignore: boolean;
}