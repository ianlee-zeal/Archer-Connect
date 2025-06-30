import { Injectable } from '@angular/core';
import { IdValue } from '@app/models';
import { IExportRequest } from '@app/models/export-request';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class DigitalPaymentService extends RestService<any> {
  endpointCases = '/cases';
  endpointPayments = '/payments';
  endpoint = '/digital-payment';

  getDigitalProviderStatuses(): Observable<IdValue[]> {
    return this.api.get<IdValue[]>(`${this.endpoint}/digitalProviderStatuses`);
  }

  public exportDigitalPayRoster(exportRequest: IExportRequest): Observable<string> {
    return this.api.post(`${this.endpointPayments}/export/digital-pay-roster`, exportRequest);
  }
}
