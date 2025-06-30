import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddressMoveCheckRequest, AddressMoveCheckResult } from '@app/models/address';
import { RestService } from '../_rest.service';

@Injectable({ providedIn: 'root' })
export class AddressToolsService extends RestService<any> {
  endpoint = '/addresstools';

  public moveCheckAddress(address: AddressMoveCheckRequest): Observable<AddressMoveCheckResult[]> {
    return this.api.post(`${this.endpoint}/movecheck`, address);
  }

  public getDropdownValues(): Observable<any[]> {
    return this.api.get(`${this.endpoint}/dropdownvalues`);
  }
}
