import { Injectable } from '@angular/core';
import { IExportRequest } from '@app/models/export-request';

import { Observable } from 'rxjs';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })

export class ElectionFormsService extends RestService<any> {
  endpoint = '/cases';

  public getElectionForms(searchOptions: IServerSideGetRowsRequestExtended, projectId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${projectId}/election-forms`, searchOptions);
  }

  public export(exportRequest: IExportRequest): Observable<any> {
    return this.api.post<any>('/election-forms/export', exportRequest);
  }
}
