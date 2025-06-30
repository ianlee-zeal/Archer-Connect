import { Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class HangfireService {
  constructor(
    private oidcSecurityService: OidcSecurityService,
  ) {}

  public gotoDashboard(): void {
    const url = environment.hangfire_url;
    this.oidcSecurityService.getAccessToken().subscribe((token: string) => {
      window.open(`${url}?access_token=${token}`, '_blank');
    });
  }
}
