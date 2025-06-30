import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

import { PermissionService } from '@app/services';

@Injectable({ providedIn: 'root' })
export class PermissionGuard  {
  constructor(
    private router: Router,
    private service: PermissionService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const routePermissions = route.data.permissions as string[];

    // No route restrictions by permissions applied
    if (!routePermissions) {
      return true;
    }

    if (this.service.has(routePermissions)) {
      return true;
    }

    this.router.navigate(['/no-access']);

    return false;
  }
}
