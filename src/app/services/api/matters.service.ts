import { Injectable } from '@angular/core';
import { IdValue } from '@app/models';
import { Observable } from 'rxjs';
import { Page } from '@app/models/page';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class MattersService extends RestService<any> {
  endpoint = '/matter';
  tortEndpoint = '/tort';

  public getAllMatters(): Observable<IdValue[]> {
    return this.api.get(`${this.tortEndpoint}/all`);
  }

  public getRelatedSettlements(search = null, matterId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${matterId}/settlements`, search);
  }

  public getMatter(matterId: number): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/${matterId}`);
  }

  public createMatter(matterName: string): Observable<any> {
    return this.api.post<any>(`${this.endpoint}`, { name: matterName });
  }

  public search(searchOptions: IServerSideGetRowsRequestExtended): Observable<Page<any>> {
    return this.api.post(`${this.tortEndpoint}/search`, searchOptions);
  }

  public getPrimaryFirmIdsRelatedSettlements(entityId: number): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/${entityId}/primary-firm-ids-of-settlements`);
  }
}
