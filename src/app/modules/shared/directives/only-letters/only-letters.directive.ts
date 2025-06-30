import { Directive, HostListener } from '@angular/core';
import { KeyCodes } from '@app/models/enums/keycodes.enum';

@Directive({ selector: '[onlyLetters]' })
export class OnlyLettersDirective {
  private onlyLettersRegExp: RegExp = new RegExp('[a-zA-Z]+$');

  @HostListener('paste', ['$event']) pasteClipboard(e: ClipboardEvent): boolean {
    const data = e.clipboardData.getData('text');
    return !!this.onlyLettersRegExp.test(data);
  }

  @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent): boolean {
    if (
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
    ) {
      return true;
    }
    const check = this.onlyLettersRegExp.test(e.key);
    return check;
  }
}
