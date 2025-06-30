import { Component } from '@angular/core';
import { GridDateSelectorComponent, IAppDateFilterParams } from '../grid-date-selector/grid-date-selector.component';

@Component({
  selector: 'app-grid-date-range-selector',
  templateUrl: './grid-date-range-selector.component.html',
  styleUrls: ['./grid-date-range-selector.component.scss'],
})
export class GridDateRangeSelectorComponent extends GridDateSelectorComponent {
  public isRange = true;
  public fromDateModel: Date;
  public toDateModel: Date;

  public onArrDateSelected(dates: Date [] | Date): void {
    const result = Array.isArray(dates) ? dates : [dates];
    (this.params.filterParams as IAppDateFilterParams).onDateRangeFilterChanged(result);
  }
}
