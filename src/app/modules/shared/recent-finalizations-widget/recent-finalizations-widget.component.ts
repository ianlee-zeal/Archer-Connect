import { Component, Input } from '@angular/core';

@Component({
  selector: 'recent-finalizations-widget',
  templateUrl: './recent-finalizations-widget.component.html',
  styleUrls: ['./recent-finalizations-widget.component.scss'],
})
export class RecentFinalizationsWidgetComponent {
  @Input() public start: Date;
  @Input() public end: Date;
  @Input() public finalizedClaimantsCount?: number;
  @Input() public productCategoryId: number;
  @Input() public onFinalizationWidgetChange: any;

  public ngOnInit(): void {}

  onRangeChanged(event: any) {
    if (this.onFinalizationWidgetChange) {
      this.onFinalizationWidgetChange({
        productCategoryId: this.productCategoryId,
        from: event.from,
        to: event.to,
      });
    }
  }
}
