import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';

import * as settlementsSharedActions from '@shared/state/settlement-info/actions';
import { sharedSelectors } from '@app/modules/shared/state';
import { CanLeave } from '@app/modules/shared/_interfaces/can-leave';
import { SettlementInfoComponent } from '../../settlement-info/settlement-info.component';
import { SettlementState } from '../../state/reducer';
import * as actions from '../../state/actions';
import { GotoParentView } from '@shared/state/common.actions';

@Component({
  selector: 'app-settlement-info-tab',
  templateUrl: './settlement-info-tab.component.html',
})
export class SettlementInfoTabComponent implements CanLeave, OnInit, OnDestroy {
  @ViewChild(SettlementInfoComponent)
  settlementComponent: SettlementInfoComponent;

  private readonly settlementsActionBar$ = this.store.select(sharedSelectors.settlementInfoSelectors.actionBar);
  private readonly ngUnsubscribe$ = new Subject<void>();

  get canLeave(): boolean {
    return this.settlementComponent.canLeave;
  }

  constructor(
    private readonly store: Store<SettlementState>,
  ) { }

  ngOnInit(): void {
    this.settlementsActionBar$.pipe(
      takeUntil(this.ngUnsubscribe$),
      first(actionBar => actionBar !== null),
    )
      .subscribe(actionBar => {
        this.store.dispatch(actions.UpdateActionBar({ actionBar }));
      });
  }

  onSaveComplete(saveCompleted: boolean): void {
    if (!saveCompleted) {
      this.store.dispatch(settlementsSharedActions.GetSettlementInfo({ id: this.settlementComponent.settlement.id }));
    }
  }

  onCancel(): void {
    this.store.dispatch(GotoParentView());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
