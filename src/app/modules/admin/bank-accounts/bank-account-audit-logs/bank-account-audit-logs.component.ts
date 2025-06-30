import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state';
import { Router } from '@angular/router';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import * as actions from '../state/actions';
@Component({
  selector: 'app-bank-account-audit-logs',
  templateUrl: './bank-account-audit-logs.component.html',
  styleUrls: ['./bank-account-audit-logs.component.scss']
})

export class BankAccountAuditLogsComponent implements OnInit {
  constructor(
    private store: Store<AppState>,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(actions.UpdateBankAccountsActionBar({
      actionBar:
       { back: { callback: () => this.cancel() } },
    }));
  }

  public cancel(): void {
    this.store.dispatch(GotoParentView());
  }
}
