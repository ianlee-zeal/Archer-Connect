import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { RestService } from './api/_rest.service';

@Injectable({ providedIn: 'root' })
export class ProjectContactsService extends RestService<any> {
  endpoint = '/case-contact-references';
  caseContactEndpoint = '/case-contacts';

  getContacts(gridParams: IServerSideGetRowsRequestExtended, projectId: number, isDeficiencyReport: boolean = false): Observable<any> {
    const route = isDeficiencyReport ? 'search-view' : 'search';
    const filter = new FilterModel({ filter: projectId, type: 'equals', key: 'caseId', filterType: 'number' });
    const filterModel = gridParams.filterModel;
    filterModel.push(filter);
    return this.api.post<any>(`${this.endpoint}/${route}`, { ...gridParams, filterModel });
  }

  searchProjectContacts(search = null): Observable<any> {
    return this.api.post<any>(`${this.caseContactEndpoint}/search`, search);
  }

  public getProjectContactRoles(id: number, isMaster: boolean): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/roles/${id}`, isMaster);
  }
}
