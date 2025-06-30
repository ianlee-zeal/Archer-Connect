import { Directive, ElementRef, Renderer2, AfterViewInit, OnInit, Input } from '@angular/core';

@Directive({ selector: '[heightByCount]' })
export class HeightByCountOfChildsDirective implements OnInit, AfterViewInit {
  @Input() heightByCount: number;

  get element(): HTMLElement {
    return this.el.nativeElement as HTMLElement;
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,

  ) {}

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    const element = this.element.querySelector('.multiselect-list');
    if (this.heightByCount > 0 && element.children.length >= this.heightByCount) {
      let sumOfHeight = 0;
      for (let i = 0; i < this.heightByCount; i++) {
        const e = element.children[i];
        const style = window.getComputedStyle(e);
        sumOfHeight += parseInt(style.height, 10) + parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
      }
      this.renderer.setStyle(element, 'height', `${sumOfHeight + 15}px`);
      const parent = element.parentElement.closest('.advanced-search-field-data__multiselect-container');
      this.renderer.setStyle(parent, 'height', 'auto');
    }
  }
}
