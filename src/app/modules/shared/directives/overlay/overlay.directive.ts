import { Directive, Input, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs';

@Directive({
  selector: '[overlay]'
})
export class OverlayDirective implements OnInit, OnDestroy {
  @Input('overlay') public overlay$: Observable<boolean>;

  private host: HTMLElement;
  private overlay: HTMLElement;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
  ) { }

  public ngOnInit(): void {
    this.host = this.element.nativeElement;
    this.overlay = this.renderer.createElement('div');

    this.setStyle(this.overlay, {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#fbfbfb',
      opacity: 0.5,
    });

    this.overlay$.subscribe((value: boolean) => {
      if (value) {
        this.renderer.appendChild(this.host, this.overlay);

        return;
      }

      this.renderer.removeChild(this.host, this.overlay);
    });
  }

  public ngOnDestroy(): void {
    this.renderer.removeChild(this.host, this.overlay);
    this.renderer.destroy();
  }

  private setStyle(element: HTMLElement, styles: {[key: string]: string | number }): void {
    Object.keys(styles).forEach((key: string) => {
      element.style[key] = styles[key];
    });
  }
}
