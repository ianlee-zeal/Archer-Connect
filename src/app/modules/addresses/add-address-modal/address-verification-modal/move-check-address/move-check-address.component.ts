import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import * as actions from '../state/actions';
import { AddressVerificationModalState } from '../state/reducer';
import { AddressMoveCheckResult } from '@app/models/address';

@Component({
  selector: 'app-move-check-address',
  templateUrl: './move-check-address.component.html',
  styleUrls: ['./move-check-address.component.scss'],
})
export class MoveCheckAddressComponent {
  @Input() canEdit: boolean;
  @Input() moveCheckResults: AddressMoveCheckResult[] = [];

  constructor(private store: Store<AddressVerificationModalState>) {}

  public addAddress(address): void {
    if (this.canEdit) {
      this.store.dispatch(actions.SaveMoveCheckAddressRequest({ address: address }));
    }
  }
}
