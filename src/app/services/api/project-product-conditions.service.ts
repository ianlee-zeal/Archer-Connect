import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';
import { ProductCondition } from '@app/models/scope-of-work/product-condition';
import { ProjectProductCondition } from '@app/models/scope-of-work/project-product-condition';

@Injectable({ providedIn: 'root' })
export class ProjectProductConditionsService extends RestService<any> {
  endpoint = '/product-condition';
  caseEndpoint = '/case-product-condition';

  public getAllProductConditions(): Observable<ProductCondition[]> {
    return this.api.get(`${this.endpoint}`);
  }

  public getProjectProductConditions(projectId: number): Observable<ProjectProductCondition[]> {
    return this.api.get(`${this.caseEndpoint}/${projectId}`);
  }
}
