import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { BankAccountSettings } from '@app/models/bank-account-settings';
import { BankAccount } from '@app/models';

@Injectable({ providedIn: 'root' })
export class BankAccountService extends RestService<any> {
  endpoint = '/bank-accounts';

  public createBankAccount(bankAccount: any, file: File) : Observable<any> {
    return this.api.postWithFile(this.endpoint, bankAccount, file);
  }

  public updateBankAccount(bankAccountId: number, bankAccount: any, file: File): Observable<any> {
    return this.api.postWithFile(`${this.endpoint}/${bankAccountId}`, bankAccount, file, true);
  }

  public updateBankAccountField(bankAccountId: number, fieldName:string, value: string): Observable<any> {
    return this.api.put(`${this.endpoint}/${bankAccountId}/field/${fieldName}`, value);
  }

  public getAccountNumber(bankAccountId: number): Observable<string> {
    return this.api.get(`${this.endpoint}/${bankAccountId}/number`);
  }

  public getFfcAccount(bankAccountId: number): Observable<string> {
    return this.api.get(`${this.endpoint}/${bankAccountId}/fcc-account`);
  }

  public approveBankAccount(bankAccountId: number): Observable<any> {
    return this.api.put(`${this.endpoint}/${bankAccountId}/approve`, null);
  }

  public rejectBankAccount(bankAccountId: number): Observable<any> {
    return this.api.put(`${this.endpoint}/${bankAccountId}/reject`, null);
  }

  public getBankAccountSettings(orgId: number): Observable<BankAccountSettings> {
    return this.api.get<Observable<BankAccountSettings>>(`${this.endpoint}/${orgId}/settings`);
  }

  public getListByOrgIds(orgIds: number[]): Observable<BankAccount[]> {
    return this.api.post(`${this.endpoint}/get-list-by-org-ids`, orgIds);
  }
}
