/* eslint-disable no-param-reassign */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { TransferItemsResponse, TransferRequestDetails, TransferRequestDto, TransferRequestTotalInfo } from '@app/models'
import { RequestReviewOption } from '@app/models/payment-request/payment-request-review-result'
import { IServerSideGetRowsRequest } from 'ag-grid-community'
import { Page } from '@app/models/page'
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';

@Injectable({ providedIn: 'root' })
export class TransfersService extends RestService<any> {
  endpoint = '/transfers';

  public getTransferRequest(batchActionId: number): Observable<TransferRequestDto> {
    return this.api.get(`${this.endpoint}/?batchActionId=${batchActionId}`);
  }

  public getPaymentRequestDetailsById(transferRequestId: number, searchOptions: IServerSideGetRowsRequest): Observable<Page<TransferRequestDetails>> {
    return this.api.post(`${this.endpoint}/${transferRequestId}`, searchOptions);
  }

  public updateTransferOptions(transferRequestId: number, params: RequestReviewOption[]): Observable<any> {
    return this.api.put(`${this.endpoint}/${transferRequestId}/options`, params);
  }

  public getTransferItems(transferRequestId: number): Observable<TransferItemsResponse> {
    return this.api.get(`${this.endpoint}/${transferRequestId}/items`);
  }

  public getReviewTransfers(transferRequestId: number): Observable<TransferItemsResponse> {
    return this.api.get(`${this.endpoint}/${transferRequestId}/review-transfers`);
  }

  public acceptTransferRequest(transferRequestId: number, request: FormData): Observable<any> {
    return this.api.postFormData(`${this.endpoint}/${transferRequestId}/accept-data`, request);
  }

  public searchTransferRequests(params: IServerSideGetRowsRequest): Observable<any> {
    return this.api.post(`${this.endpoint}/requests/search`, params);
  }

  public downloadAttachments(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/${id}/attachments`);
  }

  public getTransferRequestTotalInfoById(transferRequestId: number): Observable<TransferRequestTotalInfo> {
    return this.api.get(`${this.endpoint}/${transferRequestId}/total-info`);
  }

  public getPaymentRequestVoidCountsById(transferRequestId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/${transferRequestId}/void/counts`);
  }

  public generateExtract(transferRequestId: number, channelName: string, batchActionTemplateId: number): Observable<any> {
    if (batchActionTemplateId == BatchActionTemplate.RefundTransferRequest)
      return this.api.post(`${this.endpoint}/${transferRequestId}/refunds?channelName=${channelName}`, null);

    return this.api.post(`${this.endpoint}/${transferRequestId}/extract?channelName=${channelName}`, null);
  }

  public getTransferItemDetails(searchOptions: IServerSideGetRowsRequestExtended, transferId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${transferId}/transfer-item-details`, searchOptions)
  }

  public getCanBeVoided(id: number): Observable<any> {
    return this.api.get(`${this.endpoint}/payment/${id}/can-be-voided`,);
  }

  public voidPayment(id: number, note: string): Observable<any> {
    return this.api.post(`${this.endpoint}/payment/${id}/void`, `'${note}'`);
  }
}
