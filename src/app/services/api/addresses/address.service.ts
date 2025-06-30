import { Injectable } from '@angular/core';
import { Address, AddressVerificationRequest, VerifiedAddress } from '@app/models/address';
import { AddressesListResponse } from '@app/modules/addresses/address-list/state/actions';
import { EntityPair } from '@app/modules/shared/_interfaces';
import { Observable } from 'rxjs';

import { RestService } from '../_rest.service';

@Injectable({ providedIn: 'root' })
export class AddressService extends RestService<any> {
  endpoint = '/addresses';

  public getAddress(addressId: number): Observable<any> {
    return this.get(addressId);
  }

  public saveAddress(address): Observable<any> {
    return this.post(address);
  }

  public updateAddress(addressId: number, address: any): Observable<any> {
    return this.api.put(`${this.endpoint}/${addressId}`, address);
  }

  public delete(address: any): Observable<any> {
    return this.api.delete(this.endpoint, address);
  }

  public deleteAll(addresses: any[]): Observable<any> {
    return this.api.delete(`${this.endpoint}/bulk`, addresses);
  }

  public validateAddress(address: AddressVerificationRequest): Observable<VerifiedAddress> {
    return this.api.post(`${this.endpoint}/validate`, address);
  }

  public searchByEntity(entityPairs: EntityPair[]): Observable<AddressesListResponse[]> {
    return this.api.post(`${this.endpoint}/entity-search`, { entityPairs });
  }

  public getDefaultPaymentAddressDropdownValues(orgId: number, entityType: number): Observable<Address[]> {
    return this.api.get<Address[]>(`${this.endpoint}?entityId=${orgId}&entityType=${entityType}`);
  }
}
