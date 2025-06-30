import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StringHelper } from '@app/helpers/string.helper';

import { SavedSearch } from '../../models/saved-search';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class SavedSearchService extends RestService<SavedSearch> {
  endpoint = '/advanced-search';

  public getSavedSearchById(id: number): Observable<SavedSearch> {
    return this.api.get<Observable<any[]>>(`${this.endpoint}/${id}`);
  }

  public setLastRunDate(id: number): Observable<void> {
    return this.api.put(`${this.endpoint}/${id}/set-last-rundate`, null);
  }

  public deleteSavedSearch(id: number): Observable<SavedSearch> {
    return this.api.delete<Observable<any[]>>(`${this.endpoint}/${id}`);
  }

  public getUsers(data: any, search: any): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/search-users${StringHelper.queryString(search)}`, data);
  }
}
