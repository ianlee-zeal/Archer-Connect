import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ChartOfAccountProjectConfig, ChartOfAccountDisbursementMode, ChartOfAccountMode } from '@app/models/projects';

import { Page } from '@app/models/page';
import { ChartOfAccountSettings } from '@app/models/closing-statement/chart-of-account-settings';
import { IdValue } from '@app/models';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class ChartOfAccountsService extends RestService<any> {
  chartOfAccounts = '/chart-of-accounts';
  chartOfAccountModes = '/chart-of-account-mode';

  public getChartOfAccounts(projectId: number): Observable<ChartOfAccountProjectConfig[]> {
    return this.api.get(`${this.chartOfAccounts}/${projectId}`);
  }

  public getChartOfAccountsSettings(projectId: number): Observable<ChartOfAccountSettings[]> {
    return this.api.get(`${this.chartOfAccounts}/${projectId}/settings`);
  }

  public getUsedChartOfAccountsNos(projectId: number): Observable<string[]> {
    return this.api.get(`${this.chartOfAccounts}/${projectId}/used-account-numbers`);
  }

  public updateChartOfAccounts(projectId: number, data: ChartOfAccountProjectConfig[]): Observable<Page<any>> {
    return this.api.put(`${this.chartOfAccounts}/${projectId}`, data.map((config: ChartOfAccountProjectConfig) => ChartOfAccountProjectConfig.toDto(config)));
  }

  public getChartOfAccountDisbursementModes(): Observable<ChartOfAccountDisbursementMode[]> {
    return this.api.get(`${this.chartOfAccounts}/disbursement-mode`);
  }

  public getChartOfAccountModes(chartOfAccountId: number): Observable<ChartOfAccountMode[]> {
    if (chartOfAccountId !== undefined) {
      return this.getChartOfAccountModesById(chartOfAccountId);
    }
    return this.api.get(this.chartOfAccountModes);
  }

  public getChartOfAccountModesById(chartOfAccountId: number): Observable<ChartOfAccountMode[]> {
    return this.api.get(`${this.chartOfAccountModes}/${chartOfAccountId}`);
  }

  public getChartOfAccountsLight(search = null): Observable<IdValue[]> {
    return this.api.post(`/lpm${this.chartOfAccounts}/light`, search);
  }

  public getChartOfAccountGroupNumbers(): Observable<SelectOption[]> {
    return this.api.get<SelectOption[]>(`${this.chartOfAccounts}/chart-of-account-group-numbers`);
  }

  public getGetChartOfAccountNumbers(): Observable<SelectOption[]> {
    return this.api.get<SelectOption[]>(`${this.chartOfAccounts}/chart-of-account-numbers`);
  }
}
