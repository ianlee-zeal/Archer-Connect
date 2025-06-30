import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Store } from '@ngrx/store';
import * as fromAuth from './state';
import * as authActions from './state/auth.actions';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
  constructor(
    public oidcSecurityService: OidcSecurityService,
    private store: Store<fromAuth.AppState>,
  ) { }

  public canActivateChild(): Observable<boolean> {
    return this.checkUser();
  }

  public canActivate(): Observable<boolean> {
    return this.checkUser();
  }

  private checkUser(): Observable<boolean> {
    return this.oidcSecurityService.isAuthenticated$.pipe(
      map(({ isAuthenticated }: { isAuthenticated: boolean }) => {
        if (!isAuthenticated) {
          this.store.dispatch(authActions.LoginRedirect());
          return false;
        }
        return true;
      }),
    );
  }
}
