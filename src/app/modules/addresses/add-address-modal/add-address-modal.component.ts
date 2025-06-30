import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PermissionService, ServerErrorService, ToastService } from '@app/services';
import { MessageService } from '@app/services/message.service';
import { EntityAddress } from '@app/models/entity-address';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as fromShared from '../state';
import { Policy } from '../../auth/policy';
import { AddressFormComponent } from './address-form/address-form.component';

const { sharedActions, sharedSelectors } = fromShared;

@Component({
  selector: 'app-add-address-modal',
  templateUrl: './add-address-modal.component.html',
  styleUrls: ['./add-address-modal.component.scss'],
})
export class AddAddressModalComponent implements OnInit, OnDestroy {
  @ViewChild(AddressFormComponent)
  addressFormComponent: AddressFormComponent;

  protected ngUnsubscribe$ = new Subject<void>();

  public entityName: string;
  public entityId: number;
  public entityTypeId: number;
  public address: EntityAddress;
  public isPristineForm: boolean;
  public isFormValid: boolean;
  public canEdit: boolean;
  public deleteValidationMessageShow: boolean = false;
  public addressesDeletePermission: string;
  public canRunMoveCheck: boolean;
  public isPrimaryAddress: boolean;
  public showAddresseeAndAttnTo: boolean;

  private canEdit$ = this.store.select(sharedSelectors.addAddressModalSelectors.canEdit);

  public isPristineForm$ = this.store.select(sharedSelectors.addAddressModalSelectors.isPristineAddressForm);
  public isAddressFormValid$ = this.store.select(sharedSelectors.addAddressModalSelectors.isAddressFormValid);
  public updatedAddress$ = this.store.select(sharedSelectors.addAddressModalSelectors.address);
  public errorMessage$ = this.store.select(sharedSelectors.addressVerificationModalSelectors.error);

  public updatedAddress: EntityAddress;

  readonly awaitedSaveActionTypes = [
    sharedActions.addressVerificationActions.CloseModal.type,
    sharedActions.addressVerificationActions.ModalError.type,
  ];

  readonly awaitedVerifyActionTypes = [
    sharedActions.addressVerificationActions.VerifySuccess.type,
    sharedActions.addressVerificationActions.ModalError.type,
  ];

  readonly awaitedCheckActionTypes = [
    sharedActions.addressVerificationActions.MoveCheckAddressSuccess.type,
    sharedActions.addressVerificationActions.ModalError.type,
  ];

  public personAddressesEditPermission = PermissionService.create(PermissionTypeEnum.PersonAddresses, PermissionActionTypeEnum.Edit);
  protected readonly canViewAuditInfoPermission = PermissionService.create(PermissionTypeEnum.AuditInfo, PermissionActionTypeEnum.ClaimantAddress);

  constructor(
    private readonly store: Store<fromShared.AppState>,
    private readonly serverErrorService: ServerErrorService,
    private readonly modal: BsModalRef,
    private readonly messageService: MessageService,
    private readonly toaster: ToastService,
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.store.dispatch(sharedActions.addressVerificationActions.ClearError());
  }

  public ngOnInit(): void {
    this.store.dispatch(sharedActions.addressVerificationActions.LoadDefaultData());
    this.addressesDeletePermission = PermissionService.create(Policy.getAddresses(this.entityTypeId), PermissionActionTypeEnum.Delete);
    this.initSubscriptions();

    this.errorMessage$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter(error => !!error),
      )
      .subscribe(error => this.showAddressErrors(error));
  }

  private initSubscriptions() {
    this.isPristineForm$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(result => { this.isPristineForm = result; });

    this.canEdit$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(result => { this.canEdit = result; });

    this.updatedAddress$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(value => { this.updatedAddress = value; });

    this.isAddressFormValid$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(value => { this.isFormValid = value; });
  }

  public onCancel(): void {
    this.closeModal();
  }

  public onMoveCheck(): void {
    if (this.addressFormComponent.canEdit && !this.addressFormComponent.form.valid) {
      return;
    }

    this.store.dispatch(
      sharedActions.addressVerificationActions.AddressModalMoveCheckAddressRequest({
        close: this.closeModal.bind(this),
        entityName: this.entityName,
      }),
    );
  }

  public onVerify(): void {
    if (this.addressFormComponent.canEdit && !this.addressFormComponent.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }

    this.store.dispatch(
      sharedActions.addressVerificationActions.VerifyRequest({ close: this.closeModal.bind(this), entityName: this.entityName }),
    );
  }

  public onSave(): void {
    const address = EntityAddress.toDto(this.updatedAddress);
    const message: string = !address.id ? 'Saved' : 'Updated';

    if (!address.id) {
      this.store.dispatch(
        sharedActions.addressVerificationActions.SaveAddressRequest({ address, close: this.closeModal.bind(this), message }),
      );
    } else {
      this.store.dispatch(
        sharedActions.addressVerificationActions.UpdateAddressRequest({ address, close: this.closeModal.bind(this), message }),
      );
    }
  }

  protected closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }

    this.store.dispatch(sharedActions.addAddressActions.ResetAddress());
  }

  public onDelete(): void {
    if (this.address.isPrimary) {
      this.deleteValidationMessageShow = true;
      return;
    }

    this.messageService
      .showDeleteConfirmationDialog('Confirm delete', 'Are you sure you want to delete this address?')
      .subscribe(answer => {
        if (!answer) {
          return;
        }

        this.store.dispatch(sharedActions.addAddressActions.DeleteAddressRequest({ close: this.closeModal.bind(this) }));
      });
  }

  private showAddressErrors(error: any): void {
    if (typeof error === 'string') {
      this.toaster.showError(error);
      return;
    }

    if (this.canEdit) {
      this.serverErrorService.showServerErrors(this.addressFormComponent.form, { error });
    } else {
      const errorHeader = error.error;
      const errorText = error.errorMessages?.State[0]?.Content ?? '';
      this.toaster.showError(errorText, errorHeader);
    }
  }
}
