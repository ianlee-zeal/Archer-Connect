import { Input, Output, EventEmitter, Directive } from "@angular/core";
import { Pager } from '../grid-pager/pager';

@Directive()
export abstract class BasePagination  {
  @Input() public pager: Pager;

  @Output() public toPage: EventEmitter<number> = new EventEmitter();

  public firstOnPage: number;
  public lastOnPage: number;
  public entityName: string;
  public buttonsToShow: number[];

  get isPrevButtonsShow (): boolean {
    return this.pager.currentPage !== 1;
  }

  get isNextButtonsShow (): boolean {
    return this.pager.currentPage !== this.getLastPageNumber();
  }

  public toFirstPageClick(): void {
    this.toPage.emit(1);
  }

  public toLastPageClick(): void {
    this.toPage.emit(this.getLastPageNumber());
  }

  public toPrevPageClick(): void {
    const { currentPage } = this.pager;

    if (currentPage > 1) {
      this.toPage.emit(currentPage - 1);
    }
  }

  public toNextPageClick(): void {
    const { currentPage } = this.pager;

    if (currentPage - 1 < this.getLastPageNumber()) {
      this.toPage.emit(currentPage + 1);
    }
  }

  public getLastPageNumber(): number {
    const { totalCount, pageSize } = this.pager;

    return Math.ceil(totalCount / pageSize);
  }
}
