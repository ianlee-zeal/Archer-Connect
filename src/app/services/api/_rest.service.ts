import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';

import { StringHelper } from '@app/helpers/string.helper';
import { ApiService } from './_api.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable()
export class RestService<T> {
  endpoint: string;

  constructor(protected api: ApiService) { }

  index(search = null): Observable<any> {
    return this.api.get<any>(`${this.endpoint}${StringHelper.queryString(search)}`);
  }

  search(search = null): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/search`, search);
  }

  grid(data: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/grid`, data);
  }

  // sometimes search is null we want to enforce an empty set for that
  pages(search = null): Observable<T[]> {
    if (search) return this.api.get<T[]>(`${this.endpoint}/pages${StringHelper.queryString(search)}`);

    return of([]);
  }

  // sometimes search is null we want to enforce an empty set for that
  gridpages(search = null): Observable<T[]> {
    if (search) return this.api.post<T[]>(`${this.endpoint}/gridpages${StringHelper.queryString(search.search)}`, search.request);

    return of([]);
  }

  get(id, query?): Observable<T> {
    if (query) {
      return this.api.get<T>(`${this.endpoint}/${id}/${query}`);
    }
    return this.api.get<T>(`${this.endpoint}/${id}`);
  }

  putsert(data): Observable<T> {
    return (data.id) ? this.put(data) : this.post(data);
  }

  upsert(data): Observable<T> {
    return (data.id) ? this.patch(data) : this.post(data);
  }

  post(data: T): Observable<T> {
    return this.api.post<T>(this.endpoint, data);
  }

  postFormData(data: FormData): Observable<any> {
    return this.api.postFormData(this.endpoint, data);
  }

  put(data): Observable<T> {
    return this.api.put<T>(`${this.endpoint}/${data.id}`, data);
  }

  patch(data) {
    return this.api.patch<T>(`${this.endpoint}/${data.id}`, data);
  }

  delete(id) {
    return this.api.delete(`${this.endpoint}/${id}`);
  }

  deleteAll(ids: Array<any>) {
    return ids.length > 1
      ? this.api.delete(`${this.endpoint}`, ids)
      : this.delete(ids);
  }
}
