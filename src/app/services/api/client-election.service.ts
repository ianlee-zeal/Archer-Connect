import { Injectable } from '@angular/core';
import { ClaimantElection, IdValue } from '@app/models';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class ClientElectionService extends RestService<ClaimantElection> {
  endpoint = '/election-forms';
  probatesEndpoint = '/probates';

  public getElectionForm(id: number): Observable<ClaimantElection> {
    return this.api.get<ClaimantElection>(`${this.endpoint}/getByElectionFormId/${id}`);
  }

  public list(gridParams: IServerSideGetRowsRequestExtended, clientId: number): Observable<any> {
    const searchOptions = {
      ...gridParams,
      filterModel: [
        ...gridParams.filterModel,
        {
          type: 'equals',
          filter: clientId,
          filterType: 'number',
          conditions: [],
          filterTo: null,
          key: 'clientId',
        }],
    };
    return this.api.post(`${this.endpoint}/list`, searchOptions);
  }

  public getElectionFormStatuses(): Observable<IdValue[]> {
    return this.api.get<IdValue[]>(`${this.endpoint}/statuses`);
  }

  public create(model: ClaimantElection, file: File): Observable<any> {
    return this.api.postWithFile(this.endpoint, model, file);
  }

  public update(model: ClaimantElection, file: File): Observable<any> {
    return this.api.putWithFile(`${this.endpoint}/${model.id}`, model, file);
  }

  public deleteDocument(docId: number): Observable<any> {
    return this.api.delete(`${this.endpoint}/deleteDocument/${docId}`);
  }

  public getElectionFormChangelog(id: number): Observable <any> {
    return this.api.get(`${this.endpoint}/changelog/${id}`);
  }

  public getProbateChangelog(probateId: number, gridParams: IServerSideGetRowsRequestExtended): Observable <any> {
    const searchOptions = {
      ...gridParams,
      filterModel: [
        ...gridParams.filterModel,
        {
          type: 'equals',
          filter: probateId,
          filterType: 'number',
          conditions: [],
          filterTo: null,
          key: 'id',
        }],
    };

    return this.api.post(`${this.probatesEndpoint}/changelog`, searchOptions);
  }
}
