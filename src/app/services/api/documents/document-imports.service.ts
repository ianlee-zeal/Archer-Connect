import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DocumentImportTemplate, DocumentImport } from '@app/models/documents';
import { Page } from '@app/models/page';
import { FileImportDocumentType, FileImportResultStatus } from '@app/models/enums';
import { ValidationResults } from '@app/models/file-imports';
import { RestService } from '../_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { ManualPaymentDetailItem } from '@app/models/file-imports/manual-payment-detail-item';

@Injectable({ providedIn: 'root' })
export class DocumentImportsService extends RestService<any> {
  endpoint = '/documentImports';

  public getDocumentImportTemplates(entityTypeId: number): Observable<DocumentImportTemplate[]> {
    return this.api.get<Observable<DocumentImportTemplate[]>>(`${this.endpoint}/templates?entityType=${entityTypeId}`);
  }

  public getDocumentImportsSearch(entityType: number, entityId: number, search = null): Observable<Page<DocumentImport>> {
    return this.api.post<Observable<Page<DocumentImport>>>(`${this.endpoint}/search?entityType=${entityType}&entityId=${entityId}`, search);
  }

  public createBulkDocument(documentImport: DocumentImport, file: File) {
    return this.api.postWithFile(this.endpoint, documentImport, file);
  }

  public approveJob(id: number, channelName: String): Observable<any> {
    return this.api.put(`${this.endpoint}/${id}/${channelName}/ApproveJob`, null);
  }

  public reviewJob(id: number, channelName: String): Observable<any> {
    return this.api.put(`${this.endpoint}/${id}/${channelName}/ReviewJob`, null);
  }

  public getDropdownValues(entityType: number, entityId: number): Observable<any[]> {
    return this.api.get(`${this.endpoint}/dropdownvalues/entityType/${entityType}/entity/${entityId}`);
  }

  public downloadTemplate(templateId: number, fileName?: string): Observable<File> {
    return this.api.getFile(`${this.endpoint}/templates/${templateId}`, fileName);
  }

  public downloadRelatedTemplate(templateId: number, caseId: number, fileName?: string): Observable<File> {
    return this.api.getFile(`${this.endpoint}/case/${caseId}/templates/${templateId}`, fileName);
  }

  public downloadRelatedFiles(documentImportId: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/download-import-files/${documentImportId}`);
  }

  public getDocumentImportsResult(
    entityId: number,
    documentTypeId: FileImportDocumentType,
    searchOptions: IServerSideGetRowsRequestExtended,
    importResultStatus?: FileImportResultStatus,
  ): Observable<ValidationResults> {
    let statuses = '';
    if (FileImportResultStatus[importResultStatus]) {
      statuses = `/statuses/${importResultStatus}`;
    }
    return this.api.post(`${this.endpoint}/searchDocuments/${entityId}/documentTypes/${documentTypeId}${statuses}`, searchOptions);
  }

  public uploadAdditionalFiles(documentImportId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.api.postFormData(`${this.endpoint}/${documentImportId}/additional-documents`, formData);
  }

  public updatePaymentRequestItem(documentImportId: number, paymentRequestItemId: number, item: ManualPaymentDetailItem): Observable<any> {
    return this.api.put(`${this.endpoint}/${documentImportId}/payment-request-item/${paymentRequestItemId}`, item);
  }

  public getTotalPayment(id): Observable<number> {
    return this.api.get<number>(`${this.endpoint}/get-total-payment/${id}`);
  }
}
