/* eslint-disable no-param-reassign */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MedicalLiensOverviewItem } from '@app/models/medical-liens-overview-item';
import { Page } from '@app/models/page';
import { ColumnExport, LienService, IdListRequest, PaymentInstruction } from '@app/models';
import { HttpContext, HttpParams } from '@angular/common/http';
import { ProductCategory } from '@app/models/enums';
import { StringHelper } from '@app/helpers/string.helper';
import { LedgerInfo, NetAllocationDetails, ChartOfAccount } from '@app/models/closing-statement';
import { LedgerSummary } from '@app/models/closing-statement/ledger-summary';
import { LedgerEntryInfo } from '@app/models/closing-statement/ledger-entry-info';
import { LedgerVariance } from '@app/models/closing-statement/ledger-variance';
import { ClaimSettlementLedgerPayee } from '@app/models/ledger-settings';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { ISearchOptions } from '@app/models/search-options';
import { BatchActionDto } from '@app/models/batch-action/batch-action';
import { LedgerOverviewTotal } from '@app/models/ledger-overview-total';
import { ClientPaymentHold, IRemovePaymentFromHoldRequest } from '@app/models/client-payment-hold';
import { NotesListSearchParams } from '@app/modules/shared/state/notes-list/state';
import { ClaimantCounts } from '@app/models/claimant-counts';
import { BYPASS_SPINNER } from '@app/tokens/http-context-tokens';
import { DeficiencySummaryOption } from '@app/models/documents/document-generators/deficiency-summary-option';
import { RestService } from './_rest.service';
import { ClaimantOverviewProbate } from '@app/models/claimant-overview/claimant-overview-probate';
import { ClaimantOverviewBankruptcy } from '@app/models/claimant-overview/claimant-overview-bankruptcy';
import { ClaimantOverviewReleaseAdmin } from '@app/models/claimant-overview/claimant-overview-release-admin';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { CommonHelper } from '@app/helpers';
import { Claimant } from '@app/models/claimant';

@Injectable({ providedIn: 'root' })
export class ClientsService extends RestService<any> {
  endpoint = '/clients';

  public getClaimantSummaryById(claimantId: number): Observable<any[]> {
    return this.api.get<Observable<any[]>>(`${this.endpoint}/${claimantId}/summary`);
  }

  public getClaimantIdList(searchOptions: IServerSideGetRowsRequestExtended): Observable<number[]> {
    const body: IdListRequest = { searchOptions };
    return this.api.post<IdListRequest>(`${this.endpoint}/idList`, body);
  }

  public export(name: string, channelName, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[]): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(`${this.endpoint}/export`, requestParams);
  }

  public getServices(claimantId: number): Observable<[LienService]> {
    return this.api.get<Observable<LienService[]>>(`${this.endpoint}/${claimantId}/services`);
  }

  public getClaimantDashboardOverview(claimantId: number): Observable<any> {
    const context = new HttpContext().set(BYPASS_SPINNER, true);
    return this.api.get<Observable<any>>(`${this.endpoint}/${claimantId}/overview-dashboard`, null, context);
  }

  public getClaimantOverviewProbateItems(claimantId: number): Observable<ClaimantOverviewProbate[]> {
    const context = new HttpContext().set(BYPASS_SPINNER, true);
    return this.api.get<Observable<any>>(`${this.endpoint}/${claimantId}/overview-probates`, null, context);
  }

  public getClaimantOverviewBankruptcyItems(claimantId: number): Observable<ClaimantOverviewBankruptcy[]> {
    const context = new HttpContext().set(BYPASS_SPINNER, true);
    return this.api.get<Observable<any>>(`${this.endpoint}/${claimantId}/overview-bankruptcies`, null, context);
  }

  public getClaimantOverviewRelease(claimantId: number): Observable<ClaimantOverviewReleaseAdmin> {
    const context = new HttpContext().set(BYPASS_SPINNER, true);
    return this.api.get<Observable<ClaimantOverviewReleaseAdmin>>(`${this.endpoint}/${claimantId}/overview-release`, null, context);
  }

  public getClaimantDashboardOverviewAdditionalInfo(productCategoryId: number, productCategoryTypeId: number): Observable<any> {
    const params = new HttpParams()
      .append('productCategoryId', productCategoryId.toString())
      .append('productCategoryType', productCategoryTypeId.toString());

    return this.api.get<Observable<any>>(`${this.endpoint}/overview-dashboard-additional-information`, params);
  }

  public getMedicalLiensOverview(claimantId: number, searchOptions): Observable<Page<MedicalLiensOverviewItem>> {
    return this.api.get<Observable<Page<MedicalLiensOverviewItem>>>(`${this.endpoint}/${claimantId}/medical-liens-overview${StringHelper.queryString({ searchOptions })}`);
  }

  public getProductDetails(clientId: number, category: ProductCategory): Observable<any> {
    const params = {
      clientId,
      category,
    };
    return this.api.get<Observable<any>>(`/products/${clientId}${StringHelper.queryString(params)}`);
  }

  public getDataSource(clientId: number, category: ProductCategory): Observable<any> {
    const params = {
      clientId,
      category,
    };

    return this.api.get<Observable<any>>(`/data-sources/${StringHelper.queryString(params)}`);
  }

  public downloadDocument(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/export/${id}`);
  }

  public getChartOfAccounts(projectId: number): Observable<[ChartOfAccount]> {
    return this.api.get<Observable<ChartOfAccount[]>>(`${this.endpoint}/projects/${projectId}/chart-of-accounts`);
  }

  public getNetAllocationDetails(clientId: number, ledgerInfo: LedgerInfo): Observable<NetAllocationDetails> {
    return this.api.post(`${this.endpoint}/${clientId}/net-allocation`, ledgerInfo);
  }

  public getDisbursementGroupList(clientId: number, searchOptions: IServerSideGetRowsRequestExtended): Observable<Page<any>> {
    return this.api.post(`${this.endpoint}/${clientId}/disbursement-groups`, searchOptions);
  }

  public exportDisbursementGroups(clientId: number, name: string, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(`${this.endpoint}/${clientId}/disbursement-groups/export`, requestParams);
  }

  public downloadDisbursementGroupsDocument(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/${id}/disbursement-groups/export`);
  }

  public getLedgerSummaryList(clientId: number): Observable<LedgerSummary[]> {
    return this.api.post(`${this.endpoint}/${clientId}/ledger-info-list`, {});
  }

  public getLedgerEntryInfo(id: number): Observable<LedgerEntryInfo> {
    return this.api.get(`${this.endpoint}/ledger-entry-details/${id}`);
  }

  public updateLedgerEntryInfo(ledgerEntryInfo: Partial<LedgerEntryInfo>): Observable<any> {
    let ledgerEntryInfoCopy = CommonHelper.getDeepCopy<LedgerEntryInfo>(ledgerEntryInfo);
    if (ledgerEntryInfoCopy.paymentInstructions) {
      ledgerEntryInfoCopy.paymentInstructions = ledgerEntryInfoCopy.paymentInstructions.map((item: PaymentInstruction) => {
        if (item.id < 0) {
          item.id = 0;
        }
        return item;
      });
    }
    return this.api.put(`${this.endpoint}/ledger-entry-details`, ledgerEntryInfoCopy);
  }

  public getLedgerVariances(clientId: number, disbursementGroupId?: number): Observable<LedgerVariance[]> {
    if (disbursementGroupId) {
      return this.api.get(`${this.endpoint}/${clientId}/disbursement-groups/${disbursementGroupId}/ledger-variances`);
    }

    return this.api.get(`${this.endpoint}/${clientId}/ledger-variances`);
  }

  public getClaimSettlementLedgers(params: ISearchOptions, projectId: number): Observable<any> {
    return this.api.post(`${this.endpoint}/ledger-info-search?caseId=${projectId}`, params);
  }

  public getDefaultPayeesForLedgerEntry(id: number): Observable<ClaimSettlementLedgerPayee> {
    return this.api.get(`/claimSettlementLedgerEntry/${id}/payee/default`);
  }

  public getPayeesForLedgerEntry(id: number): Observable<ClaimSettlementLedgerPayee[]> {
    return this.api.get(`/claimSettlementLedgerEntry/${id}/payee`);
  }

  public generateFeeExpense(params: SaveDocumentGeneratorRequest): Observable<any> {
    return this.api.post(`${this.endpoint}/fee-expense-generate`, params);
  }

  public generateDocumentByDocumentGenerationId(generateId: number, channelName: string): Observable<any> {
    return this.api.post(`${this.endpoint}/document-generation/${generateId}`, { channelName });
  }

  public validateFeeExpense(params: SaveDocumentGeneratorRequest): Observable<any> {
    return this.api.post(`${this.endpoint}/fee-expense-validate`, params);
  }

  public getDeficiencySummary(documentGenerationId: number): Observable<DeficiencySummaryOption[]> {
    return this.api.get(`${this.endpoint}/document-generation/deficiency-summary/${documentGenerationId}`);
  }

  public canPublishDWGeneration(caseId: number, searchOptions: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post(`${this.endpoint}/fee-expense-generate/can-publish/dw-worksheet-generation/${caseId}`, searchOptions);
  }

  public updateLedgerStageBatchAction(batchAction: BatchActionDto): Observable<any> {
    return this.api.post(`${this.endpoint}/ledger-update-stage-batch-action`, batchAction);
  }

  public updateDisbursementGroupBatchAction(batchAction: BatchActionDto): Observable<any> {
    return this.api.post(`${this.endpoint}/update-disbursement-group-batch-action`, batchAction);
  }

  public authorizeLedgerEntriesBatchAction(batchAction: BatchActionDto): Observable<any> {
    return this.api.post(`${this.endpoint}/authorize-ledger-entries-batch-action`, batchAction);
  }


  public getLedgerOverviewList(clientId: number, searchOptions: IServerSideGetRowsRequestExtended): Observable<Page<any>> {
    return this.api.post(`${this.endpoint}/${clientId}/ledger-overview`, searchOptions);
  }

  public getLedgerOverviewTotal(clientId: number, searchOptions: IServerSideGetRowsRequestExtended): Observable<LedgerOverviewTotal> {
    return this.api.post(`${this.endpoint}/${clientId}/ledger-overview-total`, searchOptions);
  }

  public getLedgerStagesWithClaimantCount(projectId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/ledger-stages-with-claimant-count/${projectId}`);
  }

  public putOrUpdateClaimantHold(clientPaymentHold: ClientPaymentHold): Observable<ClientPaymentHold> {
    return this.api.post(`${this.endpoint}/put-on-or-update-hold`, clientPaymentHold);
  }

  public removeFromHold(request: IRemovePaymentFromHoldRequest): Observable<boolean> {
    return this.api.post(`${this.endpoint}/remove-from-hold`, request);
  }

  public getHoldPaymentHistoryList(params: IServerSideGetRowsRequestExtended, clientId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/client-hold-history/${clientId}`, params);
  }

  public getLedgerStageChangeHistory(ledgerId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/ledger-stage-change-history/${ledgerId}`);
  }

  public getNotes(clientId: number, search: NotesListSearchParams): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/notes/${clientId}${StringHelper.queryString(search)}`);
  }

  public getClaimantCounts(clientId: number): Observable<ClaimantCounts> {
    const context = new HttpContext().set(BYPASS_SPINNER, true);
    return this.api.get<Observable<ClaimantCounts>>(`${this.endpoint}/${clientId}/claimant-counts`, null, context);
  }

  public getFullPinByClientId(clientId: number): Observable<string> {
    return this.api.get(`${this.endpoint}/${clientId}/pin`);
  }

  public deleteLedger(clientId: number, disbursementGroupId: number, preview: boolean): Observable<void> {
    return this.api.delete(`${this.endpoint}/${clientId}/${disbursementGroupId}?preview=${preview}`);
  }

  public generateFinalStatusLetter(clientId: number, channelName: string): Observable<any> {
    return this.api.post(`${this.endpoint}/generate-final-status-letter`, { clientId, channelName });
  }

  public getBasicInfo(id: string): Observable<Claimant> {
    return this.api.get(`${this.endpoint}/${id}/basic-info`);
  }
}
