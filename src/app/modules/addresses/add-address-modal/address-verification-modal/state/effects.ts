import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, forkJoin } from 'rxjs';
import { mergeMap, switchMap, catchError, withLatestFrom, tap } from 'rxjs/operators';

import { AddressVerificationRequest, AddressMoveCheckRequest, RecipientAddress } from '@app/models/address';
import { ModalService, AddressService, AddressToolsService, ToastService } from '@app/services';
import * as addressVerificationActions from './actions';
import { RefreshAddressesList } from '../../../address-list/state/actions';
import { addressVerificationModalSelectors } from './selectors';
import { addAddressModalSelectors } from '../../state/selectors';
import { AddressVerificationModalState } from './reducer';
import { AddressVerificationModalComponent } from '../address-verification-modal.component';
import { AddAddressModalState } from '../../state/reducer';

@Injectable()
export class AddressVerificationModalEffects {
  constructor(
    private actions$: Actions,
    private addAddressStore: Store<AddAddressModalState>,
    private addressVerificationStore: Store<AddressVerificationModalState>,
    private modalService: ModalService,
    private addressService: AddressService,
    private addressToolsService: AddressToolsService,
    private toastService: ToastService,
  ) {}

  // #region Load default values, messaging

  loadDefaultData$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.LoadDefaultData),
    mergeMap(() => forkJoin(this.addressToolsService.getDropdownValues()).pipe(
      switchMap(data => [addressVerificationActions.LoadDefaultDataComplete({ data })]),
      catchError(error => of(addressVerificationActions.ModalError({ errorMessage: error }))),
    )),
  ));
  // #endregion

  // #region Open and Close Modal

  openModal$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.OpenModal),
    tap(action => {
      this.modalService.show(AddressVerificationModalComponent, {
        class: 'address-verification-modal',
        initialState: {
          entityName: action.entityName,
          closeParent: action.close,
          webAppLocation: action.webAppLocation,
          returnAddressOnSave: action.returnAddressOnSave,
        },
        animated: false,
      });
    }),
  ), { dispatch: false });

  closeModal$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.CloseModal),
    tap(action => {
      if (action.close != null) {
        action.close();
      }
    }),
  ), { dispatch: false });
  // #endregion

  // #region Save and Update operations

  saveAddressRequest$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.SaveAddressRequest),
    mergeMap(action => this.addressService.saveAddress(action.address).pipe(
      switchMap(() => [
        RefreshAddressesList(),
        addressVerificationActions.CloseModal({ close: action.close }),
        addressVerificationActions.SaveAddressSuccess({ message: action.message }),
      ]),
      catchError(error => of(addressVerificationActions.ModalError({ errorMessage: error }))),
    )),
  ));

  saveAddressSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.SaveAddressSuccess),
    tap(action => {
      this.toastService.showSuccess(action.message);
    }),
  ), { dispatch: false });

  updateAddressRequest$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.UpdateAddressRequest),
    mergeMap(action => this.addressService.updateAddress(action.address.id, action.address).pipe(
      switchMap(() => [
        RefreshAddressesList(),
        addressVerificationActions.CloseModal({ close: action.close }),
        addressVerificationActions.UpdateAddressSuccess({ message: action.message }),
      ]),
      catchError(error => of(addressVerificationActions.ModalError({ errorMessage: error }))),
    )),
  ));

  updateAddressSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.UpdateAddressSuccess),
    tap(action => {
      this.toastService.showSuccess(action.message);
    }),
  ), { dispatch: false });
  // #endregion

  // #region Validation
  // Validation from Address Modal

  verifyRequest$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.VerifyRequest),
    withLatestFrom(
      this.addAddressStore.select(addAddressModalSelectors.address),
      this.addressVerificationStore.select(addressVerificationModalSelectors.verifyConfiguration),
    ),
    mergeMap(([action, address, config]) => this.addressService.validateAddress(AddressVerificationRequest.toDto(address, config)).pipe(
      switchMap(result => [
        addressVerificationActions.VerifySuccess({
          close: action.close,
          address,
          verifiedAddress: result,
          entityName: action.entityName,
        }),
      ]),
      catchError(error => of(addressVerificationActions.ModalError({ errorMessage: error }))),
    )),
  ));

  verifySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.VerifySuccess),
    switchMap(action => [
      addressVerificationActions.OpenModal({ close: action.close, entityName: action.entityName }),
      addressVerificationActions.VerifyAddressSuccess({ verifiedAddress: action.verifiedAddress }),
    ]),
  ));

  // Validation from Address Verification Modal

  verifyAddressRequest$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.VerifyAddressRequest),
    withLatestFrom(
      this.addAddressStore.select(addAddressModalSelectors.address),
      this.addressVerificationStore.select(addressVerificationModalSelectors.verifyConfiguration),
    ),
    mergeMap(([, address, config]) => this.addressService.validateAddress(AddressVerificationRequest.toDto(address, config)).pipe(
      switchMap(result => [
        addressVerificationActions.VerifyAddressSuccess({ verifiedAddress: result }),
      ]),
      catchError(error => of(addressVerificationActions.ModalError({ errorMessage: error }))),
    )),
  ));

  verifyAddressSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.VerifyAddressSuccess),
    tap(() => {
      this.toastService.showSuccess('Verify Completed');
    }),
  ), { dispatch: false });
  // #endregion

  // #region MoveCheck Address

  addressModalMoveCheckAddressRequest$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.AddressModalMoveCheckAddressRequest),
    withLatestFrom(
      this.addAddressStore.select(addAddressModalSelectors.address),
      this.addressVerificationStore.select(addressVerificationModalSelectors.moveCheckConfiguration),
    ),
    mergeMap(([action, address, config]) => this.addressToolsService.moveCheckAddress(AddressMoveCheckRequest.toDto(address, config)).pipe(
      switchMap(moveCheckResults => [
        addressVerificationActions.OpenModal({ close: action.close, entityName: action.entityName }),
        addressVerificationActions.MoveCheckAddressSuccess({ moveCheckResults }),
      ]),
      catchError(error => of(addressVerificationActions.ModalError({ errorMessage: error }))),
    )),
  ));

  moveCheckAddressRequest$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.MoveCheckAddressRequest),
    withLatestFrom(
      this.addAddressStore.select(addAddressModalSelectors.address),
      this.addressVerificationStore.select(addressVerificationModalSelectors.moveCheckConfiguration),
    ),
    mergeMap(([, address, config]) => this.addressToolsService.moveCheckAddress(AddressMoveCheckRequest.toDto(address, config)).pipe(
      switchMap(moveCheckResults => [
        addressVerificationActions.MoveCheckAddressSuccess({ moveCheckResults }),
      ]),
      catchError(error => of(addressVerificationActions.ModalError({ errorMessage: error }))),
    )),
  ));

  moveCheckAddressSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.MoveCheckAddressSuccess),
    tap(() => {
      this.toastService.showSuccess('Move Check Completed');
    }),
  ), { dispatch: false });

  saveMoveCheckAddressRequest$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.SaveMoveCheckAddressRequest),
    withLatestFrom(this.addAddressStore.select(addAddressModalSelectors.address)),
    mergeMap(([action, address]) => this.addressService.saveAddress(RecipientAddress.fromMoveCheck(address, action.address)).pipe(
      switchMap(() => [RefreshAddressesList(), addressVerificationActions.SaveMoveCheckAddressSuccess()]),
      catchError(error => of(addressVerificationActions.ModalError({ errorMessage: error }))),
    )),
  ));

  saveMoveCheckAddressSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(addressVerificationActions.SaveMoveCheckAddressSuccess),
    tap(() => {
      this.toastService.showSuccess('Saved');
    }),
  ), { dispatch: false });
  // #endregion
}
