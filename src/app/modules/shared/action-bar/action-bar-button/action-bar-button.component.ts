/* eslint-disable no-underscore-dangle */
import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { ActionOption } from '../action-handlers-map';

@Component({
  selector: 'app-action-bar-button',
  templateUrl: './action-bar-button.component.html',
  styleUrls: ['./action-bar-button.component.scss'],
})
export class ActionBarButtonComponent {
  @Input() public action;
  @Input() public actionConfig;

  constructor(private elementRef: ElementRef) {}

  private _isOpen: boolean;

  public get isOpen(): boolean {
    return this._isOpen;
  }

  public set isOpen(value: boolean) {
    this._isOpen = value;
  }

  get isVisible(): boolean {
    const isHidden: boolean = this.action.hidden && this.action.hidden();
    return !isHidden;
  }

  get customStyle() {
    return this.actionConfig?.customColor ? { color: this.actionConfig?.customColor } : null;
  }

  public onActionClicked(): void {
    const callback: Function = (this.action && this.action.callback) ? this.action.callback : this.action;
    const disabled: boolean = (this.action && this.action.disabled) ? this.action.disabled() : false;

    if (callback && !disabled && !this.action.options) {
      callback();
    }

    if (this.action.options && !disabled) {
      this.toggleOpen();
    }
  }

  public open(): void {
    this.isOpen = true;
  }

  public close(): void {
    this.isOpen = false;
  }

  public toggleOpen(): void {
    this.isOpen = !this.isOpen;
  }

  public onClickOption(option: ActionOption): void {
    const disabled: boolean = (option && option.disabled) ? option.disabled() : false;

    if (option.callback && !disabled) {
      option.callback();
    }
  }

  public optionIsDisabled(option: ActionOption): boolean {
    return (option && option.disabled) ? option.disabled() : false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    // may be need to check
    const clickedElement = event.target as HTMLElement;

    if (!this.elementRef.nativeElement.contains(clickedElement)) {
      this.isOpen = false;
    }
  }
}
