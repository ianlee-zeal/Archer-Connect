import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { Page } from '@app/models/page';
import { StringHelper } from '@app/helpers/string.helper';

@Injectable({
  providedIn: 'root'
})
export class SettlementNotesService extends RestService<any> {
  endpoint = '/settlement/note';

  public getList(searchOptions): Observable<any> {
    return this.api.get<Page<any>>(`${this.endpoint}s${StringHelper.queryString(searchOptions)}`);
  }

  public create(note): Observable<any> {
    return this.api.post(`${this.endpoint}`, { settlementId: note.entityId, note: note.note });
  }

  public update(note): Observable<any> {
    return this.api.put(`${this.endpoint}`, { id: note.id, note: note.note });
  }
}
