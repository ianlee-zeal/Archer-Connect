import { Component, Input, OnDestroy, ViewChild, TemplateRef, OnInit, HostListener, ElementRef } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tooltip-info',
  templateUrl: './tooltip-info.component.html',
  styleUrls: ['./tooltip-info.component.scss'],
})
export class TooltipInfoComponent implements OnDestroy, OnInit {
  @ViewChild('tooltip', { read: NgbTooltip, static: false }) private tooltip: NgbTooltip;
  @Input() public inline: boolean;
  @Input() public tooltipText: string;
  @Input() public templateRef: TemplateRef<any>;
  @Input() public isScrollableContent: boolean = false;
  @Input() public maxContentHeight: number = 140;
  @Input() public minContentWidth: number = 200;
  @Input() public placement: string = 'right';
  @Input() public tooltipClass: string = 'tooltip-info-container';

  public autoClose: boolean | string = true;
  public triggers = 'hover focus';

  public isOpenTooltip: boolean;

  private ngUnsubscribe$ = new Subject<void>();

  constructor(private eRef: ElementRef) {}

  ngOnInit(): void {
    if (this.isScrollableContent) {
      this.autoClose = false;
      this.triggers = 'click';
      this.placement = 'right auto';
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event): void {
    if (this.isScrollableContent) {
      // click outside
      if (!this.eRef.nativeElement.contains(event.target)) {
        this.tooltip.close();
      }
    }
  }

  public onTooltipShown(): void {
    this.isOpenTooltip = true;
  }

  public onTooltipHidden(): void {
    this.isOpenTooltip = false;
  }

  public open(): void {
    this.tooltip.open();
  }

  public close(): void {
    this.tooltip.close();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
