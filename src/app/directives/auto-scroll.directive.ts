import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[appScrollSideMenuItemFocus]' })
export class AutoScrollSideMenuItemDirective implements AfterViewInit {
  /**
   * Creates an instance of AutoScrollSideMenuItemDirective.
   * @param {ElementRef} el - current element reference
   * @memberof AutoScrollSideMenuItemDirective
   */
  public constructor(private el: ElementRef) { }

  /** @inheritdoc */
  ngAfterViewInit(): void {
    const current = this.el.nativeElement.querySelector('.menu-elements.current.auto-scroll-enabled');
    if (current) {
      current.scrollIntoView();
    }
  }
}
