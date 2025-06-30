import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { OrgRole } from '@app/models/org-role';
import { RestService } from '../_rest.service';

@Injectable({ providedIn: 'root' })
export class OrgRoleService extends RestService<OrgRole> {
  endpoint = '/org-role';

  public getList = (search = null): Observable<any> => {
    if (search && !search.gridOptions) {
      // eslint-disable-next-line no-param-reassign
      search = { gridOptions: search };
    }
    return this.index(search);
  };
}
