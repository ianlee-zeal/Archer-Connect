/* eslint-disable no-restricted-globals */
import { Component, ViewEncapsulation } from '@angular/core';
import { AgInputTextField, IFloatingFilter, NumberFilter, NumberFilterModel, SimpleFilter, TextFilter, TextFilterModel } from 'ag-grid-community';
import { AgFrameworkComponent } from 'ag-grid-angular';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { Observable, of } from 'rxjs';
import { SelectOption } from '../../_abstractions/base-select';
import { IDropdownFloatingFilterParams } from './i-dropdown-floating-filter-params';

@Component({
  selector: 'app-dropdown-column-filter',
  templateUrl: './dropdown-column-filter.component.html',
  styleUrls: ['./dropdown-column-filter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DropdownColumnFilterComponent implements IFloatingFilter, AgFrameworkComponent<IDropdownFloatingFilterParams> {
  private params: IDropdownFloatingFilterParams;

  public currentValue: number | null = null;
  public options$: Observable<SelectOption[]>;
  public tabToNextInput: Function = AGGridHelper.tabToNextInput;
  public filterByName: boolean = false;
  public searchable: boolean = false;
  public callback: Function;
  public asyncOptions$: Observable<SelectOption[]>;

  agInit(params: IDropdownFloatingFilterParams): void {
    this.asyncOptions$ = params.asyncOptions;
    this.params = params;
    this.options$ = params.asyncOptions || of(params.options);
    this.filterByName = params.filterByName;
    this.searchable = params.searchable;
    this.callback = params.callback;
    this.currentValue = params.defaultValue ?? null;
    if (this.currentValue !== null) {
      this.setParentFilterValue(this.currentValue);
    }
  }

  onParentModelChanged(parentModel: any): void {
    if (!parentModel) {
      this.currentValue = null;
    } else {
      this.currentValue = parentModel.filter;
    }
  }

  onChange(value: number | string): void {
    let newValue;
    if (typeof value === 'number') {
      newValue = isNaN(value) ? null : +value;
    } else {
      newValue = (value === 'null') ? '' : value; // in case of null, empty string passed so no filterModel is generated with 'null' value
    }
    this.setParentFilterValue(newValue);
  }

  public onInputSearchTerm(searchTerm: string) {
    this.callback(searchTerm);
  }

  public searchFn = () => true;

  private setParentFilterValue(newValue) {
    this.params.parentFilterInstance((instance: NumberFilter | TextFilter) => {
      const inst = (instance as SimpleFilter<TextFilterModel, string, AgInputTextField> | SimpleFilter<NumberFilterModel, number | string, AgInputTextField>);
      inst.onFloatingFilterChanged(
        'equals',
        newValue,
      );
    });
  }
}
