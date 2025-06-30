import { AfterContentInit, Directive, ElementRef, Input } from '@angular/core';
import { CommonHelper } from '@app/helpers/common.helper';

@Directive({
  selector: '[appAutoFocus]'
})
export class AutofocusDirective implements AfterContentInit {
  @Input()
  public get appAutoFocus() {
    return this.isAppAutoFocus;
  }

  public set appAutoFocus(value: any) {
    this.isAppAutoFocus = CommonHelper.setShortBooleanProperty(value);
  }

  private isAppAutoFocus: boolean;

  public constructor(private el: ElementRef) { }

  public ngAfterContentInit() {
    setTimeout(() => {
      if (this.el && this.el.nativeElement && this.isAppAutoFocus) {
        this.el.nativeElement.focus();
        if (this.el.nativeElement.hasOwnProperty('select')) {
          this.el.nativeElement.select();
        }
      }
    }, 200);
  }
}
