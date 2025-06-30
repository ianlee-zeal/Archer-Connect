import { Component, Input, forwardRef, Output, EventEmitter, ElementRef, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonHelper } from '@app/helpers/common.helper';
import { StringHelper } from '@app/helpers/string.helper';
import { SelectOption } from '../_abstractions/base-select';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  private isFullWidth: boolean;
  private isFilterMultiselectSelect: boolean;
  public useOptionAsValue: boolean;
  private isSearchable: boolean;
  private isMultiple: boolean;
  private isSelectedHidden: boolean;
  private shouldClearInputAfterSelection: boolean;

  protected onChangeFn = _ => { };
  protected onTouchedFn = () => { };

  @Input() public options: any;
  @Input() public isMultiselectDropdown: boolean = false;
  @Input() public model: any;
  @Input() public orangeHighlight = false;
  @Input() public defaultOption = true;
  @Input() public optionId: string = 'id';
  @Input() public optionName: string = 'name';
  @Input() public checkedOptionId: number;
  @Input() public placeholder: string = 'Select';
  @Input() public appendTo: string;
  @Input('disabled') public isDisabled: boolean;
  @Input('class') class: string;
  @Input('panel-class') panelClass: string;
  @Input() public formControlName: any;
  @Input() public searchFn: () => {};
  @Input() optionTemplate: TemplateRef<any>;
  @Input() labelTemplate: TemplateRef<any>;
  @Input() multiLabelTemplate: TemplateRef<any>;
  @Input() hasRatingIcon: boolean;
  @Input() listTypeValue: boolean;
  @Input() showRatingIconInLabel = false;
  @Input() public groupBy: string;
  @Input() public title: string;
  @Input() loading = undefined;

  @Output() readonly onModelChange = new EventEmitter<number | string | any>();
  @Output() readonly onKeyup = new EventEmitter<number | string | any>();
  @Output() readonly onOpen = new EventEmitter();
  @Output() readonly cleared = new EventEmitter();

  public get selectedValue(): string {
    return this.optionAsValue ? '' : this.optionId;
  }

  @Input()
  public get clearInputAfterSelection() {
    return this.shouldClearInputAfterSelection;
  }

  public set clearInputAfterSelection(value: any) {
    this.shouldClearInputAfterSelection = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get fullwidth() {
    return this.isFullWidth;
  }

  public set fullwidth(value: any) {
    this.isFullWidth = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get filterMultiselect() {
    return this.isFilterMultiselectSelect;
  }

  public set filterMultiselect(value: any) {
    this.isFilterMultiselectSelect = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get hideSelected() {
    return this.isSelectedHidden;
  }

  public set hideSelected(value: any) {
    this.isSelectedHidden = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get optionAsValue() {
    return this.useOptionAsValue;
  }

  public set optionAsValue(value: any) {
    this.useOptionAsValue = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get multiple() {
    return this.isMultiple;
  }

  public set multiple(value: any) {
    this.isMultiple = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get searchable() {
    return this.isSearchable;
  }

  public set searchable(value: any) {
    this.isSearchable = CommonHelper.setShortBooleanProperty(value);
  }

  constructor(
    protected element: ElementRef,
  ) { }

  public onChange(option) {
    if (this.isMultiselectDropdown) {
      this.clearInput();
      this.onMultiselectFilterChecked(option);
    } else {
      const value = this.optionAsValue ? option : (option && this.getOptionId(option));
      this.onModelChange.emit(value);
      this.updateValue(value);
    }
  }

  private onMultiselectFilterChecked(option: any) {
    if (this.filterMultiselect) {
      const value = this.optionAsValue ? option : (option && this.getOptionId(option));
      this.onModelChange.emit(value);
    } else if (!option) {
      this.onModelChange.emit(null);
    }
  }

  public keyup(event: any) {
    this.onKeyup.emit(event.target.value);
  }

  public open() {
    this.onOpen.emit();
    setTimeout(this.applyPanelClassList, 0);
  }

  private applyPanelClassList = () => {
    const panelEl = this.element?.nativeElement?.querySelector('.ng-dropdown-panel');
    const classList = (this.panelClass === undefined) ? this.class : this.panelClass;
    if (!panelEl || !classList) return;
    for (const className of classList.split(' ')) {
      if (!className) continue;
      panelEl.classList.add(className);
    }
  };

  public onMultiselectOptionChecked(isCheckedNow: boolean, option: SelectOption) {
    this.onModelChange.emit({ ...option, checked: isCheckedNow });
  }

  public getOptionName(option: SelectOption | string): string {
    if (!option) {
      return '';
    }

    let optionName = StringHelper.isString(option)
      ? option
      : option[this.optionName];

    // For cases when formControlName is referenced to ID property not IdValue object
    if (optionName == null) {
      const op = this.options?.find(i => i[this.optionId] === option);
      optionName = !!op ? op[this.optionName] : '';
      if(this.orangeHighlight) {
        return '';
      };
    }

    return optionName;
  }

  public getOptionId(option: Array<any> | string): number | string | Array<any> {
    if (Array.isArray(option)) {
      return option.map(item => item[this.optionId]);
    }
    return StringHelper.isString(option) ? option : option[this.optionId];
  }

  protected updateValue(value): void {
    this.onChangeFn(value);
    this.element.nativeElement.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    this.onTouchedFn();
    this.clearInput();
  }

  private clearInput(): void {
    if (this.clearInputAfterSelection) {
      setTimeout(() => { this.model = null; });
    }
  }

  onClear() {
    this.cleared.emit();
  }

  public isClearable(): boolean {
    return this.defaultOption;
  }

  // Implement Control Value Accessor interface
  writeValue(value: any): void {
    this.model = value;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  public handleClearSelection() {
    setTimeout(() => { this.model = null; });
  }
}
