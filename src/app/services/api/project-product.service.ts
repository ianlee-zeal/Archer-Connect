import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectProduct } from '@app/models/scope-of-work';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class ProjectProductService extends RestService<any> {
  endpoint = '/case-product';

  public getProjectProducts(projectId: number): Observable<ProjectProduct[]> {
    return this.api.get(`${this.endpoint}/${projectId}`);
  }
}
