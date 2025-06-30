import { Directive } from '@angular/core';
import { StickyBase } from './sticky-base';

@Directive({ selector: '[stickyHorizontalScroll]' })
export class StickyHorizontalScrollDirective extends StickyBase {
  protected stickElement(): void {
    if (!this.gridHorizontalScrollBar) return;

    const rect: DOMRect = this.gridDom.getBoundingClientRect();
    const isNeedToStickScrollBar = rect.bottom > window.innerHeight && rect.top < window.innerHeight;
    const isScrollbarSticked = this.gridHorizontalScrollBar.style.position === 'fixed';

    if (isNeedToStickScrollBar && !isScrollbarSticked) {
      this.gridHorizontalScrollBar.style.position = 'fixed';
      this.gridHorizontalScrollBar.style.bottom = '0';
      this.gridHorizontalScrollBar.style.width = `${this.gridBodyViewPort.clientWidth}px`;
    } else if (!isNeedToStickScrollBar && isScrollbarSticked) {
      this.gridHorizontalScrollBar.style.position = 'static';
      this.gridHorizontalScrollBar.style.width = `${this.gridBodyViewPort.clientWidth}px`;
    }
  }

  protected onResize() {
    super.onResize();
    this.gridHorizontalScrollBar.style.width = `${this.gridBodyViewPort.clientWidth}px`;
  }
}
