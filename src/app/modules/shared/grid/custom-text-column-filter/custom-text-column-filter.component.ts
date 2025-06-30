import { Component } from '@angular/core';
import { AgInputTextField, IFloatingFilter, IFloatingFilterParams, NumberFilter, NumberFilterModel, SimpleFilter, TextFilter, TextFilterModel } from 'ag-grid-community';
import { AgFrameworkComponent } from 'ag-grid-angular';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';

export interface CustomTextColumnFilterParams {
  disabled?: boolean;
  onlyNumbers?: boolean;
  isAutofocused?: boolean;
  isDecimal?: boolean;
  stripDashes?: boolean;
  isNegativeNumber?: boolean;
  useDashAsAnEmptyValue?: boolean;
}

export interface CustomTextFloatingFilterParams extends CustomTextColumnFilterParams, IFloatingFilterParams {

}

@Component({
  selector: 'app-custom-text-column-filter',
  templateUrl: './custom-text-column-filter.component.html',
  styleUrls: ['./custom-text-column-filter.component.scss'],
})
export class CustomTextColumnFilterComponent implements IFloatingFilter, AgFrameworkComponent<CustomTextFloatingFilterParams> {
  public currentValue: string;
  public disabled: boolean;
  public onlyNumbers: boolean;
  public isAutofocused: boolean;
  public isDecimal?: boolean;
  public stripDashes?: boolean;
  public tabToNextInput: Function = AGGridHelper.tabToNextInput;

  private params: CustomTextFloatingFilterParams;

  public agInit(params: CustomTextFloatingFilterParams): void {
    this.params = params;
    this.disabled = params.disabled;
    this.onlyNumbers = params.onlyNumbers;
    this.isAutofocused = params.isAutofocused;
    this.isDecimal = params.isDecimal;
    this.stripDashes = params.stripDashes;
    this.currentValue = '';
  }

  public onParentModelChanged(parentModel: any): void {
    if (!parentModel) {
      this.currentValue = '';
    } else {
      // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
      // so just read off the value and use that
      this.currentValue = parentModel.filter;
    }
  }

  public valueChanged(): void {
    const value = this.currentValue === '' ? null : this.currentValue;
    let trimmedValue = value;

    if (this.isDecimal) {
      trimmedValue = value?.replace(/[^\d\.]/gi, '');
    }

    if (this.stripDashes) {
      trimmedValue = value?.replace(/\-/gi, '');
    }

    this.params.parentFilterInstance((instance: TextFilter | NumberFilter) => {
      const inst = (instance as SimpleFilter<TextFilterModel, string, AgInputTextField> | SimpleFilter<NumberFilterModel, number | string, AgInputTextField>);
      inst.onFloatingFilterChanged(
        this.onlyNumbers || this.isDecimal ? 'equals' : 'contains',
        trimmedValue,
      );
    });
  }
}
