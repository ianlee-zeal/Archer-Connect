import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IdValue } from '@app/models';
import { RestService } from './_rest.service';
import { StringHelper } from '@app/helpers/string.helper';
import { ProjectProductCategory } from '@app/models/scope-of-work';

@Injectable({ providedIn: 'root' })
export class ProductsService extends RestService<any> {
  endpoint = '/products';

  public getAllProductsGroupedByCategories(): Observable<ProjectProductCategory[]> {
    return this.api.get(`${this.endpoint}`);
  }

  public getByProductCategoryIds(ids?: number[], categoryIds?: number[]): Observable<IdValue[]> {
    const params = {
      ids: ids,
      categoryIds: categoryIds
    };

    return this.api.get<Observable<IdValue[]>>(`${this.endpoint}/by-product-categories${StringHelper.queryString(params)}`);
  }

  public getQSFProducts(): Observable<IdValue[]> {
    return this.api.get<Observable<IdValue[]>>(`${this.endpoint}/qsf-products`);
  }
}
