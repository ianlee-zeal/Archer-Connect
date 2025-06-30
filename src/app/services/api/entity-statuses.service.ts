import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { EntityTypeEnum } from '@app/models/enums';

@Injectable({
  providedIn: 'root'
})
export class EntityStatusesService extends RestService<any>  {
  endpoint = '/entity-statuses';

  public getList(entityTypeId: EntityTypeEnum): Observable<any[]> {
    return this.index({ entityTypeId });
  }
}
