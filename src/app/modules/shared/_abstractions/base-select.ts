import { Input, HostListener, EventEmitter, Output, ViewChild, ElementRef, Directive, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { CommonHelper } from '@app/helpers/common.helper';
import { KeyCodes } from '@app/models/enums/keycodes.enum';
import { BaseControl } from './base-control';
import { StringHelper } from '../../../helpers/string.helper';
import _ from 'cypress/types/lodash';

export interface SelectOption {
  id: number | string;
  name: string;
  checked?: boolean; // used for multi select
  disabled?: boolean;
  active?: boolean;
  class?: string;
  group?: string;
  icon?: string;
}

@Directive()
export abstract class BaseSelect extends BaseControl implements ControlValueAccessor, OnInit {
  public abstract options: SelectOption[] | string[];
  public abstract model: any;

  public defaultOption?: boolean;
  public displayTop = false;

  @ViewChild('input') public input: ElementRef;

  @Input() public optionId: string = 'id';
  @Input() public optionName: string = 'name';
  @Input('disabled') public isDisabled: boolean;

  @Input() public placeholder: string = '';
  @Output() public onModelChange = new EventEmitter<number | string | SelectOption>();

  @Input()
  public get fullwidth() {
    return this.isFullWidth;
  }

  public set fullwidth(value: any) {
    this.isFullWidth = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get optionAsValue() {
    return this.useOptionAsValue;
  }

  public set optionAsValue(value: any) {
    this.useOptionAsValue = CommonHelper.setShortBooleanProperty(value);
  }

  public get isOpen() {
    return this._isOpen;
  }

  public set isOpen(value: boolean) {
    this._isOpen = value;
  }

  public isFullWidth: boolean;
  public useOptionAsValue: boolean;

  protected isFocused: boolean;
  protected hoveredIndex: number = null;

  protected onChangeFn = _ => { };
  protected onTouchedFn = () => { };

  public abstract selectOption(option: SelectOption | string);
  public abstract isOptionSelected(option: SelectOption | string): boolean;

  private _isOpen: boolean;

  constructor(
    protected element: ElementRef,
  ) {
    super();
  }
  ngOnInit(): void {
  }

  public get selected(): SelectOption | string | null {
    const selectedOptionId = (this.model instanceof Object) ? this.getOptionId(this.model) : this.model;
    return this.options ? (this.options as Array<SelectOption | string>).find((option: SelectOption) => this.getOptionId(option) === selectedOptionId) : null;
  }

  public get isDefaultOptionVisible(): boolean {
    return !!this.options.length && this.defaultOption;
  }

  @HostListener('window:keydown', ['$event'])
  public onKeydown(event: KeyboardEvent): void {
    if (!this.isFocused) {
      return;
    }

    if (event.code !== KeyCodes.Tab) {
      event.preventDefault();
    }

    switch (event.code) {
      case KeyCodes.Tab:
      case KeyCodes.Escape:
        return this.close();

      case KeyCodes.Enter:
        return !this.isOpen ? this.open() : this.selectHoveredOption();

      case KeyCodes.ArrowUp:
        return !this.isOpen ? this.selectPreviousOption() : this.hoverPreviousOption();

      case KeyCodes.ArrowDown:
        return !this.isOpen ? this.selectNextOption() : this.hoverNextOption();
    }
  }

  public toggleOpen(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public onFocus(): void {
    this.isFocused = true;
  }

  public onBlur(): void {
    this.isFocused = false;
  }

  public open(): void {
    this.isOpen = true;
    this.hoveredIndex = this.fillHoveredIndex();

    if (this.input) {
      this.input.nativeElement.focus();
    }
    const optionsElement = this.element.nativeElement.querySelector('.select__options');
    const elementBottom: number = optionsElement.getBoundingClientRect().bottom;
    const windowBottom: number = document.documentElement.clientHeight;

    this.displayTop = elementBottom > windowBottom;
  }

  public close(): void {
    this.isOpen = false;
    this.hoveredIndex = null;
  }

  public isOptionHovered(index: number): boolean {
    return this.hoveredIndex === index;
  }

  public isAnyOptionHovered(): boolean {
    return this.hoveredIndex !== null;
  }

  public getOptionId(option: SelectOption | string): number | string {
    return StringHelper.isString(option) ? option : option[this.optionId];
  }

  public getOptionName(option: SelectOption | string): string {
    return StringHelper.isString(option) ? option : option[this.optionName];
  }

  protected updateValue(value): void {
    if (this.model !== value) {
      this.model = value;
      this.onChangeFn(value);

      this.element.nativeElement.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    }

    this.onTouchedFn();
  }

  // ControlValueAccessor interface implementation

  public writeValue(value): void {
    this.model = value;
  }

  public registerOnChange(fn): void {
    this.onChangeFn = fn;
  }

  public registerOnTouched(fn): void {
    this.onTouchedFn = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // selecting options when dropdown is closed but focued

  private selectPreviousOption(): void {
    if (!this.selected) {
      return;
    }

    const selectedOptionIndex = this.options.findIndex(option => this.getOptionId(option) === this.getOptionId(this.selected));

    this.selectOptionByIndex(selectedOptionIndex - 1);
  }

  private selectNextOption(): void {
    if (!this.selected) {
      this.selectOptionByIndex(0);

      return;
    }

    const selectedOptionIndex = this.options.findIndex(option => this.getOptionId(option) === this.getOptionId(this.selected));

    this.selectOptionByIndex(selectedOptionIndex + 1);
  }

  private selectOptionByIndex(index: number): void {
    if (index < 0) {
      this.selectOption(null);

      return;
    }

    if (index > this.options.length - 1) {
      return;
    }

    this.selectOption(this.options[index]);
  }

  // higlighting options when dropdown is open

  private hoverPreviousOption(): void {
    if (this.hoveredIndex === null) {
      return;
    }

    if (this.hoveredIndex - 1 >= 0) {
      this.hoveredIndex--;
    }
  }

  private hoverNextOption(): void {
    if (this.hoveredIndex === null && this.isDefaultOptionVisible) {
      this.hoveredIndex = 0;
    } else if (this.hoveredIndex + 1 <= this.options.length) {
      this.hoveredIndex++;
    }
  }

  private selectHoveredOption(): void {
    if (this.hoveredIndex === null) {
      return null;
    }

    this.selectOptionByIndex(this.hoveredIndex - 1);
    this.hoveredIndex = null;
  }

  private fillHoveredIndex(): number | null {
    if (this.selected === null && this.isDefaultOptionVisible) {
      return 0;
    }
    const selectedOptionIndex = this.options.findIndex(option => option === this.selected);

    return selectedOptionIndex + 1;
  }
}
