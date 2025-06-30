import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityTypeEnum } from '@app/models/enums';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class FinancialProcessorService extends RestService<any> {
  endpoint = '/financial-processor';

  public startProjectProcessing(projectId: number, pusherChannelName: string): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${projectId}/process-project`, { channelName: pusherChannelName });
  }

  public startClientProcessing(clientId: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${clientId}/process-client`, {});
  }

  public getLatestRun(entityType: EntityTypeEnum, entityId: number): Observable<any[]> {
    return this.api.get<any>(`${this.endpoint}/latest-run/${entityType}/${entityId}`);
  }
}
