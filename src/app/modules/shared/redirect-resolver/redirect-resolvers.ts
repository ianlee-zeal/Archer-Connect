import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { PermissionService } from '@app/services';

export const redirectResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const routePermissions = route.data.permissions as string[];
  const permissionRedirect = route.data.permissionRedirect as string;
  const defaultRedirect = route.data.defaultRedirect as string;

  if (permissionService.has(routePermissions)) {
    return permissionRedirect;
  } else {
    return defaultRedirect
  }
};