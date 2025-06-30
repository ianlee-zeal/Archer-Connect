import { filter, takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { PermissionService } from '@app/services';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { IdValue } from '@app/models';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import { HoldType } from '@app/models/hold-type';
import { ofType } from '@ngrx/effects';
import { ClientPaymentHold, IRemovePaymentFromHoldRequest } from '@app/models/client-payment-hold';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as claimantDetailsStore from '../state/reducer';
import * as claimantDetailsSelectors from '../state/selectors';
import * as claimantDetailsActions from '../state/actions';

@Component({
  selector: 'app-hold-payments-modal',
  templateUrl: './hold-payments-modal.component.html',
  styleUrls: ['./hold-payments-modal.component.scss'],
})
export class HoldPaymentsModalComponent extends ValidationForm implements OnInit, OnDestroy {
  public clientId: number;
  public clientPaymentHold: ClientPaymentHold;
  private holdTypes: HoldType[];
  public holdTypesList: IdValue[] = [];
  public reasonsList: IdValue[] = [];
  public holdTypes$ = this.store.select(claimantDetailsSelectors.holdTypes);
  public error$ = this.store.select(claimantDetailsSelectors.error);
  public ngDestroyed$ = new Subject<void>();

  // This is necessary to store the values from description field and make them independent from each other.
  public removeFromHoldDescription: string;
  public putOrUpdateHoldDescription: string;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }
  public get isRemoveAction() {
    return this.form.get('action').value === 'remove';
  }

  private get holdType() {
    return this.form.get('holdTypeId');
  }

  private get description() {
    return this.form.get('description');
  }

  private get action() {
    return this.form.get('action');
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    action: new UntypedFormControl('update'),
    holdTypeId: new UntypedFormControl(null, Validators.required),
    holdTypeReasonId: new UntypedFormControl(null, Validators.required),
    followUpDate: new UntypedFormControl(null, this.dateValidator.valid),
    description: new UntypedFormControl(null, Validators.maxLength(255)),
  });

  public readonly awaitedActionTypes = [
    claimantDetailsActions.PutOrUpdateClaimantHoldSuccess.type,
    claimantDetailsActions.RemoveClaimantFromHoldSuccess.type,
    claimantDetailsActions.Error.type,
    FormInvalid.type,
  ];

  constructor(
    private store: Store<claimantDetailsStore.ClaimantDetailsState>,
    public modal: BsModalRef,
    private dateValidator: DateValidator,
    private actionsSubj: ActionsSubject,
    private permissionService: PermissionService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.store.dispatch(claimantDetailsActions.GetHoldTypes());

    this.holdTypes$
      .pipe(filter(x => !!x),
        takeUntil(this.ngDestroyed$))
      .subscribe(holdTypes => {
        this.holdTypes = holdTypes;
        this.holdTypesList = holdTypes.map(type => (new IdValue(type.id, type.name)));
        this.initForm();
      });

    this.actionsSubj.pipe(
      takeUntil(this.ngDestroyed$),
      ofType(
        claimantDetailsActions.PutOrUpdateClaimantHoldSuccess,
        claimantDetailsActions.RemoveClaimantFromHoldSuccess,
      ),
    ).subscribe(() => { this.onCancel(); });

    this.holdType.valueChanges.subscribe(value => this.setReasonsList(value));

    this.description.valueChanges.subscribe(value => {
      if (this.isRemoveAction) {
        this.removeFromHoldDescription = value;
      } else {
        this.putOrUpdateHoldDescription = value;
      }
    });

    const deletePermission = PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.ClaimantRemoveFromHold);
    if (this.permissionService.has(deletePermission)) {
      this.action.valueChanges.subscribe(() => this.onActionChanged());
    } else {
      this.action.disable();
    }
  }

  private setReasonsList(id: number) {
    if (id && this.holdTypes) {
      const holdTypeReasons = this.holdTypes.find(type => type.id === id).holdTypeReasons;
      this.reasonsList = [...holdTypeReasons];
    }
  }

  private initForm() {
    if (this.clientPaymentHold) {
      this.form.patchValue({
        holdTypeId: this.clientPaymentHold.holdTypeId,
        holdTypeReasonId: this.clientPaymentHold.holdTypeReasonId,
        followUpDate: this.clientPaymentHold?.followUpDate,
        description: this.clientPaymentHold?.description,
      });
    } else {
      this.action.disable();
    }
  }

  private onActionChanged() {
    if (this.isRemoveAction) {
      this.holdType.disable();
      this.form.controls.description.patchValue(this.removeFromHoldDescription);
    } else {
      this.holdType.enable();
      this.form.controls.description.patchValue(this.putOrUpdateHoldDescription || this.clientPaymentHold?.description);
    }
  }

  public submit(): void {
    if (this.isRemoveAction) {
      const removeFromHoldData: IRemovePaymentFromHoldRequest = {
        clientPaymentHoldId: this.clientPaymentHold.id,
        description: this.form.controls.description.value,
      };
      this.removeClaimantFromHold(removeFromHoldData);
    } else {
      const hold: ClientPaymentHold = new ClientPaymentHold({
        ...this.form.getRawValue(),
        clientId: this.clientId,
        id: this.clientPaymentHold?.id,
      });

      this.store.dispatch(claimantDetailsActions.PutOrUpdateClaimantHold({ clientPaymentHold: hold }));
    }
  }

  public isDisabled() {
    return !this.form.dirty || !this.form.valid || !this.holdType.value;
  }

  private removeClaimantFromHold(removeFromHoldData: IRemovePaymentFromHoldRequest) {
    this.store.dispatch(claimantDetailsActions.RemoveClaimantFromHold({ removeFromHoldData }));
  }

  public onCancel(): void {
    this.modal.hide();
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
