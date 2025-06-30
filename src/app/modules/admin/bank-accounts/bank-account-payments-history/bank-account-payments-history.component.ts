import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import * as actions from '../state/actions';

@Component({
  selector: 'app-bank-account-payments-history',
  templateUrl: './bank-account-payments-history.component.html',
  styleUrls: ['./bank-account-payments-history.component.scss']
})
export class BankAccountPaymentsHistoryComponent implements OnInit {
  constructor(
    private store: Store<AppState>,
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
