import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { actionBar } from '@app/modules/admin/bank-accounts/state/selectors';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { UpdateBankAccountsActionBar } from '@app/modules/admin/bank-accounts/state/actions';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { AppState } from '../state';

@Component({
  selector: 'app-org-banks',
  templateUrl: './org-banks.component.html',
})
export class OrgBanksComponent implements OnInit {
  public bankListActionBar$ = this.store.select(actionBar);

  private readonly actionBar: ActionHandlersMap = { back: () => this.cancel() };

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
  ) { }

  public ngOnInit(): void {
    this.bankListActionBar$.pipe(
      first(actionsBar => actionsBar !== null),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(actionsBar => {
        this.store.dispatch(UpdateBankAccountsActionBar({
          actionBar: {
            ...actionsBar,
            ...this.actionBar,
          },
        }));
      });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(UpdateBankAccountsActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private cancel(): void {
    this.store.dispatch(GotoParentView());
  }
}
