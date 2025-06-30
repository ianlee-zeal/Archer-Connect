/* eslint-disable no-param-reassign */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PaymentRequestDetails, PaymentRequestTotalInfo } from '@app/models';
import { Page } from '@app/models/page';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { PaymentRequestUpload } from '@app/models/payment-request-upload';
import { FileHelper } from '@app/helpers/file.helper';
import { FormDataHelper } from '@app/helpers/form-data.helper';
import { ManualPaymentRequestDocs } from '@app/models/manual-payment-request-docs';
import { Document } from '../../models/documents/document';
import { StartGeneratePaymentDocumentsJobRequest } from '../../models/documents/document-generators/start-generate-payment-documents-job-request';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { ManualPaymentItemRow } from '@app/models/file-imports/manual-payment-item';

@Injectable({ providedIn: 'root' })
export class DisbursementsService extends RestService<any> {
  endpoint = '/paymentRequests';

  getPaymentRequestDetailsById(paymentRequestId: number, searchOptions: IServerSideGetRowsRequestExtended): Observable<Page<PaymentRequestDetails>> {
    return this.api.post(`${this.endpoint}/${paymentRequestId}`, searchOptions);
  }

  getPaymentRequestTotalInfoById(paymentRequestId: number): Observable<PaymentRequestTotalInfo> {
    return this.api.get(`${this.endpoint}/${paymentRequestId}/total-info`);
  }

  getPaymentRequestVoidCountsById(paymentRequestId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/${paymentRequestId}/void/counts`);
  }

  generateExtract(paymentRequestId: number, params: SaveDocumentGeneratorRequest, isManual: boolean): Observable<any> {
    if(isManual === true) {
      return this.api.post(`${this.endpoint}/${paymentRequestId}/manual/extract?channelName=${params.channelName}`, {});
    } else {
      return this.api.post(`${this.endpoint}/${paymentRequestId}/generate-extract`, params);
    }
  }

  downloadAttachments(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/${id}/attachments`);
  }

  generatePaymentDocuments(params: StartGeneratePaymentDocumentsJobRequest): Observable<boolean> {
    if (!params.paymentId) {
      return this.api.post(`${this.endpoint}/${params.paymentRequestId}/documents`, params);
    }
    return this.api.post(`${this.endpoint}/${params.paymentRequestId}/payment/${params.paymentId}/documents`, {});
  }

  getManualPaymentRequests(caseId: number, params: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post(`${this.endpoint}/search/manual/${caseId}`, params);
  }

  validatePaymentRequest(paymentRequest: PaymentRequestUpload): Observable<any> {
    const extension = FileHelper.getExtension(paymentRequest.spreadsheet.fileContent.name);
    paymentRequest.spreadsheet.fileName = FileHelper.extractFileName(paymentRequest.spreadsheet.fileContent.name, extension);
    paymentRequest.spreadsheet.mimeType = { extension } as any;

    const formData = FormDataHelper.objectToFormData(paymentRequest) as FormData;

    formData.append('file', paymentRequest.spreadsheet.fileContent, paymentRequest.spreadsheet.fileContent.name);

    return this.api.postFormData(`${this.endpoint}/upload`, formData);
  }

  approveManualPaymentRequests(submitData): Observable<any> {
    return this.api.post(`${this.endpoint}/submit`, submitData);
  }

  uploadDocumentForPaymentRequests(manualPaymentRequestDocs: ManualPaymentRequestDocs): Observable<any> {
    const data = { ...manualPaymentRequestDocs, additionalDocuments: [...manualPaymentRequestDocs.additionalDocuments] };
    const formData = FormDataHelper.documentsToFormData(data.additionalDocuments);

    for (let i = 0; i < data.additionalDocuments.length; i++) {
      data.additionalDocuments[i] = (Document.toDto(data.additionalDocuments[i], true)) as any;
    }

    formData.append('createData', JSON.stringify(data));

    return this.api.postFormData(`${this.endpoint}/createDocuments`, formData);
  }

  public getPaymentExtractDocument(paymentRequestId: number, generateId: number): Observable<any> {
    return this.api.getFile(`${this.endpoint}/${paymentRequestId}/payment-extract/${generateId}`);
  }

  public searchPaymentRequestItemsSummary(searchOptions: IServerSideGetRowsRequestExtended): Observable<Page<ManualPaymentItemRow>> {
    return this.api.post<IServerSideGetRowsRequestExtended>(`${this.endpoint}/search/items`, searchOptions);
  }
}
