import { Injectable } from '@angular/core';
import { StringHelper } from '@app/helpers';
import { BillingRuleDto } from '@app/models/billing-rule/billing-rule';
import { BillingRuleTemplateStatusEnum } from '@app/models/enums/billing-rule/billing-rule-template-status.enum';
import { SearchTypeEnum } from '@app/models/enums/filter-type.enum';
import { Page } from '@app/models/page';
import { InjuryCategory, Org } from '@app/models';
import { Observable } from 'rxjs';

import { IExportRequest } from '@app/models/export-request';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Injectable({ providedIn: 'root' })
export class BillingRuleService extends RestService<any> {
  endpoint = '/billing-rule';

  public getFeeScopes(): Observable<any> {
    const searchParam: Partial<IServerSideGetRowsRequestExtended> = {
      startRow: 0,
      endRow: -1,
      sortModel: [{ sort: 'asc', colId: 'name' }],
    };

    return this.api.post(`${this.endpoint}/search-fee-scope`, searchParam);
  }

  public update(billingRule: BillingRuleDto): Observable<any> {
    return this.api.put(`${this.endpoint}/${billingRule.id}`, billingRule);
  }

  public getScenarios(): Observable<any> {
    return this.api.get(`${this.endpoint}/outcome-based-scenario-types`);
  }

  public getVariablePricingTypes(): Observable<any> {
    return this.api.get(`${this.endpoint}/variable-pricing-types`);
  }

  public getTriggerTypes(): Observable<any> {
    return this.api.get(`${this.endpoint}/trigger-types`);
  }

  public searchOrgs(orgName: string): Observable<any> {
    return this.api.get(`/organizations/organizations-light${StringHelper.queryString({ searchTerm: orgName })}`);
  }

  public searchInjuryCategories(term?: string, tortId?: number): Observable<InjuryCategory[]> {
    const searchParam: Partial<IServerSideGetRowsRequestExtended> = {
      startRow: 0,
      endRow: 20,
      sortModel: [{ sort: 'asc', colId: 'name' }],
      filterModel: [
        term && new FilterModel({ filter: term, filterType: 'text', key: 'name', type: 'contains' }),
        tortId && new FilterModel({ filter: tortId, filterType: 'number', key: 'tortId', type: 'equals' }),
      ].filter(Boolean),
    };

    return this.api.post(`${this.endpoint}/search-injury-categories`, searchParam);
  }

  public searchBillingRuleTemplates(brtName: string): Observable<any> {
    const searchParam: Partial<IServerSideGetRowsRequestExtended> = {
      startRow: 0,
      endRow: 20,
      sortModel: [{ sort: 'asc', colId: 'name' }],
      filterModel: [
        new FilterModel({ filter: brtName, filterType: 'text', key: 'name', type: 'contains' }),
        new FilterModel({ filter: BillingRuleTemplateStatusEnum.Active, filterType: 'number', key: 'statusId', type: SearchTypeEnum.Equals }),
      ],
    };

    return this.api.post(`${'/billing-rule-template'}/search`, searchParam);
  }

  public searchBillingRules(params: IServerSideGetRowsRequestExtended, projectId: number): Observable<any> {
    return this.api.post(`${this.endpoint}/search?caseId=${projectId}`, params);
  }

  public searchInvoiceItems(searchParam: IServerSideGetRowsRequestExtended): Observable<Page<any>> {
    return this.api.post<any>(`${this.endpoint}/search-invoice-line-items`, searchParam);
  }

  public getBillToOptions(): Observable<any> {
    return this.api.get(`${this.endpoint}/bill-to`);
  }

  public getQsfOrgByProject(projectId: number): Observable<Org> {
    return this.api.get(`${this.endpoint}/qsf-org-by-project/${projectId}`);
  }

  public export(exportRequest: IExportRequest): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/export-invoice-line-items`, exportRequest);
  }
}
