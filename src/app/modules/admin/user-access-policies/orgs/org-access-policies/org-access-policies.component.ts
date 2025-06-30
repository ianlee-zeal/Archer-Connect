import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { actionBar } from '@app/modules/admin/user-access-policies/access-policies/state/selectors';
import { UpdateAccessPoliciesActionBar } from '@app/modules/admin/user-access-policies/access-policies/state/actions';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import * as fromUserAccessPolices from '../state';

@Component({
  selector: 'app-org-access-policies',
  templateUrl: './org-access-policies.component.html',
})
export class OrgAccessPoliciesComponent implements OnInit {
  public item$ = this.store.select(fromUserAccessPolices.item);
  public bankListActionBar$ = this.store.select(actionBar);
  public error$ = this.store.select(fromUserAccessPolices.error);

  private readonly actionBar: ActionHandlersMap = { back: () => this.cancel() };

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<fromUserAccessPolices.AppState>,
  ) { }

  public ngOnInit(): void {
    this.bankListActionBar$.pipe(
      first(actionsBar => actionsBar !== null),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(actionsBar => {
        this.store.dispatch(UpdateAccessPoliciesActionBar({
          actionBar: {
            ...actionsBar,
            ...this.actionBar,
          },
        }));
      });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(UpdateAccessPoliciesActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private cancel(): void {
    this.store.dispatch(GotoParentView('admin/user/orgs'));
  }
}
