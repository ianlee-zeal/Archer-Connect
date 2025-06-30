import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/modules/admin/user-access-policies/state/state';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import * as actions from '../state/actions';

@Component({
  selector: 'app-user-profile-roles-tab',
  templateUrl: './user-profile-roles-tab.component.html',
  styleUrls: ['./user-profile-roles-tab.component.scss'],
})
export class UserProfileRolesTabComponent implements OnInit {
  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.store.dispatch(actions.UpdateUserProfileActionBar({
      actionBar:
       { back: () => this.store.dispatch(GotoParentView()) },
    }));
  }
}
