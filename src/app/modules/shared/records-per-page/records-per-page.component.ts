import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PageItemsCountHelper } from '@app/helpers/page-items-count.helper';
import { BasePagination } from '../_abstractions/base-pagination';

export const PAGES_COUNT_FACTOR = 25;
export const PAGES_COUNTS = [25, 50, 75, 100];

@Component({
  selector: 'app-records-per-page',
  templateUrl: './records-per-page.component.html',
  styleUrls: ['./records-per-page.component.scss'],
})
export class RecordsPerPageComponent extends BasePagination implements OnChanges {
  @Input() public additionalPageItemsCountValues: number[];
  @Output() public itemsPerPageChange: EventEmitter<number> = new EventEmitter();

  public pageItemsCountOptions = PageItemsCountHelper.getCountPageItems(PAGES_COUNT_FACTOR);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.additionalPageItemsCountValues?.currentValue) {
      const additionalPageItemsCountValues = changes.additionalPageItemsCountValues?.currentValue.map(item => ({ id: item, name: `${item}` }));
      this.pageItemsCountOptions = [...additionalPageItemsCountValues, ...this.pageItemsCountOptions];
    }
  }
}
