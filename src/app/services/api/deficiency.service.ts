import { Injectable } from '@angular/core';
import { StringHelper } from '@app/helpers';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class DeficiencyService extends RestService<any> {
  endpoint = '/deficiency';

  public overrideDeficiency(deficiencyId: number, caseId: number): Observable<any> {
    return this.api.post(`${this.endpoint}/override-deficiency/${deficiencyId}`, {caseId});
  }

  public searchClaimantDeficiencies(search = null, claimantId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/search${StringHelper.queryString({ claimantId })}`, search);
  }

  public searchProjectDeficiencies(search = null, caseId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/searchByCaseId${StringHelper.queryString({ caseId })}`, search);
  }
}
