import { Injectable } from '@angular/core';
import { ColumnExport } from '@app/models';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';

import { Observable } from 'rxjs';
import { PaymentQueue } from '@app/models/payment-queue';
import { Page } from '@app/models/page';
import { BatchActionDto } from '@app/models/batch-action/batch-action';
import { RestService } from './_rest.service';
import { CopySpecialPaymentInstructionData } from '@app/models/payment-queue/copy-special-payment-instruction-data';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { HttpContext } from '@angular/common/http';
import { BYPASS_SPINNER } from '@app/tokens/http-context-tokens';

@Injectable({ providedIn: 'root' })

export class PaymentQueueService extends RestService<any> {
  endpoint = '/cases';
  clientsEndPoint = '/clients';
  paymentSearch = '/payments-search';
  claimSettlementLedgerEntryEndpoint = '/claimSettlementLedgerEntry';

  public getPaymentQueue(searchOptions: IServerSideGetRowsRequestExtended, projectId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${projectId}/payment-queue`, searchOptions);
  }

  public searchPaymentQueue(searchOptions: IServerSideGetRowsRequestExtended): Observable<Page<PaymentQueue>> {
    return this.api.post<IServerSideGetRowsRequestExtended>(`${this.paymentSearch}/payment-queue/search`, searchOptions);
  }

  public exportGlobalPaymentQueue(name: string, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(`${this.paymentSearch}/payment-queue/export`, requestParams);
  }

  public getPaymentQueueCounts(projectId: number, searchOptlions: IServerSideGetRowsRequestExtended): Observable<any> {
    const context = new HttpContext().set(BYPASS_SPINNER, true);
    if (projectId) {
      return this.api.post<any>(`${this.endpoint}/${projectId}/payment-queue-counts`, searchOptlions, context);
    }
    return this.api.post<any>(`${this.endpoint}/payment-queue-counts`, searchOptlions, context);
  }

  public generateRemittanceDetails(params: SaveDocumentGeneratorRequest): Observable<any> {
    return this.api.post(`${this.endpoint}/generate`, params);
  }

  public getLedgerAccounts(projectId?: number): Observable<any> {
    return this.api.get<any>(`${this.clientsEndPoint}/ledger-accounts-with-claimant-count/${projectId ?? ''}`);
  }

  public getLedgerAccountGroups(projectId?: number): Observable<any> {
    return this.api.get<any>(`${this.clientsEndPoint}/ledger-account-groups-with-claimant-count/${projectId ?? ''}`);
  }

  public getChartOfAccountGroupNumbers(projectId: number): Observable<SelectOption[]> {
    return this.api.get<SelectOption[]>(`${this.endpoint}/${projectId}/chart-of-account-group-numbers`);
  }

  public getGetChartOfAccountNumbers(projectId: number): Observable<SelectOption[]> {
    return this.api.get<SelectOption[]>(`${this.endpoint}/${projectId}/chart-of-account-numbers`);
  }

  public downloadStandardRequest(id: number, name: string, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(`${this.endpoint}/${id}/payment-queue/export`, requestParams);
  }

  public downloadCheckTableRequest(id: number, name: string, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(`${this.paymentSearch}/payment-queue/check-table-export`, requestParams);
  }

  public downloadDocument(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/export/${id}`);
  }

  public updateLienPaymentStageBatchAction(batchAction: BatchActionDto): Observable<any> {
    return this.api.post('/payments/batch-action/liens/update-stage', batchAction);
  }

  public getCopySpecialPaymentInstructions(ledgerEntryId: number, projectId: number): Observable<CopySpecialPaymentInstructionData[]> {
    return this.api.get<SelectOption[]>(`${this.claimSettlementLedgerEntryEndpoint}/${ledgerEntryId}/${projectId}/copy-payment-instructions`);
  }
}
