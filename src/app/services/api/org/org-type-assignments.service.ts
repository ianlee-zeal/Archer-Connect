import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { RestService } from '../_rest.service';

@Injectable({
  providedIn: 'root'
})
export class OrgTypeAssignmentsService extends RestService<any> {
  endpoint = '/org-type-assignment';

  public getList(orgId: number): Observable<any> {
    const params = new HttpParams({
      fromObject: {
        orgId: String(orgId),
      }
    });

    return this.api.get(this.endpoint, params);
  }

  public save(orgId: number, typeIds: number[]): Observable<any> {
    return this.api.post(`${this.endpoint}/${orgId}`, typeIds);
  }
}
