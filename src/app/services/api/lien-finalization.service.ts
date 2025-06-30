import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateLienFinalization, RunLienFinalization } from '@app/models/lien-finalization/lien-finalization-run-creation';
import { LienFinalizationDetail } from '@app/models/lien-finalization/lien-finalization-detail';
import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';
import { RestService } from './_rest.service';
import { IdValue } from '@app/models/idValue';
import { AGResponse } from '@app/models';

@Injectable({ providedIn: 'root' })
export class LienFinalizationService extends RestService<any> {
  endpoint = '/lien-finalization/batch';
  lienTypesEndpoint = '/lien-types';
  liensEndpoint = '/liens';

  search(search = null): Observable<any> {
    return this.api.post(`${this.endpoint}/search`, search);
  }

  detailsGrid(search = null): Observable<AGResponse<LienFinalizationDetail>> {
    return this.api.post(`${this.endpoint}/details/search`, search);
  }

  createLienFinalization(lienFinalizationRunCreation: CreateLienFinalization): Observable<LienFinalizationRun> {
    return this.api.post(`${this.endpoint}/create`, lienFinalizationRunCreation);
  }

  runAcceptance(batchId: number, lienFinalizationRunCreation: RunLienFinalization): Observable<LienFinalizationRun> {
    return this.api.post(`${this.endpoint}/${batchId}/acceptance`, lienFinalizationRunCreation);
  }

  runLienFinalization(batchId:number, lienFinalizationRunCreation: RunLienFinalization): Observable<LienFinalizationRun> {
    return this.api.post(`${this.endpoint}/${batchId}/finalization`, lienFinalizationRunCreation);
  }

  readyLienFinalizationRun(batchId:number, lienFinalizationRun: RunLienFinalization): Observable<LienFinalizationRun> {
    return this.api.post(`${this.endpoint}/${batchId}/preparation`, lienFinalizationRun);
  }

  selectLien(id: number, status: boolean): Observable<void> {
    return this.api.put(`${this.endpoint}/details/${id}`, { selected: status });
  }

  acceptLien(id: number, status: boolean): Observable<void> {
    return this.api.put(`${this.endpoint}/details/${id}/output`, { accepted: status });
  }

  getLienTypes(): Observable<IdValue[]> {
    return this.api.get(`${this.lienTypesEndpoint}`);
  }

  getPlanTypes(): Observable<IdValue[]> {
    return this.api.get(`${this.liensEndpoint}/plan-types`);
  }

  cancelRun(id: number): Observable<void> {
    return this.api.put(`${this.endpoint}/${id}/cancel`, id);
  }

  completeRun(id: number): Observable<void> {
    return this.api.post(`${this.endpoint}/${id}/completion`, { runId: id });
  }
}
