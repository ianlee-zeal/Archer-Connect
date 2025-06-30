import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { RestService } from '../_rest.service';
import { TransferOrgs } from '@app/models/transfer-orgs';

@Injectable({ providedIn: 'root' })
export class OrganizationPaymentInstructionService extends RestService<any> {
  endpoint = '/org-payment-instruction';

  public getPaymentPreferencesList(orgId: number, params: IServerSideGetRowsRequestExtended): Observable<any> {
    const searchOptions = new FilterModel({
      type: 'equals',
      filter: orgId,
      filterType: 'number',
      conditions: [],
      key: 'orgId',
    });
    params.filterModel.push(searchOptions);

    return this.api.post<any>(`${this.endpoint}/search`, params);
  }

  public getTransferOrgsForClaimant(clientId: number): Observable<TransferOrgs> {
    return this.api.get(`${this.endpoint}/transfer-orgs/${clientId}`);
  }

  public getGlobalTransferOrgs(): Observable<TransferOrgs> {
    return this.api.get(`${this.endpoint}/global-transfer-orgs`);
  }
}
