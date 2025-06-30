import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { withLatestFrom, mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import * as services from '@app/services';
import { of } from 'rxjs';

import { EntityAddress } from '@app/models/entity-address';
import { ToastService } from '@app/services';
import { addressesListSelectors } from './selectors';
import { AddressesListState } from './reducer';
import * as addressesListActions from './actions';

@Injectable()
export class AddressesListEffects {
  constructor(
    private addressesService: services.AddressService,
    private store: Store<AddressesListState>,
    private actions$: Actions,
    private toaster: ToastService,
  ) { }


  getAddressesList$ = createEffect(() => this.actions$.pipe(
    ofType(addressesListActions.GetAddressesList),
    withLatestFrom(this.store.select(addressesListSelectors.entireState)),
    mergeMap(([_, entireState]) => this.addressesService.index({ ...entireState.searchParams })
      .pipe(
        switchMap(response => {
          const addresses = response.map(item => EntityAddress.toModel(item));
          return [addressesListActions.GetAddressesListComplete({ addresses }),
          ];
        }),
        catchError(error => of(addressesListActions.GetAddressesListError({ errorMessage: error }))),
      )),
  ));


  refreshAddressesList$ = createEffect(() => this.actions$.pipe(
    ofType(addressesListActions.RefreshAddressesList),
    withLatestFrom(this.store.select(addressesListSelectors.entireState)),
    switchMap(([, entireState]) => [
      addressesListActions.GetAddressesList({ searchParams: entireState.searchParams }),
      addressesListActions.RefreshAddressesListComplete(),
    ]),
  ));



  getAGAddressesListError$ = createEffect(() => this.actions$.pipe(
    ofType(addressesListActions.GetAddressesListError),
    tap(action => {
      console.error(action.errorMessage); // eslint-disable-line no-console
    }),
  ), { dispatch: false });


  setPrimaryAddress$ = createEffect(() => this.actions$.pipe(
    ofType(addressesListActions.SetPrimaryAddress),
    mergeMap(action => of(action).pipe(
      withLatestFrom(
        this.store.pipe(select(addressesListSelectors.address, { id: action.addressId })),
      ),
    )),
    switchMap(([, address]) => [
      addressesListActions.UpdateAddressDetails({ addressId: address.id, address: { ...address, isPrimary: true } }),
    ]),
  ));


  updateAddressDetails$ = createEffect(() => this.actions$.pipe(
    ofType(addressesListActions.UpdateAddressDetails),
    mergeMap(action => this.addressesService.updateAddress(action.addressId, EntityAddress.toDto(action.address)).pipe(
      switchMap(() => [
        addressesListActions.UpdateAddressComplete(),
        addressesListActions.RefreshAddressesList(),
      ]),
      catchError(error => of(addressesListActions.Error({ errorMessage: error }))),
    )),
  ));


  setPrimaryAddressSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(addressesListActions.UpdateAddressComplete),
    tap(() => this.toaster.showSuccess('Primary was updated')),
  ), { dispatch: false });
}
