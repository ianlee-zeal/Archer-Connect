import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class CheckVerificationService extends RestService<any> {
  endpoint = '/check-verifications';

  public downloadAttachments(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/${id}/attachments`);
  }
}
