/* eslint-disable class-methods-use-this */
import { Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { LogService } from './log-service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  public readonly sessionExpirationStorageKey = 'sessionExpirationDate_archer-connect-app';
  public readonly isAppLoadedDirectlyStorageKey = 'isAppLoadedDirectly_archer-connect-app';

  constructor(
    private oidcService: OidcSecurityService,
    private readonly loggerService: LogService,
  ) { }

  public isSessionPresent(): boolean {
    this.loggerService.log(`isSessionPresent: ${this.sessionExpirationStorageKey}: ${localStorage.getItem(this.sessionExpirationStorageKey)}`);
    return !!localStorage.getItem(this.sessionExpirationStorageKey);
  }

  public isSessionExpired(): boolean {
    const sessionExpirationDate = this.getSessionExpirationDate();
    const now = new Date().getTime();

    const isExpired = now > sessionExpirationDate;

    this.loggerService.log(`isSessionExpired: sessionExpirationDate: ${sessionExpirationDate}. IsExpired: ${isExpired}`);

    return isExpired;
  }

  public startNewSession(): void {
    const _30minAsMillisec = 1800000;
    const _30minFromNow = (new Date().getTime() + _30minAsMillisec);
    localStorage.setItem(this.sessionExpirationStorageKey, _30minFromNow.toString());
    localStorage.removeItem(this.isAppLoadedDirectlyStorageKey);
  }

  public endCurrentSession(): void {
    localStorage.removeItem(this.sessionExpirationStorageKey);
    localStorage.removeItem(this.isAppLoadedDirectlyStorageKey);
    this.oidcService.logoff().subscribe(result => console.log('logoff', result));
  }

  public setIsAppLoadedDirectly(): void {
    this.loggerService.log('setIsAppLoadedDirectly: ', true);

    localStorage.setItem(this.isAppLoadedDirectlyStorageKey, 'true');
  }

  public isAppLoadedDirectly(): boolean {
    // if item is present in the storage, it means that a user opened the app directly, not redirected after login
    // eg. the user was already logged in and just updated the page, or opened a new tab - AC-3312

    this.loggerService.log(`isAppLoadedDirectly: ${this.isAppLoadedDirectlyStorageKey}: ${localStorage.getItem(this.isAppLoadedDirectlyStorageKey)}`);
    return !!localStorage.getItem(this.isAppLoadedDirectlyStorageKey);
  }

  public getSessionExpirationDate(): number {
    return Number(localStorage.getItem(this.sessionExpirationStorageKey));
  }
}
