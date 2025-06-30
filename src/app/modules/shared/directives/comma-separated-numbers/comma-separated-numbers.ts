import { Directive, HostListener, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { CommonHelper } from '@app/helpers/common.helper';
import { KeyCodes } from '@app/models/enums/keycodes.enum';

@Directive({ selector: '[commaSeparatedNumbers]' })
export class CommaSeparatedNumbersDirective {
  constructor(
    private model: NgModel,
  ) {}

  @Input()
  public get commaSeparatedNumbers() {
    return this.isCommaSeparatedNumbers;
  }

  public set commaSeparatedNumbers(value: any) {
    this.isCommaSeparatedNumbers = CommonHelper.setShortBooleanProperty(value);
  }
  private isCommaSeparatedNumbers: boolean;

  private onlyNumbersRegExp: RegExp = new RegExp('^\\d+$');

  @HostListener('input', ['$event'])
  ngModelChange(input: any) {
    const value = input.target.value;
    const parsedValue = this.parseValue(value);
    this.model.valueAccessor.writeValue(parsedValue);
    this.model.viewToModelUpdate(parsedValue);
  }

  @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent): boolean {
    return (
      e.ctrlKey
        || e.metaKey
        || e.code === KeyCodes.Backspace
        || e.code === KeyCodes.Tab
        || e.code === KeyCodes.ArrowLeft
        || e.code === KeyCodes.ArrowRight
        || e.code === KeyCodes.Delete
        || e.code === KeyCodes.WindowKeyLeft
        || e.code === KeyCodes.WindowKeyRight
        || e.code === KeyCodes.WindowsMenu
        || e.code === KeyCodes.Comma
        || e.code === KeyCodes.Space
        || !this.commaSeparatedNumbers
    ) ? true
      : this.onlyNumbersRegExp.test(e.key);
  }

  private parseValue(inputValue: string): string {
    const withoutLetters = inputValue.replace(/[^\d-]/g, ' ');
    const withComma = withoutLetters.replace(/\s+/g, ',');
    return withComma;
  }
}
