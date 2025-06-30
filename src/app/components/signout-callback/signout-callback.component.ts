import { Component, OnInit } from '@angular/core';
import * as authActions from '@app/modules/auth/state/auth.actions';
import { Store } from '@ngrx/store';
import * as fromAuth from '@app/modules/auth/state';

@Component({
  template: '<div></div>',
  selector: 'app-signout-redirect-callback',
})
export class SignoutCallbackComponent implements OnInit {

  constructor(
    private store: Store<fromAuth.AppState>,
  ) { }

  public ngOnInit(): void {
    this.store.dispatch(authActions.ResetState());
    this.store.dispatch(authActions.LoginRedirect());
  }
}
