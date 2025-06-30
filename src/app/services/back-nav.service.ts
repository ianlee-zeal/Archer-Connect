import { Injectable } from '@angular/core';
import { Router, RoutesRecognized, ActivatedRouteSnapshot } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

import { RouteEvent } from '@app/models/route-event';

@Injectable({ providedIn: 'root' })
export class BackNavService {
  private stack: RouteEvent[] = [];

  private get count() {
    return this.stack.length;
  }

  constructor(private router: Router, private location: Location) {
    this.router.events
      .pipe(filter(e => e instanceof RoutesRecognized))
      .subscribe((event: RoutesRecognized) => {
        var urlParts = event.urlAfterRedirects.split('?');
        const routeEvent = <RouteEvent>{
          url: urlParts[0],
          componentId: this.getComponentId(event.state.root),
          ignore: this.getIgnoreFlag(event.state.root),
          extras: { state: this.location.getState() },
        };

        this.add(routeEvent);
      });
  }

  public pop(): RouteEvent {
    let route: RouteEvent;

    if (this.count > 0) {
      this.stack.pop(); // remove current route

      while (this.count > 0 && this.stack[this.count - 1].ignore) {
        this.stack.pop(); // skip routes with ignore flag
      }

      route = this.stack.pop(); // get previous route
    }

    return route;
  }

  private add(routeEvent: RouteEvent): void {
    this.isSameComponent(routeEvent)
      ? this.stack[this.count - 1] = routeEvent
      : this.stack.push(routeEvent);
  }

  private isSameComponent(newRoute: RouteEvent): boolean {
    if (!this.count) {
      return false;
    }

    const prevRoute = this.stack[this.count - 1];

    return newRoute.componentId === prevRoute.componentId;
  }

  private getComponentId(snapshot: ActivatedRouteSnapshot): string {
    let lowLevelComponent: string = snapshot.data?.componentId;

    for (const child of snapshot.children) {
      const component = this.getComponentId(child);

      if (component) {
        lowLevelComponent = component;
      }
    }

    return lowLevelComponent;
  }

  private getIgnoreFlag(snapshot: ActivatedRouteSnapshot): boolean {
    let ignore: boolean = !!snapshot?.data?.ignoreBackNav;

    for (const child of snapshot.children) {
      const component = this.getIgnoreFlag(child);

      if (component) {
        ignore = component;
      }
    }

    return ignore;
  }
}
