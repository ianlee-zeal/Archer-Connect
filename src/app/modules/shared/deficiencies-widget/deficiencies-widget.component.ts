import { Component, Input } from '@angular/core';

@Component({
  selector: 'deficiencies-widget',
  templateUrl: './deficiencies-widget.component.html',
  styleUrls: ['./deficiencies-widget.component.scss'],
})
export class DeficienciesWidgetComponent {
  @Input() public claimantsWithDeficiencies: number;
  @Input() public totalClaimants: number;
  @Input() public monthlyReportDay?: string;

  public tooltipText: string = 'Last Deficiency report available for download on the Documents tab.';
}
