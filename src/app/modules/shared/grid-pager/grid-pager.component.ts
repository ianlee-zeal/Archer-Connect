import { Component, OnChanges, SimpleChanges } from '@angular/core';

import { ArrayHelper } from '@app/helpers/array.helper';

import { CommonHelper } from '@app/helpers/common.helper';

import { BasePagination } from '../_abstractions/base-pagination';

const BUTTONS_COUNT_TO_SHOW = 5;

@Component({
  selector: 'app-grid-pager',
  templateUrl: './grid-pager.component.html',
  styleUrls: ['./grid-pager.component.scss'],
})
export class GridPagerComponent extends BasePagination implements OnChanges {
  public ngOnChanges(changes: SimpleChanges): void {
    const { pager } = this;

    const pagerChange = changes[CommonHelper.nameOf({ pager })];

    if (pagerChange && pager) {
      this.buttonsToShow = this.getButtonsToShow();
    }
  }

  public toPageClick(pageNumber: number): void {
    this.toPage.emit(pageNumber);
  }

  private getButtonsToShow(): number[] {
    const { currentPage } = this.pager;
    const totalPages = this.getLastPageNumber();

    let head = 1;
    let tail = totalPages || 1;

    if (totalPages > BUTTONS_COUNT_TO_SHOW) {
      const halfSize = Math.floor(BUTTONS_COUNT_TO_SHOW / 2);
      if (currentPage <= halfSize) {
        head = 1;
        tail = BUTTONS_COUNT_TO_SHOW;
      } else if (currentPage >= totalPages - halfSize) {
        head = totalPages - BUTTONS_COUNT_TO_SHOW + 1;
        tail = totalPages;
      } else {
        head = currentPage - halfSize;
        tail = head + BUTTONS_COUNT_TO_SHOW - 1;
      }
    }

    return ArrayHelper.range(head, tail);
  }
}
