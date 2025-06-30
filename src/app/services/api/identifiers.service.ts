import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })

export class IdentifiersService extends RestService<any> {
  endpoint = '/external-identifiers';

  public getClaimantIdentifiers(entityId: number, entityTypeId: number): Observable<any> {
    const body = { entityId, entityTypeId };
    return this.api.post(`${this.endpoint}`, body);
  }
}
