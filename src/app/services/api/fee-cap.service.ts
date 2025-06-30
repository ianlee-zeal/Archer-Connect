import { Injectable } from '@angular/core';
import { FeeCapDto } from '@app/models/billing-rule/fee-cap';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class FeeCapService extends RestService<any> {
  endpoint = '/fee-caps';

  public update(feeCap: FeeCapDto): Observable<any> {
    return this.api.put(`${this.endpoint}`, feeCap);
  }

  public search(params: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post(`${this.endpoint}/search`, params);
  }
}
