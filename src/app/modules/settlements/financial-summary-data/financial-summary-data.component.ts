import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';

import { SettlementFinancialSummary } from '@app/models/settlement/settlement-financial-summary';
import { AbsoluteNumberPipe } from '@app/modules/shared/_pipes/absolutenumber.pipe';

@Component({
  selector: 'app-financial-summary-data',
  templateUrl: './financial-summary-data.component.html',
  styleUrls: ['./financial-summary-data.component.scss'],
})
export class FinancialSummaryData implements OnInit, OnDestroy {
  @Input() public financialSummary: SettlementFinancialSummary;
  @Input() public settlementId: number;

  private ngUnsubscribe$ = new Subject<void>();
  constructor(
    private absoluteNumberPipe:AbsoluteNumberPipe
  )
  {}
  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public almostZero(value?: number): boolean {
    return value < 0.005 && value > -0.005;
  }
}
