import { Injectable } from '@angular/core';

import { RestService } from '../_rest.service';

@Injectable({ providedIn: 'root' })
export class CommunicationResultService extends RestService<any> {
  endpoint = '/communication-results';
}
