import { Injectable } from '@angular/core';
import { OutcomeBasedPricingDto } from '@app/models/billing-rule/outcome-based-pricing';
import { SearchTypeEnum } from '@app/models/enums/filter-type.enum';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Injectable({ providedIn: 'root' })
export class OutcomeBasedScenarioService extends RestService<any> {
  endpoint = '/outcome-based-scenario';

  public getByBillingRuleTemplateId(id: number): Observable<any> {
    const searchParam: Partial<IServerSideGetRowsRequestExtended> = {
      startRow: 0,
      endRow: -1,
      sortModel: [{ sort: 'asc', colId: 'name' }],
      filterModel: [new FilterModel({ filter: id, filterType: 'number', key: 'billingRuleTemplateId', type: SearchTypeEnum.Equals })],
    };

    return this.api.post(`${this.endpoint}/search`, searchParam);
  }

  public create(outcomeBasedPricing: OutcomeBasedPricingDto): Observable<any> {
    return this.api.post(`${this.endpoint}/${outcomeBasedPricing.id}`, outcomeBasedPricing);
  }

  public update(outcomeBasedPricing: OutcomeBasedPricingDto): Observable<any> {
    return this.api.put(`${this.endpoint}/${outcomeBasedPricing.id}`, outcomeBasedPricing);
  }
}
