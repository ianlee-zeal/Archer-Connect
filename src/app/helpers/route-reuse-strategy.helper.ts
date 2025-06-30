// import { Router, NavigationEnd } from '@angular/router';
// import { ElementRef } from '@angular/core';
// import { first } from 'rxjs/operators';

// TODO: this class is obsolete. When route reuse strategy would be completely removed, this class must be also removed.
/* export class RouteReuseStrategyHelper {
  public static processNavigation(router: Router, elementRef : ElementRef, componentUrl: string): void {
    router.events
      .pipe(first())
      .subscribe(event => {
        if (event instanceof NavigationEnd && event.url === componentUrl) {
          // component is being restored from RouteReuseStrategy
          const claimantFirstNameInput: HTMLElement = elementRef.nativeElement
            .querySelector('app-custom-text-column-filter .ag-floating-filter-input');

          if (claimantFirstNameInput) {
            claimantFirstNameInput.focus();
          }
        }
      });
  }
  public static processOnNavChangeCallback(router: Router, callback: Function, componentUrl: string): void {
    router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd && event.url === componentUrl) {
          callback();
        }
      });
  }
} */
