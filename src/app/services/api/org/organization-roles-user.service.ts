import { Injectable } from '@angular/core';
import { RestService } from '../_rest.service';
import { Observable } from 'rxjs';

import { MultipleOrganizationRoleUserRequest } from '@app/models/Multipleorganization-Role-Users';

@Injectable({
  providedIn: 'root'
})
export class OrganizationRolesUserService extends RestService<MultipleOrganizationRoleUserRequest> {
  endpoint = '/org-role-user';

  public addRolesToUser(request: MultipleOrganizationRoleUserRequest): Observable<any> {
    return this.api.post<MultipleOrganizationRoleUserRequest>(`${this.endpoint}/multiple-roles`, request);
  }
}
