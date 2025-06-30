import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { StringHelper } from '@app/helpers/string.helper';
import { Document } from '@app/models/documents/document';
import { ValidationResults } from '@app/models/file-imports';
import { Page } from '@app/models/page';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { DocumentsListSearchParams } from '@app/modules/shared/state/documents-list/actions';
import { RestService } from '../_rest.service';

@Injectable({ providedIn: 'root' })
export class DocumentsService extends RestService<any> {
  endpoint = '/documents';
  endpointDocumentLinks = '/documentLinks';

  public getDocumentsList(searchOptions: IServerSideGetRowsRequestExtended | {}, searchParams: DocumentsListSearchParams, isMaster: boolean): Observable<Page<Document>> {
    if (isMaster) {
      return this.index({ ...searchParams, searchOptions });
    } else {
      const caseId = StringHelper.queryString({ caseId: searchParams.entityId });
      return this.api.post<any>(`${this.endpoint}/external${caseId}`, searchOptions );
    }
  }

  public getDocumentsListByDocumentType(documentTypeId: number, searchOptions: IServerSideGetRowsRequestExtended | {}, searchParams: DocumentsListSearchParams): Observable<Page<Document>> {
    return this.api.get<Page<Document>>(`${this.endpoint}/documentType/${documentTypeId}/${StringHelper.queryString({ ...searchParams, searchOptions })}`);
  }

  public getDocument(id: number): Observable<any> {
    return this.get(id);
  }

  public updateDocument(document, file?: File, useFormData: boolean = false): Observable<any> {
    return useFormData && file
      ? this.api.postWithFileFormData(`${this.endpoint}/${document.id}/update`, document, file, true)
      : this.api.putWithFile(`${this.endpoint}/${document.id}`, document, file);
  }

  public downloadDocument(id: number, fileName?: string): Observable<File> {
    return this.api.getFile(`${this.endpoint}/${id}/export`, fileName);
  }

  public downloadByDocumentLinkId(id: number): Observable<File> {
    return this.api.getFile(`${this.endpointDocumentLinks}/${id}/export`);
  }

  public downloadDocuments(ids: number[]): Observable<File> {
    return this.api.getFile(`${this.endpoint}/export${StringHelper.queryString({ documentIds: ids })}`);
  }

  public openDocument(id: number): Observable<File> {
    return this.api.openFile(`${this.endpoint}/${id}/export`);
  }

  public export(id: number): Observable<ValidationResults> {
    return this.api.get(`${this.endpoint}/${id}/export`);
  }

  public deleteDocument(id: number): Observable<any> {
    return this.delete(id);
  }

  public deleteDocuments(ids: number[]): Observable<boolean> {
    return this.api.delete(this.endpoint, ids);
  }

  public createDocument(document: Document, file: File, useFormData?: boolean): Observable<any> {
    return useFormData
      ? this.api.postWithFileFormData(this.endpoint + '/upload', document, file, false)
      : this.api.postWithFile(this.endpoint, document, file, false);
  }
}
