import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Injector, Injectable } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';

@Injectable()
export class HttpAuthorizationInterceptor implements HttpInterceptor {
  private oidcSecurityService: OidcSecurityService;

  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let requestToForward = req;

    if (!this.oidcSecurityService) {
      this.oidcSecurityService = this.injector.get(OidcSecurityService);
    }

    return this.oidcSecurityService.getAccessToken().pipe(
      tap((token: string) => {
        let currentToken = token;
        if (currentToken === '') {
          // silent renew could be in process and token is not present in storage at the moment
          // try to get backup token
          currentToken = JSON.parse(sessionStorage.getItem('tokenBackup_archer-connect-app')) || '';
        }
        if (currentToken !== '') {
          requestToForward = req.clone({ setHeaders: { Authorization: `Bearer ${currentToken}` } });
        }
      }),
      switchMap(() => next.handle(requestToForward)),
    );
  }
}
