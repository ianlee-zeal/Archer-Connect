import { Directive, HostListener, ElementRef, HostBinding, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[resizer]'
})
export class ResizerDirective implements AfterViewInit {
  height: number;
  oldY = 0;
  grabber = false;

  private get offsetHeight(){
    return parseInt(this.el.nativeElement.parentNode.offsetHeight);
  }

  constructor(private el: ElementRef) {
    el.nativeElement.style.cursor = 'n-resize';
    el.nativeElement.style.margin = '0 auto';
    el.nativeElement.style.display = 'table';
  }

  ngAfterViewInit () {
    this.height = this.offsetHeight;
    this.resizer(0);
  }

  @HostBinding('class')
  elementClass = 'fa fa-grip-lines text-secondary';

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.grabber) {
      return;
    }

    this.resizer(this.oldY - event.clientY);
    this.oldY = event.clientY;
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) { /* eslint-disable-line @typescript-eslint/no-unused-vars */
    this.grabber = false;
  }

  resizer(offsetY: number) {
    this.height += offsetY;
    this.el.nativeElement.parentNode.style.height = this.height + "px";
  }

  @HostListener('mousedown', ['$event']) onResize(event: MouseEvent, resizer?: Function) { /* eslint-disable-line @typescript-eslint/no-unused-vars */
    this.height = this.offsetHeight;

    this.grabber = true;
    this.oldY = event.clientY;

    event.preventDefault();
  }
}