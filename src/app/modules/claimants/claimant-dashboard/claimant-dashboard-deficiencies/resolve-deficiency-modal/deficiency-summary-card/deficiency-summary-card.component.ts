import { Component, Input } from '@angular/core';
import { IconHelper } from '@app/helpers';
import { ClaimantDeficiency } from '@app/models/claimant-deficiency';

@Component({
  selector: 'app-deficiency-summary-card',
  templateUrl: './deficiency-summary-card.component.html',
  styleUrls: ['../../../claimant-dashboard-services-summary/claimant-dashboard-services-summary.component.scss', './deficiency-summary-card.component.scss']
})
export class DeficiencySummaryCardComponent{

  @Input() public deficiencyItem: ClaimantDeficiency;

  protected stageIconSrc: string;

  ngOnInit(): void {
    this.stageIconSrc = IconHelper.getDeficiencyStageIcon(this.deficiencyItem.stageId);
  }
}
