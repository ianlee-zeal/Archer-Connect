import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { IdValue } from '@app/models';

@Injectable({ providedIn: 'root' })
export class LpmService extends RestService<any> {
  endpoint = '/lpm';

  public getFirms(): Observable<IdValue[]> {
    return this.api.get(`${this.endpoint}/organizations/law-firms`);
  }
}
