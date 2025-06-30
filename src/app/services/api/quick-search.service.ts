import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QuickSearchItem } from '@app/models';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class QuickSearchService extends RestService<any> {
  endpoint = '/global-search';

  public searchClients(query: string, page: number = 1, size: number = null): Observable<QuickSearchItem[]> {
    return this.api.post(`${this.endpoint}/clients`, {
      query,
      page,
      size,
    });
  }
}
