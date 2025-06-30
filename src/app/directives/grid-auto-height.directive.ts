import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Directive which calculates height of the grid component according to the height of the parent element.
 *
 * @export
 * @class GridAutoHeightDirective
 * @implements {AfterViewInit}
 * @implements {OnDestroy}
 */
@Directive({ selector: '[gridAutoHeight]' })
export class GridAutoHeightDirective implements AfterViewInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  /**
   *Gets or sets the flag which enables or disables attached directive logic.
   *
   * @memberof GridAutoHeightDirective
   */
  @Input()
    enabledAutoHeight = true;

  /**
   * Returns current native element as HTML element
   *
   * @readonly
   * @type {HTMLElement}
   * @memberof GridAutoHeightDirective
   */
  get element(): HTMLElement {
    return this.el.nativeElement as HTMLElement;
  }

  /**
   * Creates an instance of AutoScrollSideMenuItemDirective.
   * @param {ElementRef} el - current element reference
   * @memberof AutoScrollSideMenuItemDirective
   */
  public constructor(private el: ElementRef) { }

  /** @inheritdoc */
  ngAfterViewInit(): void {
    if (!this.enabledAutoHeight) {
      return;
    }

    fromEvent(window, 'resize')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(this.setHeight.bind(this));

    this.setHeight();
  }

  private setHeight() {
    let element = this.element;
    let parent: HTMLElement;
    let parentHeight: number;
    let isTargetedParent: boolean;
    let isTabContent: boolean;

    element.style.height = '';
    const gridHeight = element.getBoundingClientRect().height;

    do {
      parent = element.parentElement;
      if (parent) {
        isTabContent = !!parent.closest('.tab-content');
        isTargetedParent = parent.classList.contains('page-content') || parent.classList.contains('tab-content');
        if (isTargetedParent) {
          parentHeight = parent.getBoundingClientRect().height;
        }
        element = parent;
      }
    } while (parent && !isTargetedParent);

    if (parentHeight > 0 && gridHeight > 0) {
      let top = element.getBoundingClientRect().top; // 40 means top and bottom padding (both are 20px) for the page-content class
      if (!isTabContent) {
        top -= 40;
      }
      if (top > 0) {
        const heightFinal = parentHeight - top;
        if (heightFinal > 0) {
          this.element.style.height = `${heightFinal}px`;
        }
      }
    }
  }

  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
