import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/modules/admin/user-access-policies/state/state';
import { Router } from '@angular/router';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import * as actions from '../state/actions';

@Component({
  selector: 'app-user-profile-log-in-history-tab',
  templateUrl: './user-profile-log-in-history-tab.component.html',
  styleUrls: ['./user-profile-log-in-history-tab.component.scss'],
})
export class UserProfileLogInHistoryTabComponent implements OnInit {
  constructor(private store: Store<AppState>, private router: Router) { }

  ngOnInit() {
    this.store.dispatch(actions.UpdateUserProfileActionBar({
      actionBar:
       { back: () => this.store.dispatch(GotoParentView()) },
    }));
  }
}
