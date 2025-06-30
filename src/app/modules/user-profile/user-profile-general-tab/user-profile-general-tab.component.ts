import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/modules/admin/user-access-policies/state/state';
import { authSelectors } from '@app/modules/auth/state';
import { actionBar } from '../state/selectors';
import { UpdateUserProfileActionBar } from '../state/actions';

@Component({
  selector: 'app-user-profile-general-tab',
  templateUrl: './user-profile-general-tab.component.html',
  styleUrls: ['./user-profile-general-tab.component.scss'],
})
export class UserProfileGeneralTabComponent implements OnInit {
  public userName$ = this.store.select<any>(authSelectors.getUserName);
  public actionBar$ = this.store.select(actionBar);

  constructor(private store: Store<AppState>) { }

  public ngOnInit(): void {
    this.store.dispatch(UpdateUserProfileActionBar({
      actionBar:
       { back: { callback: () => {} } },
    }));
  }
}
