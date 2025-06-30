import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IdValue } from '@app/models';
import { EntityTypeEnum } from '@app/models/enums';
import { StringHelper } from '@app/helpers';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class StatusService extends RestService<any> {
  endpoint = '/statuses';

  getStatuses(entityTypeId: EntityTypeEnum): Observable<IdValue[]> {
    const params = { entityTypeId };

    return this.api.get(`${this.endpoint}/by-entity-type${StringHelper.queryString(params)}`);
  }
}
