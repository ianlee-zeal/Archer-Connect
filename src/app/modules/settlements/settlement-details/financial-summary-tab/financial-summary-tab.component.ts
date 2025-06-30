/* eslint-disable no-restricted-globals */
import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ActivatedRoute, Router } from '@angular/router';

import { ModalService } from '@app/services/modal.service';
import { SsnPipe, DateFormatPipe } from '@app/modules/shared/_pipes';

import { DecimalPipe } from '@angular/common';
import { GotoParentView } from '@shared/state/common.actions';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { sharedSelectors } from '@app/modules/shared/state';
import { Settlement } from '@app/models';
import { SettlementFinancialSummary } from '@app/models/settlement/settlement-financial-summary';
import * as fromSettlements from '../../state';

@Component({
  selector: 'app-financial-summary-tab',
  templateUrl: './financial-summary-tab.component.html',
  styleUrls: ['./financial-summary-tab.component.scss'],
})
export class FinancialSummaryTabComponent implements OnInit, OnDestroy {
  public settlement$ = this.store.select(sharedSelectors.settlementInfoSelectors.settlement);
  public financialSummary$ = this.store.select(fromSettlements.selectors.financialSummary);
  public settlementId: number = 0;
  public financialSummary: SettlementFinancialSummary;
  public ngDestroyed$ = new Subject<void>();

  public actionBarActionHandlers: ActionHandlersMap = {
    back: () => this.back(),
  };

  constructor(
    public store: Store<fromSettlements.SettlementState>,
    public modalService: ModalService,
    protected router: Router,
    protected elementRef: ElementRef,
    private route: ActivatedRoute,
    private datePipe: DateFormatPipe,
    private ssnPipe: SsnPipe,
    protected readonly decimalPipe: DecimalPipe,
  ) {
  }

  public ngOnInit(): void {
    this.settlement$
      .pipe(
        takeUntil(this.ngDestroyed$),
      )
      .subscribe((settlement: Settlement) => {
        if (settlement && !settlement.showFinancialSummary) {
          this.router.navigate([`/settlements/${settlement.id}/tabs/details`]);
          return;
        }
        if (settlement) {
          this.settlementId = settlement.id;
          this.store.dispatch(fromSettlements.actions.GetFinancialSummary({ settlementId: this.settlementId }));
        } else {
          this.settlementId = null;
        }
      });

    this.financialSummary$
      .pipe(
        takeUntil(this.ngDestroyed$),
      )
      .subscribe((financialSummary: SettlementFinancialSummary) => {
        this.financialSummary = financialSummary;
      });

    this.store.dispatch(fromSettlements.actions.UpdateActionBar({ actionBar: this.actionBarActionHandlers }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(fromSettlements.actions.UpdateActionBar({ actionBar: null }));

    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }

  private back(): void {
    this.store.dispatch(GotoParentView());
  }
}
