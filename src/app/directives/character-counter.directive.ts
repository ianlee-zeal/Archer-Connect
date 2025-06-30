import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';

// This directive can only be used on an input with type text or a textarea element and requires a maxlength property.
@Directive({ selector: '[characterCountContainer]' })
export class CharacterCountDirective {
  @Input('characterCountContainer') countContainer: ElementRef;
  maxLength: number;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    const inputType = elementRef.nativeElement.getAttribute('type');
    const inputTag = elementRef.nativeElement.tagName;

    this.maxLength = elementRef.nativeElement.getAttribute('maxlength');

    const validElement = (this.maxLength && (inputTag === 'INPUT' && inputType === 'text'))
        || inputTag === 'TEXTAREA';

    if (!validElement) {
      throw new Error(
        'The CharacterCountDirective can only be used on an input type text or textarea element and requires a maxlength property',
      );
    }
  }

  ngAfterViewInit() {
    this.setRemainingCharacterCount(this.elementRef.nativeElement.value.length);
  }

  @HostListener('keyup', ['$event'])
  keyupHandler(event: any) {
    this.setRemainingCharacterCount(event.target.value.length);
  }

  setRemainingCharacterCount(countOfChars: number) {
    if (this.maxLength) {
      this.renderer.setProperty(
        this.countContainer,
        'innerHTML',
        `<label>${countOfChars}/${this.maxLength}</label>`,
      );
    }
  }
}
