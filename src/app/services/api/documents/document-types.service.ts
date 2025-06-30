import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentType } from '@app/models/documents/document-type';

import { RestService } from '../_rest.service';

@Injectable({ providedIn: 'root' })
export class DocumentTypesService extends RestService<any> {
  endpoint = '/documentTypes';

  public getDocumentTypesList(entityTypeId: number, additionalDocumentTypeId?: number): Observable<DocumentType[]> {
    const queryParams = additionalDocumentTypeId ? `?additionalDocumentTypeId=${additionalDocumentTypeId}` : '';
    return this.api.get<Observable<DocumentType[]>>(`${this.endpoint}/${entityTypeId}${queryParams}`);
  }

  public getDocumentTypeById(id: number): Observable<DocumentType> {
    return this.api.get<Observable<DocumentType>>(`${this.endpoint}/documentTypeId/${id}`);
  }

  public getDocumentTypesListByProductCategoryId(productCategoryId: number, entityTypeId: number): Observable<DocumentType[]> {
    return this.api.get<Observable<DocumentType[]>>(`${this.endpoint}/productCategory/${productCategoryId}/entityType/${entityTypeId}`);
  }
}
