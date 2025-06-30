import { Injectable } from '@angular/core';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Observable } from 'rxjs';

import { LedgerInfo } from '@app/models/closing-statement';
import { AuthorizeLedgersEntriesRequest } from '@app/models/ledger/authorize-ledger-entries-request';
import { LedgerEntryValidationData } from '@app/models/closing-statement/ledger-entry-validation-data';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class LedgersService extends RestService<any> {
  endpoint = '/ledgers';

  public getLedgerInfo(clientId: number, ledgerId: number): Observable<LedgerInfo> {
    return this.api.get(`${this.endpoint}/${clientId}/${ledgerId}`);
  }

  public updateLedgerInfo(ledgerId: number, ledgerInfo: LedgerInfo): Observable<LedgerInfo> {
    return this.api.put(`${this.endpoint}/${ledgerId}`, ledgerInfo);
  }

  public getLedgerEntryStatuses(): Observable<SelectOption[]> {
    return this.api.get<SelectOption[]>(`${this.endpoint}/ledger-entry-statuses`);
  }

  public authorizeLedgerEntries(request: AuthorizeLedgersEntriesRequest): Observable<LedgerInfo> {
    return this.api.put(`${this.endpoint}/authorize`, request);
  }

  public getLedgerEntryValidationData(caseId: number): Observable<LedgerEntryValidationData> {
    return this.api.get<LedgerEntryValidationData>(`${this.endpoint}/${caseId}/ledger-entry-validation-data`);
  }
}
