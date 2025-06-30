import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Person, ProjectClaimantRequest, ColumnExport } from '@app/models';
import { StringHelper } from '@app/helpers/string.helper';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class PersonsService extends RestService<any> {
  endpoint = '/persons';

  public getFullSsnByPersonId(personId: number): Observable<string> {
    return this.api.get(`${this.endpoint}/${personId}/ssn`);
  }

  public getFullOtherIdentifierByPersonId(personId: number): Observable<string> {
    return this.api.get(`${this.endpoint}/${personId}/other-identifier`);
  }

  public getPersonListByFilter(filter: string): Observable<Person[]> {
    const params = new HttpParams().append('filter', filter);
    return this.api.get(`${this.endpoint}/list`, params);
  }

  public getPersonListForContacts(filter: string): Observable<Person[]> {
    const params = new HttpParams().append('filter', filter);
    return this.api.get(`${this.endpoint}/listForContacts`, params);
  }

  public getPersonListByIds(personsIds: number[]): Observable<Person[]> {
    const params = { personsIds };
    return this.api.get(`${this.endpoint}/personsbyids${StringHelper.queryString(params)}`);
  }

  public getProjects(personId: number): Observable<ProjectClaimantRequest[]> {
    return this.api.get<Observable<ProjectClaimantRequest[]>>(`${this.endpoint}/${personId}/cases`);
  }

  public export(name: string, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(`${this.endpoint}/export`, requestParams);
  }

  public downloadDocument(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/export/${id}`);
  }
}
