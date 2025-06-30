import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { settlementInfoSelectors } from '@app/modules/shared/state/settlement-info/selectors';
import { Subject } from 'rxjs';
import { GotoParentView } from '@shared/state/common.actions';
import { EntityTypeEnum } from '@app/models/enums';
import * as fromSettlements from '../../state';

@Component({
  selector: 'app-settlement-documents-tab',
  templateUrl: './settlement-documents-tab.component.html',
})

export class SettlementDocumentsTabComponent implements OnDestroy {
  public entityTypeId = EntityTypeEnum.Settlements;
  public readonly gridId: GridId = GridId.SettlementDocuments;
  public readonly item$ = this.store.select(settlementInfoSelectors.settlement);

  public ngDestroyed$ = new Subject<void>();

  public actionBarActionHandlers: ActionHandlersMap = { back: () => this.back() };

  constructor(public store: Store<fromSettlements.SettlementState>) {}

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    this.store.dispatch(fromSettlements.actions.UpdateActionBar({ actionBar: { ...actionBar, ...this.actionBarActionHandlers } }));
  }

  private back(): void {
    this.store.dispatch(GotoParentView());
  }

  public ngOnDestroy(): void {
    this.store.dispatch(fromSettlements.actions.UpdateActionBar({ actionBar: null }));

    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
