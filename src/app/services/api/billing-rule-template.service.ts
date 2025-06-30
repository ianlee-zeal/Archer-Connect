import { Injectable } from '@angular/core';
import { EntityTypeEnum } from '@app/models/enums';
import { Page } from '@app/models/page';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Injectable({ providedIn: 'root' })
export class BillingRuleTemplateService extends RestService<any> {
  endpoint = '/billing-rule-template';

  public getBrtStatuses(): Observable<any> {
    return this.api.get(`/status?entityTypeId=${EntityTypeEnum.BillingRuleTemplate}`);
  }

  public searchInvoicingItems(searchTerm: string): Observable<any> {
    const searchParam: Partial<IServerSideGetRowsRequestExtended> = {
      startRow: 0,
      endRow: 20,
      sortModel: [{ sort: 'asc', colId: 'name' }],
      filterModel: [new FilterModel({ filter: searchTerm, filterType: 'text', key: 'name', type: 'contains' })],
    };

    return this.api.post(`${this.endpoint}/search-invoicing-item`, searchParam);
  }

  public searchInvoicingItemsByParams(params: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post(`${this.endpoint}/search-invoicing-item`, params);
  }

  public searchRevRecItems(searchTerm: string): Observable<any> {
    const searchParam: Partial<IServerSideGetRowsRequestExtended> = {
      startRow: 0,
      endRow: 20,
      sortModel: [{ sort: 'asc', colId: 'name' }],
      filterModel: [new FilterModel({ filter: searchTerm, filterType: 'text', key: 'name', type: 'contains' })],
    };

    return this.api.post(`${this.endpoint}/search-revrec-item`, searchParam);
  }

  public searchRevRecItemsByParams(params: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post(`${this.endpoint}/search-revrec-item`, params);
  }

  public getRevRecMethods(): Observable<any> {
    const searchParam: Partial<IServerSideGetRowsRequestExtended> = {
      startRow: 0,
      endRow: -1,
    };

    return this.api.post(`${this.endpoint}/search-revrec-method`, searchParam);
  }

  public searchServices(params: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/search-related-service`, params);
  }

  public searchBillingRuleTemplates(params: IServerSideGetRowsRequestExtended): Observable<Page<any>> {
    return this.api.post(`${this.endpoint}/search`, params);
  }
}
