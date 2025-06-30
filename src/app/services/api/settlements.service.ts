import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {  ColumnExport } from '@app/models';
import { RestService } from './_rest.service';

import { Page } from '@app/models/page';
import { StringHelper } from '@app/helpers/string.helper';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { SettlementFinancialSummary } from '@app/models/settlement/settlement-financial-summary';

@Injectable({ providedIn: 'root' })
export class SettlementsService extends RestService<any> {
  endpoint = '/settlement';

  public updateSettlement(data): Observable<any> {
    return this.api.put<any>(`${this.endpoint}`, data);
  }

  public export(name: string, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[]): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
    };
    return this.api.post(`${this.endpoint}/export`, requestParams);
  }

  public getDocumentList(searchOptions, entityId): Observable<any> {
    return this.api.get<Page<any>>(`${this.endpoint}/documents${StringHelper.queryString(searchOptions)}&entityId=${entityId}`);
  }

  public getDocument(id: number): Observable<any> {
    return this.get(id);
  }

  public downloadDocument(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/document/${id}`);
  }

  public getClaimantList(searchOptions, entityId): Observable<any> {
    return this.api.post<Page<any>>(`${this.endpoint}/${entityId}/clients`, searchOptions);
  }

  public getProjectList(searchOptions, entityId): Observable<any> {
    return this.api.post<Page<any>>(`${this.endpoint}/${entityId}/projects`, searchOptions);
  }

  public getFinancialSummary(settlementId): Observable<SettlementFinancialSummary> {
    return this.api.get<SettlementFinancialSummary>(`${this.endpoint}/${settlementId}/financial-summary`);
  }
}
