import { AfterContentInit, Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[leftBorder]' })
export class LeftBorderDirective implements AfterContentInit {
  public constructor(private el: ElementRef) {}

  ngAfterContentInit(): void {
    setTimeout(() => {
      const previousSearchField = this.el.nativeElement.closest('.ag-header-cell')?.previousElementSibling;
      const previousSearchInput = previousSearchField?.querySelector('input');
      const currentInput = this.el.nativeElement.querySelector('input');

      if (currentInput && previousSearchField && !previousSearchInput) {
        this.el.nativeElement.style.marginLeft = '0px';
      }
    }, 100);
  }
}
