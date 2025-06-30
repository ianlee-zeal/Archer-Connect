import { Component, ViewEncapsulation } from '@angular/core';
import { AgInputTextField, IFilter, IFloatingFilter, NumberFilter, NumberFilterModel, SimpleFilter, TextFilter, TextFilterModel } from 'ag-grid-community';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AgFrameworkComponent } from 'ag-grid-angular';
import { SelectOption } from '../../_abstractions/base-select';
import { IDropdownFloatingFilterParams } from '../dropdown-column-filter/i-dropdown-floating-filter-params';

@Component({
  selector: 'app-multiselect-dropdown-column-filter',
  templateUrl: './multiselect-dropdown-column-filter.component.html',
  styleUrls: ['./multiselect-dropdown-column-filter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MultiselectDropdownColumnFilterComponent implements IFloatingFilter, AgFrameworkComponent<IDropdownFloatingFilterParams> {
  public currentValue: number | string | null;
  public options: SelectOption[];
  public tabToNextInput: Function = AGGridHelper.tabToNextInput;
  private params: IDropdownFloatingFilterParams;
  public values: any[] = [];
  public filterByName: boolean = false;

  public agInit(params: IDropdownFloatingFilterParams): void {
    this.params = params;
    this.options = params.options;
    this.filterByName = params.filterByName;
    this.currentValue = null;
  }

  public onParentModelChanged(parentModel: any): void {
    switch (true) {
      case !parentModel:
        this.currentValue = null;
        break;

      case parentModel instanceof Array:
        this.values = parentModel;
        break;

      default: {
        this.currentValue = parentModel.filter;
        this.values = this.options.filter(a => this.values.some(b => a.id === b.id));
        this.options = this.options.map(item => ({
          ...item,
          checked: this.values.includes(item),
        }));
      }
    }
  }

  public onChange(values: any): void {
    this.values = values;
    this.options = this.options.map(item => ({ ...item, checked: values.includes(item) }));

    this.params.parentFilterInstance((instance: TextFilter | NumberFilter) => {
      // if a custom filter passed
      if ('_frameworkComponentInstance' in instance) {
        (instance as IFilter).onAnyFilterChanged();
        return;
      }
      const inst = (instance as SimpleFilter<TextFilterModel, string, AgInputTextField> | SimpleFilter<NumberFilterModel, number | string, AgInputTextField>);
      inst.onFloatingFilterChanged(
        'contains',
        this.values.map((n: any) => (this.filterByName ? n.name : n.id)).join(','),
      );
    });
  }
}
