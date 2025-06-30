import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { sharedSelectors } from '@app/modules/shared/state';
import { EntityTypeEnum } from '@app/models/enums';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { ClaimantDetailsState } from '../state/reducer';
import { GotoParentView } from '../../../shared/state/common.actions';

@Component({
  selector: 'app-addresses-tab',
  templateUrl: './addresses-tab.component.html',
  styleUrls: ['./addresses-tab.component.scss'],
})
export class AddressesTabComponent implements OnInit, OnDestroy {
  readonly item$ = this.store.select(selectors.item);
  readonly addressesListActionBar$ = this.store.select(sharedSelectors.addressesListSelectors.actionBar);

  readonly entityType = EntityTypeEnum.Persons;
  readonly gridId = GridId.ClaimantAddresses;

  private readonly actionBar: ActionHandlersMap = { back: () => this.onCancel() };
  private readonly ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
  ) { }

  public ngOnInit(): void {
    this.addressesListActionBar$.pipe(
      filter(actionBar => !!actionBar),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(actionBar => {
      this.store.dispatch(actions.UpdateClaimantsActionBar({
        actionBar: {
          ...actionBar,
          ...this.actionBar,
        },
      }));
    });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private onCancel(): void {
    this.store.dispatch(GotoParentView());
  }
}
