import { Injectable } from '@angular/core';

import { OrganizationEntityAccess } from '@app/models/organization-entity-access';
import { RestService } from '../_rest.service';

@Injectable({ providedIn: 'root' })
export class OrganizationEntityAccessService extends RestService<OrganizationEntityAccess> {
  endpoint = '/org-entity-access';
}
