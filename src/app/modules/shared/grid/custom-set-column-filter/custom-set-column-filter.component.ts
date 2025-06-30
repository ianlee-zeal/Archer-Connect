import { Component } from '@angular/core';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

@Component({
  selector: 'app-custom-set-column-filter',
  template: '',
})
export class CustomSetColumnFilterComponent implements IFilterAngularComp {
  params: IFilterParams;
  valueGetter: (params) => any;
  selectedValues: number[] | string[] = [];

  agInit(params: IFilterParams): void {
    this.params = params;
    this.valueGetter = params.valueGetter;
  }

  doesFilterPass(params: IDoesFilterPassParams) {
    if (!this.isFilterActive()) return true;

    const valueGetter = this.valueGetter;
    const rowValue = valueGetter(params);

    return Array.isArray(rowValue)
      ? rowValue.some(rowValueItem => this.selectedValues.some(sv => sv.id === rowValueItem))
      : this.selectedValues.some(sv => sv.id === rowValue);
  }

  isFilterActive() {
    return this.selectedValues.length > 0;
  }

  getModel() {
    return this.selectedValues;
  }

  setModel(model: any) {
    this.selectedValues = Array.isArray(model) ? model : [];
    this.params.filterChangedCallback();
  }

  onCustomFloatingFilterChanged(value: any) {
    this.selectedValues = Array.isArray(value) ? value : [];
    this.params.filterChangedCallback();
  }
}
