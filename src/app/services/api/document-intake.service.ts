import { Injectable } from '@angular/core';
import { DocumentIntakeItem } from '@app/models/document-intake-item';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class DocumentIntakeService extends RestService<DocumentIntakeItem> {
  endpoint = '/document-review';

  search(search = null): Observable<any> {
    const searhModel = {
      ...search,
      filterModel: [
        ...search.filterModel,
        {
          key: 'document.documentLink.entityTypeId',
          type: 1,
          filter: '3',
          filterType: 1,
        },
        {
          key: 'statusId',
          type: 1,
          filter: '115',
          filterType: 1,
        },
        {
          key: 'document.documentTypeId',
          type: 1,
          filter: '16',
          filterType: 1,
        },
      ],
    };
    return this.api.post<any>(`${this.endpoint}/search`, searhModel);
  }
}
