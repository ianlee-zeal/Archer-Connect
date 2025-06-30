import { Component, Input } from '@angular/core';
import { InfoCardState } from '@app/models/enums/info-card-state.enum';

@Component({
  selector: 'app-claimant-dashboard-uncured-deficiencies-count',
  templateUrl: './claimant-dashboard-uncured-deficiencies-count.component.html',
  styleUrls: ['../claimant-dashboard-services-summary.component.scss']

})
export class ClaimantDashboardUncuredDeficienciesCountComponent {

  @Input() uncuredDeficienciesCount: number;
  @Input() routerLinkActivated: boolean = true;

  protected readonly InfoCardState = InfoCardState;
}
