import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { takeUntil, filter } from 'rxjs/operators';

import { Subject } from 'rxjs';
import { VerifiedAddress } from '@app/models/address';
import { EntityAddress } from '@app/models';
import * as paymentActions from '@app/modules/payments/state/actions';
import { WebAppLocation } from '@app/models/enums/web-app-location.enum';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as fromShared from '../../state';

const { sharedActions, sharedSelectors } = fromShared;

@Component({
  selector: 'app-address-verification-modal',
  templateUrl: './address-verification-modal.component.html',
  styleUrls: ['./address-verification-modal.component.scss'],
})
export class AddressVerificationModalComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe$ = new Subject<void>();

  // subscriptions passed to children components
  public originalAddress$ = this.store.select(sharedSelectors.addAddressModalSelectors.address);
  public originalAddress: EntityAddress;
  public verifiedAddress$ = this.store.select(sharedSelectors.addressVerificationModalSelectors.verifiedAddress);
  public verifiedAddress: VerifiedAddress;
  public moveCheckResults$ = this.store.select(sharedSelectors.addressVerificationModalSelectors.moveCheckResults);
  public showingMoveCheck: boolean;
  public includeName: boolean;
  private canEdit$ = this.store.select(sharedSelectors.addAddressModalSelectors.canEdit);
  public canEdit: boolean;
  public canRunMoveCheck: boolean;
  public webAppLocation: WebAppLocation;
  public errorMessage: string;
  public returnAddressOnSave: boolean;

  // subscriptions and variables used for in page control and display
  // should the page show the validation components? and/or the movecheck components?
  public showVerify$ = this.store.select(sharedSelectors.addressVerificationModalSelectors.showVerify);
  public showMoveCheck$ = this.store.select(sharedSelectors.addressVerificationModalSelectors.showMoveCheck);
  public showingVerify: boolean;

  // should the page allow to click 'Re Run'
  public runVerify$ = this.store.select(sharedSelectors.addressVerificationModalSelectors.runVerify);
  public runMoveCheck$ = this.store.select(sharedSelectors.addressVerificationModalSelectors.runMoveCheck);

  // should the code dispatch the re-validation and/or the re-movecheck?
  public runVerify: boolean;
  public runMoveCheck: boolean;

  // when code is saving changes to address, should save the validated or original address?
  private useVerifiedAddress: boolean;

  public errorMessage$ = this.store.select(sharedSelectors.addressVerificationModalSelectors.error);
  public closeParent: Function;
  public entityName: string;

  readonly awaitedSaveActionTypes = [
    sharedActions.addressVerificationActions.CloseModal.type,
    sharedActions.addressVerificationActions.ModalError.type,
  ];

  readonly awaitedCheckActionTypes = [
    sharedActions.addressVerificationActions.MoveCheckAddressSuccess.type,
    sharedActions.addressVerificationActions.VerifySuccess.type,
    sharedActions.addressVerificationActions.VerifyAddressSuccess.type,
    sharedActions.addressVerificationActions.ModalError.type,
  ];

  public personAddressesEditPermission = PermissionService.create(PermissionTypeEnum.PersonAddresses, PermissionActionTypeEnum.Edit);

  constructor(private modal: BsModalRef, private store: Store<fromShared.AppState>) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  ngOnInit(): void {
    this.initializeSubscriptions();
  }

  private initializeSubscriptions(): void {
    this.errorMessage$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(x => !!x),
    ).subscribe(error => {
      if (typeof error === 'string') {
        this.errorMessage = error;
      } else {
        this.errorMessage = error.errorMessages?.State[0]?.Content ?? '';
      }
    });

    this.store
      .select(sharedSelectors.addressVerificationModalSelectors.useVerifiedAddress)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(result => this.useVerifiedAddress = result);

    this.verifiedAddress$
      .pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(result => this.verifiedAddress = result);

    this.originalAddress$
      .pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(result => this.originalAddress = result);

    this.store
      .select(sharedSelectors.addressVerificationModalSelectors.verifyConfiguration)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(result => this.includeName = result.includeName);

    this.canEdit$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(result => this.canEdit = result);

    this.showVerify$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(result => this.showingVerify = result);

    this.showMoveCheck$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(result => this.showingMoveCheck = result);

    this.runVerify$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(result => this.runVerify = result);

    this.runMoveCheck$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(result => this.runMoveCheck = result);

    this.store.select(sharedSelectors.addAddressModalSelectors.canRunMoveCheck)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(value => { this.canRunMoveCheck = value; });
  }

  public onClose(): void {
    this.store.dispatch(sharedActions.addressVerificationActions.CloseModal({ close: this._closeModal.bind(this) }));
  }

  public onCloseBothModals(): void {
    this.store.dispatch(sharedActions.addressVerificationActions.CloseModal({ close: this._closeBothModals.bind(this) }));
  }

  public onSave(): void {
    if (this.showingVerify) {
      const address: any = this.getAddress();
      if (this.returnAddressOnSave) {
        if (this.closeParent) {
          this.closeParent(address);
          this._closeModal();
        }
      } else if (this.isSprLocation()) {
        const message: string = this.useVerifiedAddress ? 'Verified, Standardized and Saved' : 'Saved';
        this.store.dispatch(
          paymentActions.SaveAddressRequest({ address, close: this._closeModal.bind(this), message }),
        );
      } else if (this.originalAddress.id == 0) {
        const message: string = this.useVerifiedAddress ? 'Verified, Standardized and Saved' : 'Saved';
        this.store.dispatch(
          sharedActions.addressVerificationActions.SaveAddressRequest({ address, close: this._closeBothModals.bind(this), message }),
        );
      } else {
        const message: string = this.useVerifiedAddress ? 'Verified, Standardized and Updated' : 'Updated';
        this.store.dispatch(
          sharedActions.addressVerificationActions.UpdateAddressRequest({ address, close: this._closeBothModals.bind(this), message }),
        );
      }
    }
  }

  private getAddress(): any {
    let address: any;
    if (this.useVerifiedAddress) {
      address = EntityAddress.fromValidation(this.originalAddress, this.verifiedAddress);
    } else {
      address = EntityAddress.toDto(this.originalAddress);
    }

    return address;
  }

  public onVerify(): void {
    this.store.dispatch(sharedActions.addressVerificationActions.VerifyAddressRequest());
  }

  public onMoveCheck(): void {
    this.store.dispatch(sharedActions.addressVerificationActions.MoveCheckAddressRequest());
  }

  public isSprLocation() {
    return this.webAppLocation === WebAppLocation.SPR;
  }

  protected _closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }

  protected _closeBothModals(): void {
    this._closeModal();

    if (this.closeParent) {
      this.closeParent();
    }
  }
}
