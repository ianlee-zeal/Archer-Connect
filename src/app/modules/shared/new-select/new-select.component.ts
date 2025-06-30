import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { StringHelper } from '@app/helpers';
import { OptionItem } from '@shared/_interfaces/option-item';

@Component({
  selector: 'app-new-select',
  templateUrl: './new-select.component.html',
  styleUrl: './new-select.component.scss',
  providers: [NgbDropdownConfig],
})
export class NewSelectComponent implements AfterViewInit, OnInit {
  @Input() options: OptionItem[] = [];
  @Input() isMultiSelect: boolean = true;
  @Input() isSearchable: boolean = false;
  @Input() label: string = '';
  @Input() updatePlaceholder: boolean = false;
  @Input() optionsWidth?: string = null;
  @Input() fontSize?: number = 13;
  @Input() public identifierName: string = 'id';
  @Input() public optionName: string = 'name';
  @Input() defaultOption?: OptionItem;
  @Input() unselectAvailable: boolean = true;
  @Input() required: boolean = false;
  @Input() customSearch: boolean = false;
  @Input() scrollableLoader: boolean = false;
  @Input() loading: boolean = undefined;
  @Input() isFinalScroll: boolean = true;
  @Input() clearOptionsBtnAvailable: boolean = true;

  @ViewChild('anchor', { static: false }) anchor?: ElementRef<HTMLElement>;
  @ViewChild('dropdown') dropdown!: NgbDropdown;

  @Output() onModelChange = new EventEmitter<OptionItem | OptionItem[]>();
  @Output() readonly onOpen = new EventEmitter();
  @Output() onSearch = new EventEmitter<string>();
  @Output() onScrollLoad = new EventEmitter<string>();

  dropdownOpen = false;
  searchQuery = "";
  clicked = false;
  optionsText = '';
  selectedOptions: Map<string, OptionItem> = new Map();
  optionsSize: number = 0;

  constructor(config: NgbDropdownConfig) {
    config.autoClose = 'outside';
  }

  ngOnInit() {
    this.optionsText = this.updatePlaceholder ? 'Select' : '';
    this.setUpDefaultOption();
    this.updatePlaceholderText();
  }

  ngAfterViewInit() {
    this.dropdown.openChange.subscribe(() => {
      this.dropdownOpen = this.dropdown.isOpen();
      if (this.dropdownOpen) {
        this.onOpen.emit();
      } else {
        this.searchQuery = '';
        this.onSearch.emit(null);
        if (this.clicked) {
          this.onModelChange.emit(this.isMultiSelect ? this.getSelectedOptions() : this.getSelectedOptions()[0]);
          this.clicked = false;
        }
      }
    });

    if (this.scrollableLoader) {
      const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.loading && !this.isFinalScroll) {
            this.onScrollLoad.emit(this.searchQuery);
            obs.unobserve(entry.target);
            obs.observe(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.01,
      }
    );

      if (this.anchor) {
        observer.observe(this.anchor.nativeElement);
      }
    }
  }

  setUpDefaultOption() {
    if (!this.defaultOption || !Array.isArray(this.options)) return;

    const defaultOption = this.options.find(option =>
      option[this.optionName] === this.defaultOption![this.optionName]
    );

    if (defaultOption) {
      this.selectedOptions.set(defaultOption[this.identifierName], defaultOption);
    }
  }

  getSelectedOptions(): OptionItem[] {
    return Array.from(this.selectedOptions.values());
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    this.dropdownOpen ? this.dropdown.open() : this.dropdown.close();
  }

  clearSearch() {
    this.searchQuery = '';
    this.dropdownOpen = false;
    this.dropdown.close();
  }

  onOptionChange(option: OptionItem) {
    this.clicked = true;
    const id = option[this.identifierName];

    if (this.isMultiSelect) {
      if (this.selectedOptions.has(id)) {
        this.selectedOptions.delete(id);
      } else {
        this.selectedOptions.set(id, option);
      }
    } else {
      if (this.selectedOptions.has(id)) {
        this.unselectAvailable && this.selectedOptions.clear();
      } else {
        this.selectedOptions.clear();
        this.selectedOptions.set(id, option);
      }
      this.toggleDropdown();
    }
    this.updatePlaceholderText();
  }

  getFilteredOptions(): OptionItem[] {
    return Array.isArray(this.options)
      ? this.customSearch
        ? this.options
        : this.options.filter(option =>
          option[this.optionName].toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      : [];
  }

  getOptionName(option: OptionItem | string): string {
    return !option ? '' : StringHelper.isString(option)
      ? option
      : option[this.optionName];
  }

  resetSearch(){
    this.clearOptions();
    this.onModelChange.emit(this.getSelectedOptions());
  }

  clearSearhQuery() {
    this.searchQuery = '';
    this.onSearch.emit(null);
  }

  clearOptions(){
    this.selectedOptions.clear();
    this.optionsText = this.updatePlaceholder ? 'Select' : '';
    this.dropdownOpen = false;
    this.dropdown.close();
  }

  updatePlaceholderText() {
    this.optionsText = this.updatePlaceholder
      ? this.selectedOptions.size > 0
        ? Array.from(this.selectedOptions.values())
          .map(option => option[this.optionName])
          .join(', ')
        : 'Select'
      : this.optionsText;
  }

  onSearchKeyup(event: any): void {
    if (this.customSearch) {
      this.optionsSize = Math.max(this.optionsSize, this.options.length);
      this.onSearch.emit(event.target.value);
    }
  }

  ngOnDestroy() {
    this.optionsText = '';
    this.selectedOptions.clear();
    this.dropdown?.openChange?.unsubscribe();
  }

  protected readonly Math = Math;
}
