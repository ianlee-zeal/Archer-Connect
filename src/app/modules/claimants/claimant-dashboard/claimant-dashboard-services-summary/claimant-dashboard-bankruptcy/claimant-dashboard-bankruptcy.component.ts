import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ClaimantOverviewBankruptcy } from '@app/models/claimant-overview/claimant-overview-bankruptcy';
import { LienServiceStatus, ProductCategory } from '@app/models/enums';
import { BankruptcyPhase } from '@app/models/enums/bankruptcy-phase.enum';
import { InfoCardState } from '@app/models/enums/info-card-state.enum';

@Component({
  selector: 'app-claimant-dashboard-bankruptcy',
  templateUrl: './claimant-dashboard-bankruptcy.component.html',
  styleUrl: '../claimant-dashboard-services-summary.component.scss'
})
export class ClaimantDashboardBankruptcyComponent implements OnInit {

  @Input() public bankruptcyItem: ClaimantOverviewBankruptcy;

  protected isFinalized = false;
  protected infoCardState: InfoCardState;
  protected isBankruptcyInactive: boolean;
  private claimantId: number;

  constructor(
    protected readonly router: Router,
    private readonly route: ActivatedRoute,
  ) { }

  public ngOnInit(): void {
    this.route.parent.params.subscribe((params: Params) => {
      this.claimantId = params.id;
    });

    this.isFinalized = this.bankruptcyItem.service?.status.id === LienServiceStatus.Finalized;
    this.isBankruptcyInactive = this.bankruptcyItem.phaseId === BankruptcyPhase.Inactive;
    this.infoCardState = this.getInfoCardState();
  }

  protected getInfoCardState(): InfoCardState {
    if (this.isBankruptcyInactive) {
      return InfoCardState.Pending;
    }

    return this.isFinalized ? InfoCardState.Final : InfoCardState.Pending;
  }

  onClick(): void {
    this.router.navigate(['claimants', `${this.claimantId}`, 'services', `${ProductCategory.Bankruptcy}`]);
  }

}
