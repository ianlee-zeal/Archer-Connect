import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class HoldTypesService extends RestService<any> {
  endpoint = '/hold-types';

  public getHoldTypes(): Observable<any[]> {
    return this.api.get<Observable<any[]>>(`${this.endpoint}`);
  }
}
