import { Injectable } from '@angular/core';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class InjuryService extends RestService<any> {
  endpoint = '/injury-events';
}
