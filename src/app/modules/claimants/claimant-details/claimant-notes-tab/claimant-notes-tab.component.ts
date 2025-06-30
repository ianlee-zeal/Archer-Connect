import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { EntityTypeEnum } from '@app/models/enums';
import { filter, takeUntil } from 'rxjs/operators';
import { ActionHandlersMap } from '../../../shared/action-bar/action-handlers-map';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { ClaimantDetailsState } from '../state/reducer';

@Component({
  selector: 'app-claimant-notes-tab',
  templateUrl: './claimant-notes-tab.component.html',
  styleUrls: ['./claimant-notes-tab.component.scss'],
})
export class ClaimantNotesTabComponent implements OnInit, OnDestroy {
  public entityTypeId = EntityTypeEnum.Clients;
  public entityId: number;

  public claimant$ = this.store.select(selectors.item);

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
  ) { }

  public ngOnInit(): void {
    this.claimant$.pipe(
      filter(claimant => !!claimant),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(claimant => {
        this.entityId = claimant.id;
      });
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar }));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
