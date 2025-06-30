import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-claimant-summary-buttons-renderer',
  templateUrl: './claimant-summary-buttons-renderer.html',
  styleUrls: ['./claimant-summary-buttons-renderer.scss'],
})

export class ClaimantSummaryButtonsRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public isLedgerExist: boolean;
  public title: string;

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
    this.isLedgerExist = Boolean(this.params.data.claimSettlementLedgerId);
    this.title = this.isLedgerExist ? 'View Stage History' : 'Stage History is not available';
  }

  goToClaimantSummaryHandler() {
    this.params.goToClaimantSummaryHandler(this.params);
  }

  onOpenStageHistoryModalHandler() {
    this.params.openStageHistoryModalHandler(this.params);
  }
}
