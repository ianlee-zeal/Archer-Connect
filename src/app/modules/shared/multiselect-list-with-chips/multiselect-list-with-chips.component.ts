/* eslint-disable no-param-reassign */
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2, SimpleChanges } from '@angular/core';
import { CommonHelper } from '@app/helpers/common.helper';
import { SelectHelper } from '@app/helpers/select.helper';
import { SelectOption } from '../_abstractions/base-select';

export class MultiSelectOption {
  id: number;
  index: number;
  checked: boolean;
}

@Component({
  selector: 'app-multiselect-list-with-chips',
  templateUrl: './multiselect-list-with-chips.component.html',
  styleUrls: ['./multiselect-list-with-chips.component.scss'],
})
export class MultiSelectListWithChipsComponent {
  private isSelectAllEnabled: boolean;

  @Input() public options: SelectOption[];
  @Input() public isSelectAllChecked: boolean;
  @Input() public width: number = null;
  @Output() public select = new EventEmitter<MultiSelectOption>();
  @Output() public selectAll = new EventEmitter<boolean>();
  @Input() placeholder = 'Select Value';
  @Input() public hideChips: boolean = false;

  showDropdown = false;
  selectedOptions: SelectOption[] = [];
  selectedText = '';

  private chipContainerElement: HTMLElement | null = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) { }

  @Input()
  public get enableSelectAll(): boolean {
    return this.isSelectAllEnabled;
  }
  public set enableSelectAll(value: boolean) {
    this.isSelectAllEnabled = CommonHelper.setShortBooleanProperty(value);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const clickedElement = event.target as HTMLElement;

    if (!this.elementRef.nativeElement.contains(clickedElement)) {
      this.showDropdown = false;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      // Access the .chip-container element directly
      this.chipContainerElement = this.elementRef.nativeElement.querySelector('.chip-container') as HTMLElement;

      // Call the method to set the initial width
      this.adjustChipContainerWidth();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    // Call the method to adjust width when the window is resized
    this.adjustChipContainerWidth();
  }

  private adjustChipContainerWidth(): void {
    // Set the width of .chip-container based on the size of the .advanced-search element
    if (this.chipContainerElement) {
      const advancedSearchElement = document.querySelector('.advanced-search') as HTMLElement | null;

      if (advancedSearchElement) {
        const clientWidth = advancedSearchElement.clientWidth || 1600;
        const width = clientWidth / 2.2;
        const parentElement = this.renderer.parentNode(this.elementRef.nativeElement);
        this.renderer.setStyle(this.chipContainerElement, 'width', `${width}px`);
        this.renderer.setStyle(parentElement, 'max-width', '300px');
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options) {
      const previousOptions: SelectOption[] = changes.options.previousValue;
      const newOptions: SelectOption[] = changes.options.currentValue;

      if (!SelectHelper.areOptionsEqual(previousOptions, newOptions)) {
        this.handleOptionsChange();
      }
    }
  }

  private handleOptionsChange(): void {
    this.updateSelectedOptions();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  public onSelectAll(isChecked: boolean): void {
    this.selectAll.emit(isChecked);
    this.options.forEach((option: SelectOption) => {
      option.checked = isChecked;
    });
    this.updateSelectedOptions();
  }

  public onChange(event: Event, option: any, index: number): void {
    option.checked = !option.checked;
    this.options[index] = option;
    this.updateSelectedOptions();
    const { checked } = event.target as HTMLInputElement;
    const id = option.id;
    this.select.emit({
      id,
      checked,
      index,
    });
  }

  updateSelectedOptions(): void {
    this.selectedOptions = this.options.filter((option: SelectOption) => option.checked);
    this.selectedText = this.selectedOptions.map((option: SelectOption) => option.name).join(', ');
  }

  removeChip(option: any, indexInSelectedOptions: number): void {
    option.checked = false;
    const optionIndex = this.options.findIndex(o => o.id == option.id);
    this.options[optionIndex] = option;
    this.updateSelectedOptions();
    const id = option.id;
    const checked = option.checked;
    this.select.emit({
      id,
      checked,
      index: indexInSelectedOptions,
    });
  }
}
