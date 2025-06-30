import { Injectable } from '@angular/core';

import { RestService } from '../_rest.service';
import { Permission } from "@app/models/permission";

@Injectable({
  providedIn: 'root'
})
export class PermissionsService extends RestService<Permission> {
  endpoint = '/permissions'
}
