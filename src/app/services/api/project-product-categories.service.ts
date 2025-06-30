import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectProductCategory } from '@app/models/scope-of-work';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class ProjectProductCategoriesService extends RestService<any> {
  endpoint = '/case-product-category';

  public getProjectProductCategories(projectId: number): Observable<ProjectProductCategory[]> {
    return this.api.get(`${this.endpoint}/${projectId}`);
  }

  public updateProjectProductCategories(projectId: number, productCategories: any): Observable<boolean> {
    return this.api.put(`${this.endpoint}/${projectId}`, productCategories);
  }

  public getProductScopeContactsList(projectId: number, gridParams: IServerSideGetRowsRequestExtended): Observable<ProjectProductCategory[]> {
    const searchOptions = {
      ...gridParams,
      filterModel: [
        ...gridParams.filterModel,
        {
          type: 'equals',
          filter: projectId,
          filterType: 'number',
          conditions: [],
          filterTo: null,
          key: 'caseId',
        }],
    };

    return this.api.post(`${this.endpoint}/product-contacts`, searchOptions);
  }

  public getProductCategoryStatus(projectId: number, productCategoryId: number): Observable<ProjectProductCategory> {
    return this.api.get(`${this.endpoint}/${projectId}/${productCategoryId}`);
  }
}
