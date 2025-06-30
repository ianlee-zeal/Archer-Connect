import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QSFAdmin } from '@app/models/claimant-overview/claimant-overview-qsf-admin';
import { LienServiceStatus } from '@app/models/enums';
import { InfoCardState } from '@app/models/enums/info-card-state.enum';
import * as fromRootActions from '@app/state/root.actions';
import { Store } from '@ngrx/store';
import * as fromShared from '@shared/state';

@Component({
  selector: 'app-claimant-dashboard-qsfadmin',
  templateUrl: './claimant-dashboard-qsfadmin.component.html',
  styleUrls: ['../claimant-dashboard-services-summary.component.scss']
})

export class ClaimantDashboardQSFAdminComponent implements OnInit {
  @Input() public qsfData: QSFAdmin;

  protected isFinalized: boolean;
  protected infoCardState: InfoCardState;

  constructor(
    private readonly store: Store<fromShared.AppState>,
    private readonly route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.isFinalized = this.qsfData.service.status.id === LienServiceStatus.Finalized;
    this.infoCardState = this.isFinalized ? InfoCardState.Final : InfoCardState.Pending;
  }

  onClick(): void {
    this.route.parent.params.subscribe(params => {
      this.store.dispatch(fromRootActions.NavigateToUrl({ url: `/claimants/${params.id}/payments/tabs/ledger-summary` }));
    });
  }
}
