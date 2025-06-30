import { Injectable } from '@angular/core';
import { EntityTypeEnum } from '@app/models/enums';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { KeyValuePair } from '../../models/utils/key-value-pair';

@Injectable({ providedIn: 'root' })
export class TabInfoService extends RestService<any> {
  endpoint = '/tab-info';

  public getTabsCount(entityId: number, entityTypeId: EntityTypeEnum, tabList: EntityTypeEnum[]): Observable<KeyValuePair<number, number>[]> {
    return this.api.post(`${this.endpoint}?entityTypeId=${entityTypeId}&entityId=${entityId}`, tabList);
  }
}
