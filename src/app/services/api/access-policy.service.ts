import { Injectable } from '@angular/core';
import { RestService } from './_rest.service';


@Injectable({ providedIn: 'root' })
export class AccessPolicyService extends RestService<any> {
  endpoint = '/organization-access-policies';
}
