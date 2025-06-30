import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { IdValue } from '@app/models';
import { StringHelper } from '@app/helpers/string.helper';
import { EntityTypeEnum } from '@app/models/enums';
import { Page } from '@app/models/page';
import { Stage } from '@app/models/stage';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class StagesService extends RestService<any> {
  endpoint = '/stages';

  public getDropdownByProductCategories(ids?: number[], entityTypeId?: EntityTypeEnum): Observable<IdValue[]> {
    const params = {
      entityTypeId: entityTypeId,
      ids: ids
    };

    return this.api.get<Observable<any[]>>(`${this.endpoint}/dropdowns/by-categories${StringHelper.queryString(params)}`);
  }

  public getDropdownByPhaseIds(ids?: number[], categoryIds?: number[]): Observable<any[]> {
    const params = {
      ids: ids,
      categoryIds: categoryIds,
    };

    return this.api.get<Observable<IdValue[]>>(`${this.endpoint}/dropdowns/by-phases${StringHelper.queryString(params)}`);
  }

  public getByEntityTypeId(entityTypeId: EntityTypeEnum, onlyActive?: boolean): Observable<any[]> {
    const params = { entityTypeId, onlyActive };

    return this.api.get<Observable<IdValue[]>>(`${this.endpoint}/by-entity-type${StringHelper.queryString(params)}`);
  }

  public search(searchParams: IServerSideGetRowsRequestExtended): Observable<Page<Stage>> {
    return this.api.post(`${this.endpoint}/search`, searchParams);
  }
}
