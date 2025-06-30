import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { OrganizationRole } from '@app/models/organization-role';
import { RestService } from '../_rest.service';

@Injectable({ providedIn: 'root' })
export class OrganizationRolesService extends RestService<OrganizationRole> {
  endpoint = '/org-role';

  public getUnassignedOrganizationRoles(userId: number, orgId: number) : Observable<OrganizationRole[]> {
    return this.api.get<OrganizationRole[]>(`${this.endpoint}/unassigned/${userId}/${orgId}`, null);
  }

  public getOrganizationRoles(orgId: number): Observable<OrganizationRole[]> {
    return this.api.get<OrganizationRole[]>(`${this.endpoint}/${orgId}/list`, null);
  }
}
