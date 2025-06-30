import { Directive, HostListener, Input } from '@angular/core';
import { CommonHelper } from '@app/helpers/common.helper';
import { KeyCodes } from '@app/models/enums/keycodes.enum';

@Directive({ selector: '[onlyNumbers]' })
export class OnlyNumbersDirective {
  @Input()
  public get onlyNumbers() {
    return this.isOnlyNumbers;
  }

  public set onlyNumbers(value: any) {
    this.isOnlyNumbers = CommonHelper.setShortBooleanProperty(value);
  }
  private isOnlyNumbers: boolean;

  private onlyNumbersRegExp: RegExp = new RegExp('^\\d+$');

  @HostListener('paste', ['$event']) pasteClipboard(e: ClipboardEvent): boolean {
    const data = e.clipboardData.getData('text');
    return this.onlyNumbers ? !!this.onlyNumbersRegExp.test(data) : true;
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
        || !this.onlyNumbers
    ) ? true
      : this.onlyNumbersRegExp.test(e.key);
  }
}
