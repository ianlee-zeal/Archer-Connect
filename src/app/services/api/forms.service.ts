import { Injectable } from '@angular/core';

import { RestService } from './_rest.service';

@Injectable({
  providedIn: 'root'
})
export class FormsService extends RestService<any> {
  endpoint = '/forms'
}
