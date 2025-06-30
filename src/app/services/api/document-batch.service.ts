import { Injectable } from '@angular/core';
import { RestService } from './_rest.service';
import { DocumentBatchUploadSettings } from '@app/models/document-batch-upload/document-batch-upload-settings/document-batch-upload-settings';
import { CreateBatchRequest } from '@app/models/document-batch-upload/create-batch/create-batch-request';
import { CreateBatchResponse } from '@app/models/document-batch-upload/create-batch/create-batch-response';
import { UploadFileRequest } from '@app/models/document-batch-upload/upload-batch/upload-file-request';
import { Observable } from 'rxjs';
import { DocumentBatchResponse } from '@app/models/document-batch-upload/document-batch-response';
import { DocumentBatchDetailsResponse } from '@app/models/document-batch-get/get-single-batch/document-batch-details-response';
import { UploadFileResponse } from '@app/models/document-batch-upload/upload-batch/upload-file-response';
import { SearchTypeEnum } from '@app/models/enums/filter-type.enum';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Injectable({
  providedIn: 'root',
})
export class DocumentBatchService extends RestService<any> {
  endpoint = '/document-batch';
  casesEndpoint = '/cases';

  public GetDocumentBatchUploadSettings(): Observable<DocumentBatchUploadSettings> {
    return this.api.get<Observable<DocumentBatchUploadSettings>>(`${this.endpoint}/settings`);
  }

  public uploadFile(file: File, batchId: number, isLastFile: boolean): Observable<UploadFileResponse>{
    const request: UploadFileRequest = {
      isLastFile,
    };
    return this.api.postWithFileFormData(`${this.endpoint}/${batchId}/upload-file`, request, file, false);
  }

  public createBatch(batchRequest: CreateBatchRequest): Observable<CreateBatchResponse> {
    return this.api.post<CreateBatchRequest>(`${this.endpoint}/`, batchRequest)
  }

  public getSingleBatch(batchId: number): Observable<DocumentBatchDetailsResponse> {
    return this.api.get(`${this.endpoint}/${batchId}`);
  }

  public searchBatches(request: IServerSideGetRowsRequestExtended): Observable<DocumentBatchResponse> {
    //search only where status is not pending/abandoned/canceled
    request.filterModel.push(new FilterModel({
      filter: '302,303,304',
      filterType: 'number',
      key: 'statusId',
      type: SearchTypeEnum.NotContains,
    }));
    return this.api.post(`${this.endpoint}/search`, request);
  }

  public searchProjects(request: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post(`${this.casesEndpoint}/search`, request);
  }

  public cancelUploadTask(batchId: number): Observable<any> {
    return this.api.put(`${this.endpoint}/${batchId}/cancel`, null);
  }

  public getStatusTypes(): Observable<any> {
    return this.api.get(`${this.endpoint}/statuses`);
  }

}
