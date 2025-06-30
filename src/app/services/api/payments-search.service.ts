import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { StringHelper } from '@app/helpers/string.helper';
import { ColumnExport } from '@app/models';
import { Payment } from '@app/models/payment';
import { EntityTypeEnum } from '@app/models/enums';
import { RestService } from './_rest.service';
import { Page } from '@app/models/page';
import { ClaimSettlementLedgerEntry } from '@app/models/claim-settlement-ledger-entry';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class PaymentsSearchService extends RestService<any> {
  endpoint = '/payments-search';

  public getPayments(searchOptions: IServerSideGetRowsRequestExtended): Observable<number[]> {
    return this.api.get<Payment[]>(`${this.endpoint}/${StringHelper.queryString({ gridOptions: searchOptions })}`);
  }

  public getPaymentItemDetails(searchOptions: IServerSideGetRowsRequestExtended, paymentId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${paymentId}/payment-item-details`, searchOptions)
  }

  searchEntityPayments(request: IServerSideGetRowsRequestExtended, entityId: number, entityType: EntityTypeEnum): Observable<any> {
    let apiCall: any;
    switch (entityType) {
      case EntityTypeEnum.Clients:
        apiCall = this.api.post<any>(`${this.endpoint}/clients/${entityId}`, request);
        break;
      case EntityTypeEnum.Projects:
        apiCall = this.api.post<any>(`${this.endpoint}/cases/${entityId}`, request);
        break;
      default:
        apiCall = this.api.post<any>(`${this.endpoint}/search`, request);
        break;
    }
    return apiCall;
  }

  public searchByLedgerEntryId(request: IServerSideGetRowsRequestExtended, ledgerEntryId: number): Observable<Page<ClaimSettlementLedgerEntry>> {
    return this.api.post<IServerSideGetRowsRequestExtended>(`${this.endpoint}/ledger-entry/${ledgerEntryId}`, request);
  }

  public export(
    name: string,
    searchOptions: IServerSideGetRowsRequestExtended,
    columns: ColumnExport[],
    entityId: number,
    entityType: EntityTypeEnum,
    channelName: string,
  ): Observable<string> {
    let apiUrl: string;
    const baseExportUrl = `${this.endpoint}/export`;
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    switch (entityType) {
      case EntityTypeEnum.Clients:
        apiUrl = `${baseExportUrl}/clients/${entityId}`;
        break;
      case EntityTypeEnum.Projects:
        apiUrl = `${baseExportUrl}/cases/${entityId}`;
        break;
      default:
        apiUrl = baseExportUrl;
        break;
    }
    return this.api.post(apiUrl, requestParams);
  }

  public downloadDocument(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/export/${id}`);
  }

  public voidPayment(id: number, note: string): Observable<any> {
    return this.api.post(`/payments/${id}/void`, {id, note});
  }
}
