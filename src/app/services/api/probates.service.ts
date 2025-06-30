import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProbateDetails } from '@app/models/probate-details';
import { ColumnExport, PacketRequest } from '@app/models';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { switchMap, map } from 'rxjs/operators';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class ProbatesService extends RestService<ProbateDetails> {
  endpoint = '/probates';
  casesEndpoint = '/cases/probates';

  public getProbateDetails(probateId: number): Observable<ProbateDetails> {
    return this.api.get(`${this.endpoint}/${probateId}`);
  }

  public getProbateDetailsByClientId(clientId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/byClientId/${clientId}`);
  }

  public updateProbateDetails(probateDetails: any): Observable<any> {
    if (probateDetails.packetRequests) {
      probateDetails.packetRequests = probateDetails.packetRequests.map((item: PacketRequest) => ({
        ...item,
        id: item.id < 0 ? 0 : item.id,
      }));
    }
    return this.api.put(`${this.endpoint}/${probateDetails.id}`, probateDetails);
  }

  public updateProbatePacketRequests(probateId: number, packetRequests: PacketRequest[]): Observable<any> {//
    let packetRequestsUpdated = [];
    if (packetRequests) {
      packetRequestsUpdated = packetRequests.map((item: PacketRequest) => ({
        ...item,
        id: item.id < 0 ? 0 : item.id,
      }));
    }
    return this.getProbateDetails(probateId).pipe(
      map(details => ProbateDetails.toModel(details)),
      map(detailsModel => ({ ...detailsModel, packetRequests: packetRequestsUpdated })),
      map(detailsModel => ProbateDetails.toDto(detailsModel)),
      switchMap(detailsDto => this.updateProbateDetails(detailsDto).pipe(
        map(details => details.packetRequests),
      )),
    );
  }

  public export(name: string, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(`${this.endpoint}/export`, requestParams);
  }

  public generateFirmUpdate(name: string, columns: ColumnExport[], channelName: string, projectId: number): Observable<string> {
    const requestParams = {
      name,
      columns,
      channelName,
      projectId,
    };
    return this.api.post(`${this.endpoint}/primaryFirmExport`, requestParams);
  }

  public downloadDocument(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/export/${id}`);
  }

  public getProjectNamesWithProbates(searchTerm: string = ''): Observable<SelectOption[]> {
    return this.api.get(`${this.casesEndpoint}/project-names?searchTerm=${searchTerm}`);
  }

  public getProjectCodesWithProbates(searchTerm: string = ''): Observable<string[]> {
    return this.api.get(`${this.casesEndpoint}/project-codes?searchTerm=${searchTerm}`);
  }
}
