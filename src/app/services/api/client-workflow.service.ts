import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ClientWorkflow } from '@app/models';
import { StringHelper } from '@app/helpers/string.helper';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class ClientWorkflowService extends RestService<ClientWorkflow> {
  endpoint = '/client-workflow';

  public getByProductCategory(productCategoryId: number, clientId: number): Observable<ClientWorkflow> {
    const params = {
      productCategoryId,
      clientId,
    };

    return this.api.get<Observable<ClientWorkflow>>(`${this.endpoint}/${StringHelper.queryString(params)}`);
  }
}
