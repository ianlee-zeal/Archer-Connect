import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IdValue } from '@app/models';
import { StringHelper } from '@app/helpers/string.helper';
import { ProductCategoryDto } from '@app/models/product-workflow/product-category-dto';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class ProductCategoriesService extends RestService<any> {
  endpoint = '/product-categories';

  public getDropdownByProductCategories(ids?: number[]): Observable<IdValue[]> {
    const params = { ids };

    return this.api.get<Observable<any[]>>(`${this.endpoint}/dropdowns/by-product-categories${StringHelper.queryString(params)}`);
  }

  public getDropdownProductCategories(): Observable<IdValue[]> {
    return this.api.get<Observable<IdValue[]>>(`${this.endpoint}/dropdowns/by-root-categories`);
  }

  public getProductCategoryList(): Observable<ProductCategoryDto[]> {
    return this.api.get<Observable<ProductCategoryDto[]>>(`${this.endpoint}`);
  }
}
