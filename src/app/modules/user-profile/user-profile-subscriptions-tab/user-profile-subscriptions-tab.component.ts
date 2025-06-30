import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/modules/admin/user-access-policies/state/state';
import { Router } from '@angular/router';
import * as actions from '../state/actions';

@Component({
  selector: 'app-user-profile-subscriptions-tab',
  templateUrl: './user-profile-subscriptions-tab.component.html',
  styleUrls: ['./user-profile-subscriptions-tab.component.scss'],
})
export class UserProfileSubscriptionsTabComponent implements OnInit {
  constructor(private store: Store<AppState>, private router: Router) { }

  ngOnInit() {
    this.store.dispatch(actions.UpdateUserProfileActionBar({
      actionBar:
       { back: () => { this.router.navigate(['./']); } },
    }));
  }
}
