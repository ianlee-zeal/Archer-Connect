import { Directive } from '@angular/core';
import { StickyBase } from './sticky-base';

@Directive({ selector: '[stickyHeader]' })
export class StickyHeaderDirective extends StickyBase {
  protected stickElement(): void {
    const gridRootRect: DOMRect = this.gridRoot.getBoundingClientRect();
    const isNeedToStickHeader = gridRootRect.top < 0 && gridRootRect.bottom > this.gridHeader.clientHeight;
    const isHeaderSticked = this.gridHeader.style.position === 'fixed';

    if (isNeedToStickHeader && !isHeaderSticked) {
      this.gridHeader.style.position = 'fixed';
      this.gridHeader.style.top = '0';
      this.gridHeader.style.width = `${this.gridBodyViewPort.clientWidth}px`;
      this.gridRoot.style.paddingTop = `${this.gridHeader.clientHeight}px`;
      this.gridHeader.style.zIndex = '1';
    } else if (!isNeedToStickHeader && isHeaderSticked) {
      this.gridHeader.style.position = 'static';
      this.gridRoot.style.paddingTop = '0';
      this.gridHeader.style.zIndex = 'auto';
    }
  }

  protected onResize() {
    super.onResize();
    this.gridHeader.style.width = `${this.gridBodyViewPort.clientWidth}px`;
  }
}
