import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({ selector: '[ngbDatepicker]' })
export class DatepickerChangeDirective {
  constructor(
    private element: ElementRef,
  ) { }

  @HostListener('ngModelChange')
  public onModelChange(): void {
    // we should postpone dispatching this event until datepicker applies new value otherwise we get old value in OnChange method of a form
    // furthermore we should not use reactive forms in conjunction with onChange handler on a form because they should use different mechanism for tracking changes
    // TODO: we should remove this directive at all once we use a proper approach for working with reactive forms
    setTimeout(() => {
      this.element.nativeElement.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    }, 0);
  }
}
