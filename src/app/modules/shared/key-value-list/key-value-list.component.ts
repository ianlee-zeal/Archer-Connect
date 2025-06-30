import { Component, Input, ViewChildren, QueryList, ElementRef, Renderer2, OnDestroy, AfterViewInit, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { KeyValue } from '@app/models';
import moment from 'moment-timezone';

/**
 * Component for showing Raw JSON key-value list
 *
 * @export
 * @class KeyValueListComponent
 */
@Component({
  selector: 'app-key-value-list',
  templateUrl: './key-value-list.component.html',
  styleUrls: ['./key-value-list.component.scss'],
})
export class KeyValueListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('cardRow', { read: ElementRef }) public cardRows: QueryList<ElementRef>;
  /**
   * Gets or sets array of key value elements
   *
   * @type KeyValue[]
   * @memberof KeyValueListComponent
   */
  @Input()
  public data: KeyValue[];
  @Input()
  public lastLoadedDate: Date;

  public dataIsStale: boolean;

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private renderer: Renderer2,
  ) {

  }
  ngOnInit(): void {
    if (this.lastLoadedDate) {
      this.dataIsStale = moment().diff(this.lastLoadedDate, 'd') > 1;
    }
  }

  public ngAfterViewInit(): void {
    if (this.cardRows.length > 0) {
      this.setMaximumLabelWidth(this.cardRows);
    }

    this.cardRows.changes
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(cardRows => {
        this.setMaximumLabelWidth(cardRows);
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private setMaximumLabelWidth(cardRows: QueryList<ElementRef>): void {
    const labelWidths: number[] = cardRows.map(row => this.getLabelContainerElementWidth(row));
    const maxWidth = Math.max(...labelWidths);

    cardRows.forEach(row => {
      this.renderer.setStyle(this.getLabelContainerElement(row), 'width', `${maxWidth}px`);
    });
  }

  private getLabelContainerElement(element: ElementRef) {
    const label = element.nativeElement.querySelector('label');

    return label.parentElement;
  }

  private getLabelContainerElementWidth(element: ElementRef): number {
    const labelContainerElement = this.getLabelContainerElement(element);

    if (!labelContainerElement) {
      return 0;
    }

    return Math.ceil(labelContainerElement.getBoundingClientRect().width) || 0;
  }
}
