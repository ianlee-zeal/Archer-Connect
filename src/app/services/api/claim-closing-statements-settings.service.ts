import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PayeeItem } from '@app/models/closing-statement/payee-item';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class ClaimClosingStatementSettingsService extends RestService<any> {
  closingStatementSettings = '/closing-statement-settings';

  public getPayeeList(ledgerId: number): Observable<PayeeItem[]> {
    return this.api.get(`${this.closingStatementSettings}/${ledgerId}`);
  }

  public postPayeeList(ledgerId: number, documentDeliveries: PayeeItem[]): Observable<any> {
    return this.api.post(`${this.closingStatementSettings}/${ledgerId}`, documentDeliveries);
  }
}
