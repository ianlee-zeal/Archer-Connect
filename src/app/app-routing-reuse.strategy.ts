import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AppRoutingReuseStrategy implements RouteReuseStrategy {
  shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    // console.group('%cRRS: shouldReuseRoute', 'color: blueviolet;');
    // console.log('future:', future);
    // console.log('current:', current);
    // console.groupEnd();
    return (
      future.toString() === current.toString()
      && future.routeConfig === current.routeConfig
    );
  }

  /** Determines if this route (and its subtree) should be reattached */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {/* eslint-disable-line @typescript-eslint/no-unused-vars */
    // console.group('%cRRS: shouldAttach', 'color: green;');
    // console.log('route:', route);
    // console.groupEnd();
    return false;
  }

  /** Determines if this route (and its subtree) should be detached to be reused later */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {/* eslint-disable-line @typescript-eslint/no-unused-vars */
    // console.group('%cRRS: shouldDetach', 'color: orange;');
    // console.log('route:', route);
    // console.groupEnd();
    return false;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {/* eslint-disable-line @typescript-eslint/no-unused-vars */
    // console.group('%cRRS: store', 'color: red;');
    // console.log('route:', route);
    // console.groupEnd();
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {/* eslint-disable-line @typescript-eslint/no-unused-vars */
    // console.group('%cRRS: retrieve', 'color: lightseagreen;');
    // console.log('route:', route);
    // console.groupEnd();
    return null;
  }
}
