import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import * as personSelectors from '@app/modules/dashboard/persons/state/selectors';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ClaimantDetailsState } from '../state/reducer';
import * as actions from '../state/actions';
import { GotoParentView } from '../../../shared/state/common.actions';

@Component({
  selector: 'app-contact-tab',
  templateUrl: './contact-tab.component.html',
  styleUrls: ['./contact-tab.component.scss'],
})
export class ContactTabComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();
  private readonly personsActionBar$ = this.store.select(personSelectors.actionBar);
  private readonly actionBar: ActionHandlersMap = { back: () => this.cancel() };

  constructor(
    private store: Store<ClaimantDetailsState>,
  ) { }

  ngOnInit() {
    this.personsActionBar$.pipe(
      filter(actionBar => !!actionBar),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(actionBar => {
        this.store.dispatch(actions.UpdateClaimantsActionBar({
          actionBar: {
            ...actionBar,
            ...this.actionBar,
          },
        }));
      });
  }

  private cancel(): void {
    this.store.dispatch(GotoParentView());
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
