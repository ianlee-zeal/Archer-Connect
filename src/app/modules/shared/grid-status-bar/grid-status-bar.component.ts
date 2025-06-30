import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import { StringHelper } from '@app/helpers/string.helper';
import { CommonHelper } from '@app/helpers/common.helper';
import { Pager } from '../grid-pager/pager';

@Component({
  selector: 'app-grid-status-bar',
  templateUrl: './grid-status-bar.component.html',
  styleUrls: ['./grid-status-bar.component.scss'],
})
export class GridStatusBar implements OnChanges {
  @Input() public pager: Pager;
  @Input() public loading: boolean;
  @Input() public selectedCount: number;
  @Input() public isSelectedVisible: boolean;
  @Input() public additionalPageItemsCountValues: [];

  @Output() public navigate: EventEmitter<number> = new EventEmitter();
  @Output() public itemsPerPageChange: EventEmitter<number> = new EventEmitter();

  public firstOnPage: number;
  public lastOnPage: number;
  public entityLabel: string;
  public isVisible: boolean;

  public ngOnChanges(changes: SimpleChanges): void {
    const { pager } = this;

    const pagerChange = changes[CommonHelper.nameOf({ pager })];

    if (pagerChange && pager) {
      this.firstOnPage = (pager.currentPage - 1) * pager.pageSize + 1;
      this.lastOnPage = Math.min(this.firstOnPage + pager.pageSize - 1, pager.totalCount);
      this.entityLabel = StringHelper.capitalize(pager.entityLabel || '');
      this.isVisible = Math.ceil(this.pager.totalCount / this.pager.pageSize) > 1;
    }
  }

  public toPage(pageNumber: number): void {
    this.navigate.emit(pageNumber);
  }
}
