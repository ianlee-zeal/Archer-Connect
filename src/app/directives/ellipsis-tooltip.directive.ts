import { Directive, ElementRef, HostListener, Renderer2, AfterViewInit, OnInit, Input } from '@angular/core';

const SELECT_ELEMENT_NAME = 'select';
const SELECT_COMPONENT_NAME = 'app-select';

@Directive({ selector: '[type="email"],[type="number"],[type="text"],select, [ellipsisTooltip]' })
export class EllipsisTooltipDirective implements OnInit, AfterViewInit {
  @Input() alwaysDisplayTooltip: boolean = false;
  private nativeElement: HTMLElement;
  private isSelect: boolean;
  private isAppSelect: boolean;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.nativeElement = this.element.nativeElement;

    const ellipsis = {
      'text-overflow': 'ellipsis',
      overflow: 'hidden',
      'white-space': 'nowrap',
    };
    Object.keys(ellipsis).forEach(element => {
      this.renderer.setStyle(
        this.nativeElement, `${element}`, ellipsis[element],
      );
    });

    this.isSelect = this.nativeElement.tagName.toLowerCase() === SELECT_ELEMENT_NAME;
    this.isAppSelect = this.nativeElement.tagName.toLowerCase() === SELECT_COMPONENT_NAME;
  }

  ngAfterViewInit(): void {
    this.renderer.setProperty(this.nativeElement, 'scrollTop', 1);
    this.onMouseOver();
  }

  @HostListener('mouseover')
  public onMouseOver(): void {
    const target: any = !this.isAppSelect ? this.nativeElement : this.nativeElement.getElementsByTagName('input')[0];

    let textValue = '';

    if (!this.isSelect) {
      textValue = target.value || target.textContent;
    } else if (target.selectedIndex != -1) {
      textValue = target.options[target.selectedIndex].text;
    }

    if (this.alwaysDisplayTooltip || (this.nativeElement.offsetWidth < this.nativeElement.scrollWidth)) {
      this.renderer.setAttribute(this.nativeElement, 'title', textValue);
    } else if (this.nativeElement.hasAttribute('title')) {
      this.renderer.removeAttribute(this.nativeElement, 'title');
    }
  }
}
