import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { IdValue } from '@app/models';
import * as fromRoot from '@app/state';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { actions } from '../../state';
import * as selectors from '../../state/selectors';

@Component({
  selector: 'app-matter-information',
  templateUrl: './matter-information.component.html',
})
export class MatterInformationComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe$ = new Subject<void>();
  public matter$ = this.store.select(selectors.matter);
  public matter: IdValue;

  private readonly actionBar: ActionHandlersMap = { back: { callback: () => this.back() } };

  constructor(
    protected store: Store<fromRoot.AppState>,
  ) {
  }

  public ngOnInit(): void {
    this.matter$
      .pipe(
        filter(matter => !!matter),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(matter => {
        this.matter = matter;
      });

    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  public back(): void {
    this.store.dispatch(GotoParentView());
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
