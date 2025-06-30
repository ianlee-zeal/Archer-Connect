import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ColumnExport, IdValue } from '@app/models';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class PacketRequestService extends RestService<any> {
  endpoint = '/packet-requests';

  public getAllMissingDocs(): Observable<IdValue[]> {
    return this.api.get(`${this.endpoint}/missing-docs`);
  }

  public getAllDocsToSend(): Observable<IdValue[]> {
    return this.api.get(`${this.endpoint}/docs-to-send`);
  }

  public getDocumentsByProbateId(probateId: number): Observable<IdValue[]> {
    return this.api.get(`${this.endpoint}/${probateId}/documents`);
  }

  public getStatuses(): Observable<IdValue[]> {
    return this.api.get(`${this.endpoint}/export/statuses`);
  }

  public exportPendingPacket(name: string, columns: ColumnExport[], channelName: string, statusesIds: number[]): Observable<string> {
    const requestParams = {
      name,
      columns,
      channelName,
      statusesIds,
    };
    return this.api.post(`${this.endpoint}/export`, requestParams);
  }
}
