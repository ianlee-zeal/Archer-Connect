import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from '../_rest.service';
import { EntityTypeCategoryEnum } from '@app/models/enums/entity-type-category.enum';
import { PermissionActionType } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class PermissionsV2Service extends RestService<any> {
  endpoint = '/v2/permissions';

  public getAll(entityCategoryIds: EntityTypeCategoryEnum[]): Observable<any> {
    return this.index({ categories: entityCategoryIds });
  }

  public getCurrent(): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/current`);
  }

  public getActionTypes(): Observable<PermissionActionType[]> {
    return this.api.get<PermissionActionType[]>(`${this.endpoint}/action-types`);
  }
}
