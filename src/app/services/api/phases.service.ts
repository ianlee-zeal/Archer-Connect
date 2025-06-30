import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IdValue } from '@app/models';
import { RestService } from './_rest.service';
import { StringHelper } from '@app/helpers/string.helper';

@Injectable({ providedIn: 'root' })
export class PhasesService extends RestService<any> {
  endpoint = '/phases';

  public getByProductIds(ids?: number[]): Observable<IdValue[]> {
    const params = {
      ids: ids
    };

    return this.api.get<Observable<IdValue[]>>(`${this.endpoint}/by-products${StringHelper.queryString(params)}`);
  }

}
