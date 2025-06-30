import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonHelper } from '@app/helpers/common.helper';
import { SelectOption } from '../_abstractions/base-select';

export class MultiSelectOption {
  id: number;
  index: number;
  checked: boolean;
}

@Component({
  selector: 'app-multiselect-list',
  templateUrl: './multiselect-list.component.html',
  styleUrls: ['./multiselect-list.component.scss'],
})
export class MultiSelectListComponent {
  private isSelectAllEnabled: boolean;

  @Input() public options: SelectOption[];
  @Input() public isSelectAllChecked: boolean;
  @Input() public width: number = null;
  @Output() public select = new EventEmitter<MultiSelectOption>();
  @Output() public selectAll = new EventEmitter<boolean>();

  @Input()
  public get enableSelectAll() {
    return this.isSelectAllEnabled;
  }

  public set enableSelectAll(value: any) {
    this.isSelectAllEnabled = CommonHelper.setShortBooleanProperty(value);
  }

  public onSelectAll(isChecked: boolean): void {
    this.selectAll.emit(isChecked);
  }

  public onChange(event: Event, id: number, index: number): void {
    const { checked } = event.target as HTMLInputElement;

    this.select.emit({
      id,
      checked,
      index,
    });
  }
}
