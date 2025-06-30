import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { EntityTypeEnum, PermissionTypeEnum, PermissionActionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { takeUntil } from 'rxjs/operators';
import { ActionHandlersMap, ActionObject } from '../../../shared/action-bar/action-handlers-map';
import { settlementInfoSelectors } from '../../../shared/state/settlement-info/selectors';
import * as fromSettlements from '../../state';

@Component({
  selector: 'app-settlement-notes-tab',
  templateUrl: './settlement-notes-tab.component.html',
  styleUrls: ['./settlement-notes-tab.component.scss'],
})
export class SettlementNotesTabComponent implements OnInit, OnDestroy {
  public entityTypeId = EntityTypeEnum.Settlements;
  public entityId: number;

  public settlement$ = this.store.select(settlementInfoSelectors.settlement);

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<fromSettlements.SettlementState>,
  ) { }

  public ngOnInit(): void {
    this.settlement$.pipe(
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(settlement => {
        if (settlement) {
          this.entityId = settlement.id;
        } else {
          this.entityId = null;
        }
      });
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    const actionBarNew = actionBar?.new as ActionObject;

    if (actionBarNew) {
      actionBarNew.permissions = PermissionService.create(PermissionTypeEnum.SettlementNotes, PermissionActionTypeEnum.Create);
    }

    this.store.dispatch(fromSettlements.actions.UpdateActionBar({ actionBar: { ...actionBar } }));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
