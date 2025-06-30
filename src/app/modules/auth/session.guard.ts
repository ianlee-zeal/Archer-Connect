import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { SessionService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class SessionGuard  {
  constructor(
    public oidcSecurityService: OidcSecurityService,
    private sessionService: SessionService,
  ) { }

  public canActivateChild(): Observable<boolean> {
    return this.check();
  }

  public canActivate(): Observable<boolean> {
    return this.check();
  }

  private check(): Observable<boolean> {
    if (!this.sessionService.isSessionPresent()) {
      return of(true);
    }

    return of(!this.sessionService.isSessionExpired());
  }
}
