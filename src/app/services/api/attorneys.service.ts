import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Page } from '@app/models/page';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class AttorneysService extends RestService<any> {
  endpoint = '/attorney';

  public search(searchOptions: IServerSideGetRowsRequestExtended): Observable<Page<any>> {
    return this.api.post(`${this.endpoint}/list`, searchOptions);
  }
}
