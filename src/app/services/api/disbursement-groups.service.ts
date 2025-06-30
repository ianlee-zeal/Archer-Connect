import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BatchActionDto } from '@app/models/batch-action/batch-action';

import { DisbursementGroup } from '@app/models/disbursement-group';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class DisbursementGroupsService extends RestService<any> {
  endpoint = '/disbursement-groups';

  public getDisbursementGroupsForElectionFormCreation(clientId: number, electionFormId: number | null): Observable<DisbursementGroup[]> {
    let params = new HttpParams();
    params = params.append('electionFormId', electionFormId ? electionFormId.toString() : '');

    return this.api.get<DisbursementGroup[]>(`${this.endpoint}/${clientId}/election-form-groups`, params);
  }

  public validateByActionTemplateId(batchAction: BatchActionDto): Observable<any> {
    switch (batchAction.batchActionTemplateId) {
      case BatchActionTemplate.UpdateLedgerLienData:
        return this.api.post(`${this.endpoint}/update-ledger-with-lien-data-batch-action`, batchAction);
      case BatchActionTemplate.SyncProbateSpiWithLedger:
        return this.api.post(`${this.endpoint}/sync-probate-spi-with-ledger-batch-action`, batchAction);
      case BatchActionTemplate.DeleteDisbursementGroup:
        return this.api.post(`${this.endpoint}/delete`, batchAction);
      default: return null;
    }
  }
}
