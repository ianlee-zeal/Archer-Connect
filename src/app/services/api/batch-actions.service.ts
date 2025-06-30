/* eslint-disable no-param-reassign */
import { Injectable } from '@angular/core';
import { IGeneratePaymentRequest, IGeneratePaymentRequestGlobal } from '@app/models';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import { BatchActionReviewOptions } from '@app/models/batch-action/batch-action-review-options';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';
import { Page } from '@app/models/page';
import { Payment } from '@app/models/payment';
import { RequestReviewOption } from '@app/models/payment-request/payment-request-review-result';
import { IUpdatePaymentRequest } from '@app/models/payment-request/update-payment-request';
import { RefundTransferItem } from '@app/models/refund-transfer-request/refund-transfer-item';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { Observable } from 'rxjs';
import { IdValue } from '../../models/idValue';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class BatchActionsService extends RestService<any> {
  endpoint = '/batch-actions';
  endpointTransfers = '/transfers';

  public generatePaymentRequest(params: IGeneratePaymentRequest): Observable<IdValue> {
    if (!params.searchOptions) {
      params.searchOptions = {
        ...params.paymentRequestConfig.searchOptions,
        ...{
          startRow: 0,
          endRow: 25,
          sortModel: [{ sort: 'asc', colId: 'firstName' }],
        },
      };
    }
    const config = params.paymentRequestConfig;
    config.attachLetterForLiensTemplateId = config.attachLetterForLiens ? config.attachLetterForLiensTemplateId : 0;
    config.closingStatementTemplateId = config.attachClosingStatement ? config.closingStatementTemplateId : 0;
    return this.api.post(`${this.endpoint}/payment-request/${params.caseId}`, params);
  }

  public generatePaymentRequestGlobal(params: IGeneratePaymentRequestGlobal): Observable<IdValue> {
    if (!params.searchOptions) {
      params.searchOptions = {
        ...params.paymentRequestConfig.searchOptions,
        ...{
          startRow: 0,
          endRow: 25,
          sortModel: [{ sort: 'asc', colId: 'firstName' }],
        },
      };
    }
    const config = params.paymentRequestConfig;
    config.attachLetterForLiensTemplateId = config.attachLetterForLiens ? config.attachLetterForLiensTemplateId : 0;
    config.closingStatementTemplateId = config.attachClosingStatement ? config.closingStatementTemplateId : 0;
    return this.api.post(`${this.endpoint}/payment-request-global`, params);
  }

  public getPaymentRequestData(projectId: number, paymentRequestId: number, documentId: number): Observable<Payment[]> {
    return this.api.get(`${this.endpoint}/payment-request/${paymentRequestId}/case/${projectId}/document/${documentId}`);
  }

  public getPaymentRequestReviewWarnings(projectId: number, paymentRequestId: number, documentId: number): Observable<RequestReviewOption[]> {
    return this.api.get(`${this.endpoint}/payment-request/${paymentRequestId}/case/${projectId}/document/${documentId}/warnings`);
  }

  public getPaymentRequestResultData(projectId: number, paymentRequestId: number, documentId: number): Observable<Payment[]> {
    return this.api.get(`${this.endpoint}/payment-request/${paymentRequestId}/case/${projectId}/document/result/${documentId}`);
  }

  public startPaymentRequestJob(paymentRequestId: number): Observable<boolean> {
    return this.api.post(`${this.endpoint}/payment-request/start`, paymentRequestId);
  }

  public updatePaymentRequest(paymentRequestId: number, params: IUpdatePaymentRequest): Observable<IdValue> {
    return this.api.put(`${this.endpoint}/payment-request/${paymentRequestId}`, params);
  }

  public reviewPaymentRequestJob(paymentRequestId: number): Observable<boolean> {
    return this.api.post(`${this.endpoint}/payment-request/review`, paymentRequestId);
  }

  public acceptPaymentRequest(paymentRequestId: number): Observable<IdValue> {
    return this.api.get(`${this.endpoint}/payment-request/accept/${paymentRequestId}`);
  }

  public startAcceptPaymentRequestJob(paymentRequestId: number, requestData: FormData): Observable<any> {
    return this.api.postFormData(`${this.endpoint}/payment-request/accept/start/${paymentRequestId}/`, requestData);
  }

  public load(batchActionId: number): Observable<string> {
    return this.api.put(`${this.endpoint}/${batchActionId}/load`, {});
  }

  public create(batchAction: BatchActionDto): Observable<any> {
    return this.api.post(this.endpoint, batchAction);
  }

  public process(batchActionId: number): Observable<string> {
    return this.api.put(`${this.endpoint}/${batchActionId}/process`, {});
  }

  public review(transferRequestId: number): Observable<any> {
    return this.api.put(`${this.endpoint}/${transferRequestId}/review`, {});
  }

  public getBatch(id: number): Observable<BatchAction> {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  public getBatchActionSearch(entityType: number, entityId: number, search = null): Observable<Page<any>> {
    return this.api.post<Observable<Page<any>>>(`${this.endpoint}/search?entityType=${entityType}&entityId=${entityId}`, search);
  }

  public getBatchActionDocumentResult(
    entityId: number,
    documentTypeId: BatchActionDocumentType,
    searchOptions: IServerSideGetRowsRequestExtended,
    importResultStatus?: BatchActionResultStatus,
  ): Observable<any> {
    let statuses = '';
    if (BatchActionResultStatus[importResultStatus]) {
      statuses = `/statuses/${importResultStatus}`;
    }
    return this.api.post(`${this.endpoint}/searchDocuments/${entityId}/documentTypes/${documentTypeId}${statuses}`, searchOptions);
  }

  public getBatchActionWarningsRequest(
    batchActionId: number,
    documentTypeId: BatchActionDocumentType,
  ): Observable<BatchActionReviewOptions> {
    return this.api.get(`${this.endpoint}/deficiencies/${batchActionId}/documentTypes/${documentTypeId}/review`);
  }

  public uploadInputFile(batchActionId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.api.postFormData(`${this.endpoint}/${batchActionId}/input-document`, formData);
  }

  public uploadInputData(batchActionId: number, items: RefundTransferItem[]): Observable<any> {
    return this.api.post(`${this.endpoint}/${batchActionId}/refunds/input-data`, items);
  }

  public uploadAdditionalFiles(batchActionId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.api.postFormData(`${this.endpoint}/${batchActionId}/additional-documents`, formData);
  }
}
