import { Injectable } from '@angular/core';

import { RestService } from './_rest.service';

@Injectable({
  providedIn: 'root'
})
export class LiensService extends RestService<any> {
  endpoint = '/liens';
}
