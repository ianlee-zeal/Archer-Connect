import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ClaimantOverviewProbate } from '@app/models/claimant-overview/claimant-overview-probate';
import { LienServiceStatus, ProductCategory } from '@app/models/enums';
import { ProbatePhase } from '@app/models/enums/probate-phase.enum';
import { InfoCardState } from '@app/models/enums/info-card-state.enum';

@Component({
  selector: 'app-claimant-dashboard-probate',
  templateUrl: './claimant-dashboard-probate.component.html',
  styleUrl: '../claimant-dashboard-services-summary.component.scss'
})
export class ClaimantDashboardProbateComponent implements OnInit {

  @Input() public probateItem: ClaimantOverviewProbate;

  protected isFinalized = false;
  protected isClosedWithdrawnOrNotMapped: boolean;
  protected infoCardState: InfoCardState;
  private claimantId: number;

  constructor(
    protected readonly router: Router,
    private readonly route: ActivatedRoute,
  ) { }

  public ngOnInit(): void {
    this.route.parent.params.subscribe((params: Params) => {
      this.claimantId = params.id;
    });

    this.isFinalized = this.probateItem.service.status.id === LienServiceStatus.Finalized;
    this.isClosedWithdrawnOrNotMapped = this.probateItem.phaseId === ProbatePhase.ClosedWithdrawn || this.probateItem.phaseId === ProbatePhase.NotMapped;
    this.infoCardState = this.getInfoCardState();
  }

  protected getInfoCardState(): InfoCardState {
    if (this.isClosedWithdrawnOrNotMapped) {
      return InfoCardState.Pending;
    }

    return this.isFinalized ? InfoCardState.Final : InfoCardState.Pending;
  }

  onClick(): void {
    this.router.navigate(['claimants', `${this.claimantId}`, 'services', `${ProductCategory.Probate}`]);
  }

}
