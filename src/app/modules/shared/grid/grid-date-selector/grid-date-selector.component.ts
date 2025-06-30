import { Component } from '@angular/core';
import { IDateAngularComp } from 'ag-grid-angular';
import { IDateParams, IDateFilterParams, IFilterParams } from 'ag-grid-community';

interface ICustomDateParams extends IDateParams {
  filterParams: ICustomDateFilterParams;
}

interface ICustomDateFilterParams extends IDateFilterParams, IFilterParams, IAppDateFilterParams {}

export interface IAppDateFilterParams {
  isAutofocused?: boolean;
  onDateRangeFilterChanged?: (dates: Date[]) => void;
}

@Component({
  selector: 'app-grid-date-selector',
  templateUrl: './grid-date-selector.component.html',
  styleUrls: ['./grid-date-selector.component.scss'],
})
export class GridDateSelectorComponent implements IDateAngularComp {
  public date: Date;
  public isAutofocused: boolean = false;

  protected params: IDateParams;

  public agInit(params: ICustomDateParams): void {
    const { filterParams } = params;

    if (filterParams) {
      this.isAutofocused = filterParams.isAutofocused;
    }

    this.params = params;
  }

  public getDate(): Date {
    return this.date;
  }

  public setDate(date: Date): void {
    this.date = date;
  }

  public onDateSelected(newDate: Date): void {
    this.date = newDate;

    this.params.onDateChanged();
  }
}
