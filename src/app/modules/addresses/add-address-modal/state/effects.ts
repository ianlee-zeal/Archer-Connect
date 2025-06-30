import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { mergeMap, switchMap, catchError, withLatestFrom, tap } from 'rxjs/operators';

import * as services from '@app/services';
import { EntityAddress } from '@app/models/entity-address';
import * as addAddressActions from './actions';
import { addAddressModalSelectors } from './selectors';
import { AddAddressModalState } from './reducer';
import { AddAddressModalComponent } from '../add-address-modal.component';
import * as addressVerificationActions from '../address-verification-modal/state/actions';

@Injectable()
export class AddAddressModalEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AddAddressModalState>,
    private modalService: services.ModalService,
    private addressService: services.AddressService,
    private toastService: services.ToastService,
  ) {}


  openModal$ = createEffect(() => this.actions$.pipe(
    ofType(addAddressActions.OpenAddressModal),
    switchMap(action => {
      this.modalService.show(AddAddressModalComponent, {
        class: 'address-modal',
        initialState: {
          entityName: action.entityName,
          entityId: action.entityId,
          entityTypeId: action.entityTypeId,
          address: action.address || null,
          canRunMoveCheck: action.canRunMoveCheck,
          isPrimaryAddress: action.isPrimaryAddress,
          showAddresseeAndAttnTo: action.showAddresseeAndAttnTo || false
        },
      });

      if (!action.address) {
        return [];
      }

      return [addAddressActions.ChangeAddress({ address: action.address, isAddressFormValid: !action.canEdit, isPristineAddressForm: true })];
    }),
  ));


  closeModal$ = createEffect(() => this.actions$.pipe(
    ofType(addAddressActions.CloseAddressModal),
    mergeMap(action => {
      if (action.close != null) {
        action.close();
      }
      return [];
    }),
  ));


  deleteAddressRequest$ = createEffect(() => this.actions$.pipe(
    ofType(addAddressActions.DeleteAddressRequest),
    withLatestFrom(this.store.select(addAddressModalSelectors.address)),
    mergeMap(([action, address]) => this.addressService.delete(EntityAddress.toDto(address)).pipe(
      switchMap(() => [
        addAddressActions.CloseAddressModal({ close: action.close }),
        addAddressActions.DeleteAddressSuccess({ addressId: address.id }),
      ]),
      catchError(error => of(addressVerificationActions.ModalError({ errorMessage: error }))),
    )),
  ));


  deleteAddressSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(addAddressActions.DeleteAddressSuccess),
    tap(() => {
      this.toastService.showSuccess('Deleted');
    }),
  ), { dispatch: false });
}
