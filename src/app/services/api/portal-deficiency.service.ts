import { Injectable } from '@angular/core';
import { StringHelper } from '@app/helpers';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class PortalDeficiencyService extends RestService<any> {
  endpoint = '/portal-deficiencies';

  public searchProjectDeficiencies(search = null, caseId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/search${StringHelper.queryString({ caseId })}`, search);
  }

  public searchClaimantDeficiencies(searchOptions: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/claimant-deficiencies/search`, searchOptions);
  }

  public getPortalDeficienciesCount(clientId: number): Observable<number> {
    return this.api.get(`${this.endpoint}/count/${clientId}`);
  }

  public getGlobalDeficienciesCount(): Observable<number> {
    return this.api.get(`${this.endpoint}/deficiencies/count`);
  }

  public getPortalDeficienciesCountForProjects(): Observable<any> {
    return this.api.get(`${this.endpoint}/projects/deficiency-counts`);
  }

  public generateReports(projectIds: number[], channelName: string): Observable<any> {
    return this.api.post(`${this.endpoint}/global-deficiency-export/${StringHelper.queryString({channelName})}`, projectIds);
  }
}
