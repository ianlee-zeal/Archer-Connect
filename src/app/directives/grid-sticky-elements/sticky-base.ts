import { AfterViewInit, ElementRef, OnDestroy, Directive } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Directive()
export abstract class StickyBase implements OnDestroy, AfterViewInit {
  private ngUnsubscribe$ = new Subject<void>();

  protected gridDom: HTMLElement;
  protected gridHorizontalScrollBar: HTMLDivElement;
  protected gridBodyViewPort: HTMLDivElement;
  protected gridHeader: HTMLDivElement;
  protected gridRoot: HTMLDivElement;

  public constructor(private el: ElementRef) {}

  public ngAfterViewInit(): void {
    this.gridDom = this.el.nativeElement;
    this.gridHorizontalScrollBar = this.gridDom.querySelector('div.ag-body-horizontal-scroll');
    this.gridBodyViewPort = this.gridDom.querySelector('div.ag-body-viewport');
    this.gridHeader = this.gridDom.querySelector('div.ag-header');
    this.gridRoot = this.gridDom.querySelector('div.ag-root-wrapper');

    this.subscribeToEvents();
    this.stickElement();
  }

  protected abstract stickElement(): void;

  private subscribeToEvents() {
    fromEvent(document, 'scroll')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(this.stickElement.bind(this));
    fromEvent(document, 'gridRedrawn')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(this.stickElement.bind(this));
    fromEvent(window, 'resize')
      .pipe(takeUntil(this.ngUnsubscribe$), debounceTime(200))
      .subscribe(this.onResize.bind(this));
  }

  protected onResize() {
    this.stickElement();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
