import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class AuditorService extends RestService<any> {
  endpoint = '/auditor';

  search(search = null): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/audit-run/search`, search);
  }

  public getTemplates(searchOptions: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/import-template/search`, searchOptions);
  }

  runAudit(auditRunCreationDto): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/audit-run/create`, auditRunCreationDto);
  }

  runAuditor(runAuditorCommand, approve: boolean): Observable<any> {
    let path = `${this.endpoint}/run-auditor`;
    if (approve) {
      path += '/approve';
    } else {
      path += '/preview';
    }
    return this.api.post<any>(`${path}`, runAuditorCommand);
  }

  getAuditResultsCounts(auditRunId: number): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/audit-result-preview/counts/${auditRunId}`);
  }

  getAuditResults(searchOptions: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/audit-result-preview/search`, searchOptions);
  }

  getAuditRunDetails(searchOptions: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/audit-run-details`, searchOptions);
  }

  public export(
    id: number,
    channelName: string,
  ): Observable<string> {
    return this.api.post(`${this.endpoint}/export/document/${id}`, {channelName: channelName});
  }
}
