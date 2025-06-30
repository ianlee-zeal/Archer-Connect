import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import * as Models from '@app/models';
import { BankAccount, IdValue, Org, ProjectOrganization } from '@app/models';

import { StringHelper } from '@app/helpers/string.helper';
import { FileHelper } from '@app/helpers/file.helper';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { OrgType } from '@app/models/enums/ledger-settings/org-type';
import { Page } from '@app/models/page';
import { RestService } from '../_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Injectable({ providedIn: 'root' })
export class OrgsService extends RestService<Models.Org> {
  endpoint = '/organizations';

  public getBankAccountList(orgId: number): Observable<BankAccount[]> {
    return this.api.get<BankAccount[]>(`${this.endpoint}/${orgId}/bank-accounts`);
  }

  public getBankAccountDropdownValues(orgId: number): Observable<IdValue[]> {
    return this.api.get<BankAccount[]>(`${this.endpoint}/${orgId}/bank-accounts-light`);
  }

  public getUserOrgBankAccounts(): Observable<IdValue[]> {
    return this.api.get<BankAccount[]>(`${this.endpoint}/bank-accounts-light`);
  }

  public setDefaultBankAccount(orgId: number, bankAccountId: number): Observable<any> {
    return this.api.put(`${this.endpoint}/${orgId}/bank-account/${bankAccountId}`, null);
  }

  public getListByCurrentUser(): Observable<Org[]> {
    return this.api.get<Org[]>(`${this.endpoint}/byCurrentUser`);
  }

  public getSubOrgList(orgId: number, searchParams: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/${orgId}/sub-organizations${StringHelper.queryString({ searchOptions: searchParams })}`);
  }

  public getSubOrgDropdownValues(orgId: number): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/${orgId}/sub-organizations-light`);
  }

  public getProjectFirmsOptions(projectId: number): Observable<IdValue[]> {
    const searchOptions: IServerSideGetRowsRequestExtended = {
      startRow: 0,
      endRow: -1,
      filterModel: [
        new FilterModel({
          filter: projectId,
          filterType: FilterTypes.Number,
          type: 'equals',
          key: 'caseIds',
        }),
        new FilterModel({
          filter: `${OrgType.LawFirm},${OrgType.PrimaryFirm},${OrgType.ReferringFirm},${OrgType.SettlementFirm}`,
          filterType: FilterTypes.Number,
          type: 'contains',
          key: 'primaryOrgType.id',
        }),
      ],
      sortModel: [{ sort: 'asc', colId: 'name' }],
      groupKeys: [],
      pivotCols: [],
      pivotMode: false,
      rowGroupCols: [],
      valueCols: [],
    };

    return this.api.post<any>(`${this.endpoint}/search-light`, searchOptions);
  }

  public searchFirms(params: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/search-firms`, params);
  }

  public searchOrganizations(params: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post(`${this.endpoint}/search`, params);
  }

  public getFirmsByProjectId(projectId: number): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/firms-by-project-light/${projectId}`);
  }

  public getBatchPaymentOptions(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/batch-payment-options`);
  }

  public getFrequencyOptions(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/frequency-options`);
  }

  public getByCaseId(projectId: number): Observable<Page<ProjectOrganization>> {
    return this.api.get<any>(`${this.endpoint}/byCaseId/${projectId}`);
  }

  public getByCaseIdWithTypes(projectId: number): Observable<Page<ProjectOrganization>> {
    return this.api.get<any>(`${this.endpoint}/byCaseIdWithTypes/${projectId}`);
  }

  public updateOrg(org: Org): Observable<any> {
    const formData = new FormData();

    const doc = org.paymentInstructionDoc;

    if (doc && doc.fileContent) {
      const extension = FileHelper.getExtension(doc.fileNameFull);
      doc.fileName = FileHelper.extractFileName(doc.fileNameFull, extension);
      doc.mimeType = { extension } as any;
      formData.append('file', doc.fileContent, doc.fileName);
    }

    formData.append('orgData', JSON.stringify(Org.toDto(org)));

    return this.api.putFormData(`${this.endpoint}/${org.id}`, formData);
  }

  public collectorsByIds(searchOptions: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/collectors/search`, searchOptions);
  }

  public getCollectorOrgsByCollectoIds(firmIds: number[]): Observable<IdValue[]> {
    return this.api.post<any>(`${this.endpoint}/collectors/searchByFirmIds`, firmIds);
  }

  public getOrganizationPaymentStatuses(projectId: number, orgId: number, searchOptions: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/org-payment-status`, { caseId: projectId, orgId, searchOptions });
  }

  public searchByName(name: string): Observable<any> {
    const encodedName = encodeURIComponent(name);

    return this.api.get<any>(`${this.endpoint}/search-by-name/${encodedName}`);
  }

  public export(name: string, channelName, searchOptions: IServerSideGetRowsRequestExtended): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      channelName,
    };
    return this.api.post(`${this.endpoint}/export`, requestParams);
  }

  public downloadDocument(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/export/${id}`);
  }

  public uploadW9File(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('files', file);

    return this.api.postFormData(`${this.endpoint}/validate`, formData);
  }

  public getOrganizationW9Settings(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/w9-settings`);
  }
}
