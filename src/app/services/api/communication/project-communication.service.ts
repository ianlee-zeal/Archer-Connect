import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import { IdValue } from '../../../models/idValue';
import { BaseCommunicationService } from './base-communication.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class ProjectCommunicationService extends BaseCommunicationService {
  endpoint = '/project-communications';

  public createCommunicationRecord(projectCommunicationRecord: ProjectCommunicationRecord): Observable<any> {
    return this.uploadFiles(projectCommunicationRecord);
  }

  getLevels(): Observable<IdValue[]> {
    return this.api.get<IdValue[]>(`${this.endpoint}/levels`);
  }

  getSentiments(): Observable<IdValue[]> {
    return this.api.get<IdValue[]>(`${this.endpoint}/sentiments`);
  }

  searchCommunications(request: IServerSideGetRowsRequestExtended, entityId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/cases/${entityId}`, request);
  }
}
