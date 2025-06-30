import { Directive, HostListener } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({ selector: '[commaSeparatedStringIdentifires]' })
export class CommaSeparatedStringIdentifiresDirective {
  constructor(
    private model: NgModel,
  ) {}

  @HostListener('input', ['$event'])
  ngModelChange(input: any) {
    const value = input.target.value;
    const parsedValue = value.replace(/\s+/g, ',');
    this.model.valueAccessor.writeValue(parsedValue);
    this.model.viewToModelUpdate(parsedValue);
  }
}
