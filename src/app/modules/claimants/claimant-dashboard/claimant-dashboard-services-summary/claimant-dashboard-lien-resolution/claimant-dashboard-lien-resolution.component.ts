import { Component, Input, OnInit } from '@angular/core';
import { ClaimantOverviewLienData } from '@app/models/claimant-overview/claimant-overview-lien-data';
import { InfoCardState } from '@app/models/enums/info-card-state.enum';
import { Store } from '@ngrx/store';
import * as fromShared from '@shared/state';
import { ActivatedRoute } from '@angular/router';
import { LienServiceStatus } from '@app/models/enums';
import * as fromRootActions from '@app/state/root.actions';

@Component({
  selector: 'app-claimant-dashboard-lien-resolution',
  templateUrl: './claimant-dashboard-lien-resolution.component.html',
  styleUrls: ['../claimant-dashboard-services-summary.component.scss']
})
export class ClaimantDashboardLienResolutionComponent implements OnInit {
  @Input() public lienResolution: ClaimantOverviewLienData;

  protected isFinalized: boolean;
  protected infoCardState: InfoCardState;

  constructor(
    private readonly store: Store<fromShared.AppState>,
    private readonly route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.isFinalized = this.lienResolution.service.status.id === LienServiceStatus.Finalized;
    this.infoCardState = this.isFinalized ? InfoCardState.Final : InfoCardState.Pending;
  }

  onClick(): void {
    this.route.parent.params.subscribe(params => {
      this.store.dispatch(fromRootActions.NavigateToUrl({ url: `/claimants/${params.id}/services/1` }));
    });
  }
}
