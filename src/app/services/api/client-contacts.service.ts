import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Injectable({ providedIn: 'root' })
export class ClientContactsService extends RestService<any> {
  endpoint = '/clientcontact';

  public getContacts(claimantId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/${claimantId}/list`);
  }

  public searchClientContacts(gridParams: IServerSideGetRowsRequestExtended, clientId: number): Observable<any> {
    const filter = new FilterModel({ filter: clientId, type: 'equals', key: 'clientId', filterType: 'number' });
    const filterModel = gridParams.filterModel;
    filterModel.push(filter);
    return this.api.post<any>(`${this.endpoint}/search`, { ...gridParams, filterModel });
  }

  public putContact(clientContact: any): Observable<any> {
    return this.api.put(`${this.endpoint}`, clientContact);
  }

  public deleteContact(clientId: number, clientContactId: number): Observable<void> {
    return this.api.delete(`${this.endpoint}/${clientId}/${clientContactId}`);
  }
}
