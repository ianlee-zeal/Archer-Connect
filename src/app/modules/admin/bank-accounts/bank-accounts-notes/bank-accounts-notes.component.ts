import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '@app/state/index';
import { ActivatedRoute } from '@angular/router';
import { ActionHandlersMap, ActionObject } from '@app/modules/shared/action-bar/action-handlers-map';
import { PermissionService } from '@app/services';
import { Subject } from 'rxjs';
import * as actions from '../state/actions';

@Component({
  selector: 'app-bank-accounts-notes',
  templateUrl: './bank-accounts-notes.component.html',
  styleUrls: ['./bank-accounts-notes.component.scss'],
})
export class BankAccountsNotesComponent implements OnInit, OnDestroy {
  public entityTypeId = EntityTypeEnum.BankAccounts;
  public entityId: number;

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    protected store: Store<AppState>,
  ) { }

  public ngOnInit(): void {
    this.route.parent.parent.params
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(params => {
        this.entityId = params.id;
      });
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    const actionBarNew = actionBar?.new as ActionObject;
    if (actionBarNew) {
      actionBarNew.permissions = PermissionService.create(PermissionTypeEnum.BankAccountNotes, PermissionActionTypeEnum.Create);
    }
    this.store.dispatch(actions.UpdateBankAccountsActionBar({ actionBar }));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
