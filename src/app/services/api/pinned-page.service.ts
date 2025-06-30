import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { PinnedPage } from '@app/models';
import { Page } from '@app/models/page';
import { EntityTypeEnum } from '@app/models/enums';
import { StringHelper } from '@app/helpers/string.helper';

@Injectable({
  providedIn: 'root'
})
export class PinnedPageService extends RestService<PinnedPage> {
  endpoint = '/pinned-pages';

  public getList(count: number = 0): Observable<Page<PinnedPage>> {
    return this.index({ count });
  }

  public create(pinnedPage: PinnedPage): Observable<void> {
    return this.api.post(this.endpoint, PinnedPage.toDto(pinnedPage));
  }

  public deleteByEntity(entityId: number, entityType: EntityTypeEnum): Observable<void> {
    const params = { entityId, entityTypeId: entityType };

    return this.api.delete(this.endpoint + StringHelper.queryString(params));
  }
}
