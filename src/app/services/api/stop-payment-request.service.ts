import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class StopPaymentRequestService extends RestService<any> {
  endpoint = '/stop-payment-requests';

  public getDropdownValues(): Observable<any> {
    return this.api.get<Observable<any>>(`${this.endpoint}/dropdown-values`);
  }

  public downloadAttachments(id: number, entityType: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/${id}/attachments/${entityType}`);
  }

  public updateStatusBatchAction(batchAction: FormData): Observable<any> {
    return this.api.postFormData(`${this.endpoint}/batch-actions/update-status`, batchAction);
  }
}
