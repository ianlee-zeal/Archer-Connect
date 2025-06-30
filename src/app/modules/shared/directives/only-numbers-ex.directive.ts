import { KeyCodes } from '@app/models/enums/keycodes.enum';
import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { PercentageHelper } from '@app/helpers/percentage.helper';
import { StringHelper } from '@app/helpers';

@Directive({ selector: '[onlyNumbersEx]' })
export class OnlyNumbersExDirective {
  @Input() allowNegative: boolean = false;
  @Input() allowDecimal: boolean = false;
  @Input() toFixed: number = 2;
  @Input() maxValue: number;
  @Input() suppressPasteIfValueIsIncorrect = false;
  @Input() setToZeroIfValueIsEmpty = true;

  private regex: RegExp;
  private specialSigns = new Set<string>([',', '$']);
  private ignoredKeyCodes: string[] = [KeyCodes.Enter, KeyCodes.NumpadEnter];

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.toFixedCheck();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey
      || event.metaKey
      || event.code === KeyCodes.Backspace
      || event.code === KeyCodes.Tab
      || event.code === KeyCodes.ArrowLeft
      || event.code === KeyCodes.ArrowRight
      || event.code === KeyCodes.Delete
      || event.code === KeyCodes.WindowKeyLeft
      || event.code === KeyCodes.WindowKeyRight
      || event.code === KeyCodes.WindowsMenu) {
      return;
    }

    if (this.specialSigns.has(event.key)) {
      event.preventDefault();
      return;
    }

    // Allow minus sign ('-') if negatives are allowed
    if (this.allowNegative && event.key === '-') {
      // Allow only one minus sign on the start of amount
      if (this.el.nativeElement.value.includes('-') || this.el.nativeElement.selectionStart !== 0) {
        event.preventDefault();
        return;
      }
      return;
    }

    this.validateInput(event, this.ignoredKeyCodes.includes(event.code) ? '' : event.key);
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    let pastedText = ((<any>window).clipboardData && (<any>window).clipboardData.getData('Text')) // If IE, use window
      || (<ClipboardEvent>event && (<ClipboardEvent>event).clipboardData.getData('text/plain')); // Non-IE browsers

    pastedText = this.removeSpecialSignsFromString(pastedText);

    const valid = this.validateInput(event, pastedText);
    if (!this.suppressPasteIfValueIsIncorrect || valid) {
      document.execCommand('insertText', false, pastedText);
    }
    event.preventDefault();
  }

  @HostListener('cut', ['$event'])
  onCut(event: Event): void {
    this.validateInput(event, '');
  }

  @HostListener('ngModelChange')
  public onModelChange(): void {
    if (document.activeElement === this.el.nativeElement) {
      return;
    }

    this.toFixedCheck();
  }

  @HostListener('focusout')
  onFocusLost(): void {
    this.toFixedCheck();
  }

  @HostListener('focus')
  onFocus(): void {
    const element = this.el.nativeElement;
    this.removeSpecialSignsFromElement(element);
    element.select();
  }

  @HostListener('dblclick', ['$event'])
  onDblClick(event: Event): void {
    event.stopPropagation();
  }

  private removeSpecialSignsFromString(value: string): string {
    // Remove all separators
    // eslint-disable-next-line no-param-reassign
    value = value.replace(/,/g, '');

    // Remove special signs
    for (const sign of this.specialSigns) {
    // eslint-disable-next-line no-param-reassign
      value = value.replace(sign, '');
    }

    return value;
  }

  private removeSpecialSignsFromElement(nativeElement): void {
    // eslint-disable-next-line no-param-reassign
    nativeElement.value = this.removeSpecialSignsFromString(nativeElement.value.toString());
  }

  private toFixedCheck(): void {
    if (StringHelper.isEmpty(this.el.nativeElement.value) && !this.setToZeroIfValueIsEmpty) {
      return;
    }

    if (this.el.nativeElement.value === 'undefined' && this.setToZeroIfValueIsEmpty) {
      this.el.nativeElement.value = 0;
    }

    const element = this.el.nativeElement;

    this.removeSpecialSignsFromElement(element);

    if (this.toFixed) {
      element.value = PercentageHelper.toFractionPercentage(+element.value, this.toFixed, false);
    }

    // Add 3 digit separator
    if (+element.value > 999) {
      // eslint-disable-next-line no-useless-escape
      element.value = element.value.replace('/^\d+/g', '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }

  private validateInput(event: Event, text: string): boolean {
    const txtInput = this.el.nativeElement;
    let newValue = (
      txtInput.value.substring(0, txtInput.selectionStart)
      + text
      + txtInput.value.substring(txtInput.selectionEnd)
    );

    newValue = this.removeSpecialSignsFromString(newValue.toString());

    // eslint-disable-next-line prefer-template, no-eval
    this.regex = <RegExp>eval('/^'
      + (this.allowNegative ? '-?' : '')
      + (this.allowDecimal ? `(?!00)\\d+\\.?\\d{0,${this.toFixed}}` : '(!0)\\d*')
      + '$/g');

    if (!newValue.match(this.regex) || (this.maxValue && +newValue > this.maxValue)) {
      event.preventDefault();
      return false;
    }

    return true;
  }
}
