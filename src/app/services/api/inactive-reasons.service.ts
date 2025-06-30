import { Injectable } from '@angular/core';
import { IdValue } from '@app/models';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';

/**
 * Service for working with inactive reason entities
 *
 * @export
 * @class InactiveReasonsService
 * @extends {RestService<any>}
 */
@Injectable({ providedIn: 'root' })
export class InactiveReasonsService extends RestService<any> {
  endpoint = '/inactive-reasons';

  /**
   * Gets the list of inactive reasons by the provided entity type id
   *
   * @param {number} entityTypeId
   * @return {*}  {Observable<IdValue[]>}
   * @memberof InactiveReasonsService
   */
  public getByEntityTypeId(entityTypeId: number): Observable<IdValue[]> {
    return this.api.get(`${this.endpoint}/${entityTypeId}`);
  }
}
