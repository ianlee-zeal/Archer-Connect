import { Injectable } from '@angular/core';
import { RestService } from './api/_rest.service';

@Injectable({ providedIn: 'root' })
export class TimeZoneService extends RestService<any> {
  endpoint = '/timezone';
}
