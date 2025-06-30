import { Injectable } from '@angular/core';
import { RestService } from './api/_rest.service';

@Injectable({ providedIn: 'root' })
export class DefaultGlobalSearchTypeService extends RestService<any> {
  endpoint = '/default-global-search-type';
}
