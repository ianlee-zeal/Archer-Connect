import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from '../_rest.service';
import { OrgImpersonateRequest } from '@app/models/org-impersonate-request';

@Injectable({ providedIn: 'root' })
export class OrgImpersonateService extends RestService<any> {
  endpoint = '/impersonation';

  public impersonate(orgImpersonateRequestDto: OrgImpersonateRequest): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/impersonate`, orgImpersonateRequestDto);
  }

  public depersonate(): Observable<any> {
    return this.api.postWithResponse<any>(`${this.endpoint}/depersonate`, null);
  }
}
