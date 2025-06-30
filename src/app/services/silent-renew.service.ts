/* eslint-disable class-methods-use-this */
/*import { Injectable } from '@angular/core';
import { ɵe as OidcSecurityCommon, ɵi as OidcSecuritySilentRenew, OidcSecurityService } from 'angular-auth-oidc-client';
import { HttpParams } from '@angular/common/http';
import { CustomUrlEncoder } from '@app/encoders/custom-url.encoder';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SilentRenewService {
  constructor(
    private oidcCommon: OidcSecurityCommon,
    private oidcSilentRenew: OidcSecuritySilentRenew,
    private oidcService: OidcSecurityService,
  ) { }

  public startRenew() {
    const url = this.createAuthorizeUrl();
    // backup token so that if we make a request to API during the renew process, we can use the backup token
    // because original token is removed during renew
    this.oidcService.getAccessToken().subscribe((token: string) => {
      sessionStorage.setItem('tokenBackup_archer-connect-app', JSON.stringify(token));
    });

    return this.oidcSilentRenew.startRenew(url)
      .pipe(map(() => {
        sessionStorage.removeItem('tokenBackup_archer-connect-app');
      }));
  }

  private createAuthorizeUrl(): string {
    const silentRenewUrl = `${window.location.origin}/silent-renew.html`;
    const authEndpoint = `${environment.sts_server}/connect/authorize`;
    const nonce = 'N' + Math.random() + '' + Date.now();

    let state = this.oidcCommon.authStateControl;
    if (state === '' || state === null) {
      state = Date.now() + '' + Math.random() + Math.random();
      this.oidcCommon.authStateControl = state;
    }

    const urlParts = authEndpoint.split('?');
    const authorizationUrl = urlParts[0];
    let params = new HttpParams({
      fromString: urlParts[1],
      encoder: new CustomUrlEncoder(),
    });

    params = params.set('client_id', 'archer-connect-app');
    params = params.append('redirect_uri', silentRenewUrl);
    params = params.append('response_type', 'id_token token');
    params = params.append('scope', 'openid profile archer-connect-api offline_access');
    params = params.append('nonce', nonce);
    params = params.append('state', state);
    params = params.append('prompt', 'none');

    if (this.oidcCommon.customRequestParams) {
      const customParams = { ...this.oidcCommon.customRequestParams };

      Object.keys(customParams).forEach(key => {
        params = params.append(key, customParams[key].toString());
      });
    }

    return `${authorizationUrl}?${params}`;
  }
}
*/