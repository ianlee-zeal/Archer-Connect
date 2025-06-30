import { Injectable } from '@angular/core';
import { ColumnExport, IdValue } from '@app/models';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class ClaimantsSummaryRollupService extends RestService<any> {
  endpoint = '/cases';

  public getClaimantsSummaryRollup(searchOptions: IServerSideGetRowsRequestExtended, projectId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${projectId}/claimants-disbursements-summary-rollup`, searchOptions);
  }

  public getPaymentTypes(): Observable<IdValue[]> {
    return this.api.get<IdValue[]>('/paymentItemType');
  }

  public export(id: number, name: string, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(`${this.endpoint}/${id}/export/claimants-disbursements-summary-rollup`, requestParams);
  }

  public downloadDocument(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/export/${id}`);
  }
}
