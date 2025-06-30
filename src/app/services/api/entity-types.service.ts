import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EntityTypeCategoryEnum } from '@app/models/enums/entity-type-category.enum';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class EntityTypesService extends RestService<any> {
  endpoint = '/entity-types';

  public getAll(entityCategories?: EntityTypeCategoryEnum[]): Observable<any> {
    return this.index({ categories: entityCategories });
  }

  public getDocumentTypes(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/document-types`);
  }
}
