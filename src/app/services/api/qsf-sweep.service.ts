import { Injectable } from '@angular/core';
import { IExportRequest } from '@app/models/export-request';
import { Page } from '@app/models/page';
import { QSFSweepBatch } from '@app/models/qsf-sweep/qsf-sweep-batch';
import { QSFSweepBatchResult } from '@app/models/qsf-sweep/qsf-sweep-batch-result';
import { QSFSweepCommitChangesRequest } from '@app/models/qsf-sweep/qsf-sweep-commit-changes-request';
import { QSFSweepCommitChangesResponse } from '@app/models/qsf-sweep/qsf-sweep-commit-changes-response';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class QsfSweepService extends RestService<any> {
  endpoint = '/qsf-sweep';

  public runQsfSweep(caseId: number): Observable<QSFSweepBatch> {
    return this.api.post<any>(`${this.endpoint}/start`, caseId);
  }

  public checkCaseSweepStatus(caseId: number): Observable<QSFSweepBatch> {
    return this.api.get(`${this.endpoint}/case/${caseId}/processing-sweep`);
  }

  public getByBatchId(batchId: number): Observable<QSFSweepBatch> {
    return this.api.get(`${this.endpoint}/batch/${batchId}`);
  }

  public searchBatch(caseId: number, params: IServerSideGetRowsRequestExtended): Observable<Page<QSFSweepBatch>> {
    return this.api.post<IServerSideGetRowsRequestExtended>(`${this.endpoint}/case/${caseId}/search`, params);
  }

  public searchBatchResult(batchId: number, params: IServerSideGetRowsRequestExtended): Observable<Page<QSFSweepBatchResult>> {
    return this.api.post<IServerSideGetRowsRequestExtended>(`${this.endpoint}/batch/${batchId}/search`, params);
  }

  public commitChanges(batchId: number, request: QSFSweepCommitChangesRequest): Observable<QSFSweepCommitChangesResponse> {
    return this.api.post<QSFSweepCommitChangesRequest>(`${this.endpoint}/commit-changes/${batchId}`, request);
  }

  public exportQSFSweepResultList(batchId: Number, exportRequest: IExportRequest): Observable<string> {
    return this.api.post(`${this.endpoint}/batch/${batchId}/export`, exportRequest);
  }

  public validateCommitChanges(batchId: number, request: QSFSweepCommitChangesRequest): Observable<QSFSweepCommitChangesResponse> {
    return this.api.post<QSFSweepCommitChangesRequest>(`${this.endpoint}/commit-changes/${batchId}/validate`, request);
  }
}
