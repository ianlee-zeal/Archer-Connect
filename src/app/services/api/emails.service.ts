import { Injectable } from '@angular/core';
import { EmailsListResponse } from '@app/models/emails-list-response';
import { EntityPair } from '@app/modules/shared/_interfaces';
import { Observable } from 'rxjs';

import { EntityTypeEnum } from '@app/models/enums';
import { Email } from '@app/models';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class EmailsService extends RestService<any> {
  endpoint = '/emails';

  public searchByEntity(entityPairs: EntityPair[]): Observable<EmailsListResponse[]> {
    return this.api.post(`${this.endpoint}/entity-search`, { entityPairs });
  }

  public getPrimaryByEntity(entityType: EntityTypeEnum, entityId: number): Observable<Email> {
    return this.api.get(`${this.endpoint}/primary/entityType/${entityType}/entity/${entityId}`);
  }
}
