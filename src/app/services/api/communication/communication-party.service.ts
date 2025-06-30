import { Injectable } from '@angular/core';

import { RestService } from '../_rest.service';

@Injectable({ providedIn: 'root' })
export class CommunicationPartyTypeService extends RestService<any> {
  endpoint = '/communication-party-types';
}
