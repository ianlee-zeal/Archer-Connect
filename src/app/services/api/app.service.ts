import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './_api.service';

@Injectable({ providedIn: 'root' })
export class AppService{
  constructor(private api: ApiService) { }

  getDropdownValues(): Observable<any[]> {
    return this.api.get(`/dropdownvalues`)
  }

}