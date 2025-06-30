import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from '../_rest.service';
import { OrgType } from '@app/models/org-type';
import { IdValue } from '@app/models/idValue';

@Injectable({
  providedIn: 'root'
})
export class OrgTypesService extends RestService<any> {
  endpoint = '/org-type';

  public getList(gridParams): Observable<any> {
    return this.index({ gridOptions: gridParams });
  }

  public create(orgType: OrgType) {
    return this.post(orgType);
  }

  public update(orgType: OrgType) {
    return this.put(orgType);
  }

  public getfirmMoneyMovementOptions(): Observable<IdValue[]> {
    return this.api.get(`${this.endpoint}/firm-money-movement`);
  }
}
