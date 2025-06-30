import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DropdownHelper } from '@app/helpers/dropdown.helper';
import { Address, ClaimantElection, Email, EntityAddress } from '@app/models';
import { ElectionFormFormatReceivedType, ElectionPaymentMethod, EntityTypeEnum, PaymentMethodEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import { Subject } from 'rxjs';
import { ActionsSubject, Store } from '@ngrx/store';
import * as fromRoot from '@app/state';
import { filter, takeUntil } from 'rxjs/operators';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ofType } from '@ngrx/effects';
import { ElectionFormModalService } from '@app/services/election-form-modal.service';
import { sharedSelectors, sharedActions } from 'src/app/modules/shared/state/index';
import { PermissionService, ServerErrorService, ToastService, ValidationService } from '@app/services';
import { saveAs } from 'file-saver';
import isString from 'lodash-es/isString';
import { ElectionFormTotalCalculatorService } from '@app/services/election-form-total-calculator.service';
import { ApiErrorResponse } from '@app/models/api-error-response';
import { ElectionFormStatus } from '@app/models/enums/election-form-status';
import * as rootActions from '@app/state/root.actions';
import { DisbursementGroup } from '@app/models/disbursement-group';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { Claimant } from '@app/models/claimant';
import { AddressStatus } from '@app/models/enums/election-form-address-status.enum';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings';
import * as actions from '../../../state/actions';
import * as selectors from '../../../state/selectors';

@Component({
  selector: 'app-edit-election-form-modal',
  templateUrl: './edit-election-form-modal.component.html',
  styleUrls: ['./edit-election-form-modal.component.scss'],
})
export class EditElectionFormModalComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  public title: string;
  public electionFormId: number;
  public allowedExtensions: string[] = [];
  public existingElectionForm: ClaimantElection;
  public electionPaymentMethod = ElectionPaymentMethod;
  public paymentMethod = PaymentMethodEnum;
  public selectedFile: File;
  private currentClientId: number;
  private currentClientFullname: string;
  public todaysDate: Date = new Date();
  public dropdownComparator = DropdownHelper.compareOptions;
  public isAddressRequired: boolean;
  public personAddress: Address;
  public addressStatus = AddressStatus;
  public netAllocation: number;
  private disbursementGroups: DisbursementGroup[];
  public isCheckPaymentMethodDisabled: boolean = true;
  public isDigitalPaymentMethodDisabled: boolean = true;
  public ledgerSettings: ClaimSettlementLedgerSettings;
  public primaryEmail: Email;

  public allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);
  public addresses$ = this.store.select(sharedSelectors.addressesListSelectors.addressesList);
  public documentChannels$ = this.store.select(fromRoot.documentChannelsDropdownValues);
  public countries$ = this.store.select(fromRoot.countriesDropdownValues);
  public addressTypesDropdownValues$ = this.store.select(fromRoot.addressTypesDropdownValues);
  public electionFormStatuses$ = this.store.select(fromRoot.electionFormStatusOptions);
  public electionForm$ = this.store.select(selectors.electionForm);
  public item$ = this.store.select(selectors.item);
  public ledgerSettings$ = this.store.select(projectSelectors.ledgerSettings);
  public primaryEmail$ = this.store.select(sharedSelectors.emailSelectors.primaryEmail);

  public availableDisbursementGroupsForElectionForm$ = this.store.select(selectors.availableDisbursementGroupsForElectionForm);

  public electionFormFormatReceivedTypes = this.enumToArrayPipe.transform(ElectionFormFormatReceivedType);

  public deletePermission = PermissionService.create(PermissionTypeEnum.ElectionForms, PermissionActionTypeEnum.Delete);

  public form: UntypedFormGroup = new UntypedFormGroup({
    dateReceived: new UntypedFormControl(null, [this.dateValidator.valid]),
    electionFormPaymentMethodId: new UntypedFormControl(null, [Validators.required]),
    paymentMethodId: new UntypedFormControl(PaymentMethodEnum.Check),
    disbursementGroup: new UntypedFormControl(null),
    documentChannelId: new UntypedFormControl(null, [Validators.required]),
    docTrackingId: new UntypedFormControl(''),
    combinationLumpSumAmount: new UntypedFormControl(null),
    combinationStructuredSettlementAmount: new UntypedFormControl(null),
    combinationSpecialNeedsTrustAmount: new UntypedFormControl(null),
    lumpSumAmount: new UntypedFormControl(null),
    structuredSettlementAmount: new UntypedFormControl(null),
    specialNeedsTrustAmount: new UntypedFormControl(null),
    addressChangeNeeded: new UntypedFormControl(null),
    lineOne: new UntypedFormControl(null),
    lineTwo: new UntypedFormControl(null),
    city: new UntypedFormControl(null),
    state: new UntypedFormControl(null),
    zipCode: new UntypedFormControl(null),
    country: new UntypedFormControl(null),
    type: new UntypedFormControl(null),
    status: new UntypedFormControl(null, [Validators.required]),
    note: new UntypedFormControl(null),
  });

  public readonly awaitedActionTypes = [
    actions.CreateOrUpdateElectionFormSuccess.type,
    actions.Error.type,
  ];

  public readonly awaitedVerifyActionTypes = [
    actions.VerifyElectionFormAddressRequest.type,
    actions.Error.type,
  ];

  constructor(
    public editElectionFormModal: BsModalRef,
    private store: Store<fromRoot.AppState>,
    private dateValidator: DateValidator,
    private enumToArrayPipe: EnumToArrayPipe,
    private actionsSubj: ActionsSubject,
    private electionFormService: ElectionFormModalService,
    private serverErrorService: ServerErrorService,
    private electionFormCalculatorService: ElectionFormTotalCalculatorService,
    private toaster: ToastService,
  ) {}

  public get totalAmount(): number {
    const combinationLumpSumAmount = Number(this.form.controls.combinationLumpSumAmount.value) || 0;
    const combinationStructuredSettlementAmount = Number(this.form.controls.combinationStructuredSettlementAmount.value) || 0;
    const combinationSpecialNeedsTrustAmount = Number(this.form.controls.combinationSpecialNeedsTrustAmount.value) || 0;

    return this.electionFormCalculatorService.calcTotal(
      combinationLumpSumAmount,
      combinationStructuredSettlementAmount,
      combinationSpecialNeedsTrustAmount,
    );
  }

  public get isStatusInvalid(): boolean {
    return this.compareTotalVsNetAllocation() !== 0
    && (this.form.controls.status.value?.id === ElectionFormStatus.InGoodOrder
    || this.form.controls.status.value?.id === ElectionFormStatus.PendingReview);
  }

  public get isAddressFilled(): boolean {
    return this.form
      && !!this.form.get('lineOne')?.value
      && !!this.form.get('state')?.value
      && !!this.form.get('city')?.value;
  }

  private getCurrentTotal(): number {
    const methodOfPayments = this.form.controls.electionFormPaymentMethodId.value;
    switch (methodOfPayments) {
      case ElectionPaymentMethod.LumpSumPayment:
        return Number(this.form.controls.lumpSumAmount.value) || 0;
      case ElectionPaymentMethod.SpecialNeedsTrust:
        return Number(this.form.controls.specialNeedsTrustAmount.value || 0);
      case ElectionPaymentMethod.StructuredSettlement:
        return Number(this.form.controls.structuredSettlementAmount.value || 0);
      case ElectionPaymentMethod.Combination:
        return this.totalAmount;
      default:
        return 0;
    }
  }

  public getTotalError(): string {
    switch (this.compareTotalVsNetAllocation()) {
      case -1: return 'Total is less than Claimant Net';
      case 0: return '';
      case 1: return 'Exceeds Claimant Net';
      default: return null;
    }
  }

  private compareTotalVsNetAllocation(): (-1 | 0 | 1) {
    const total = this.getCurrentTotal();
    const netAllocation = Number(this.netAllocation) || 0;

    if (total.toFixed(2) === netAllocation.toFixed(2)) return 0;
    return (total > netAllocation) ? 1 : -1;
  }

  ngOnInit(): void {
    this.subscribeToPrimaryEmail();
    this.subscribeToElectionForm();
    this.subscribeToElectionFormActions();
    this.subscribeToCurrentClient();
    this.subscribeToFileExtensions();
    this.subscribeToAddressChange();
    this.subscribeToAvailableDisbursementGroupsForElectionForm();
    this.subscribeToLedgerSettings();
    this.subscribeToCombinationLumpSumAmountChange();
    this.store.dispatch(rootActions.GetElectionFormStatuses());
    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());

    if (this.electionFormId) {
      this.getExistingElectionForm();
    } else {
      this.subscribeToAddressesList();
      this.initFormWithDefaultValues();
    }

    this.form.get('electionFormPaymentMethodId').valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(() => {
        // reset payment method to default
        this.form.patchValue({ paymentMethodId: PaymentMethodEnum.Check });
      });
  }

  public onFileSelected(file: File): void {
    this.selectedFile = file;
  }

  public onSave(): void {
    const value = this.form.value;

    const electionForm: ClaimantElection = {
      ...this.existingElectionForm,
      clientId: this.currentClientId,
      received: value.electionFormReceived,
      documentChannelId: value.documentChannelId,
      docusignId: value.docTrackingId,
      disbursementGroupId: value.disbursementGroup?.id,
      receivedDate: value.dateReceived,
      efPaymentMethodId: value.electionFormPaymentMethodId,
      paymentMethodId: value.paymentMethodId,
      addressChange: value.addressChangeNeeded,
      addressCity: value.city,
      addressLineOne: value.lineOne,
      addressLineTwo: value.lineTwo,
      addressState: value.state,
      addressZip: value.zipCode,
      addressType: value.type,
      addressTypeId: value.type?.id,
      country: value.country?.name,
      countryId: value.country?.id,
      electionFormStatusId: value.status.id,
      note: value.note,
    };

    this.electionFormService.fillElectionFormAmountFields(electionForm, value);
    this.store.dispatch(actions.CreateOrUpdateElectionForm({ electionForm, file: this.selectedFile }));
  }

  public onStatusChange(e): void {
    this.toggleAddressRequired((e.id === ElectionFormStatus.InGoodOrder || e.id === ElectionFormStatus.PendingReview) && this.form.controls.addressChangeNeeded.value);
  }

  public onDisbursementGroupChange(e: DisbursementGroup): void {
    this.netAllocation = e.netAllocation;
  }

  private toggleAddressRequired(required: boolean): void {
    this.isAddressRequired = required;
    const { type, lineOne, state, city, zipCode } = this.form.controls;
    const controls = [lineOne, state, city, zipCode, type];
    controls.forEach((control: AbstractControl) => {
      if (control === this.form.controls.zipCode) {
        control.setValidators(required ? [Validators.required, ValidationService.zipCodeValidator] : null);
        return;
      }
      control.setValidators(required ? Validators.required : null);
    });

    this.updateValueAndValidity(controls);
  }

  private updateValueAndValidity(controls: AbstractControl[]): void {
    controls.forEach((control: AbstractControl) => {
      control.updateValueAndValidity();
    });
  }

  public onDelete(): void {
    this.store.dispatch(actions.DeleteElectionForm({ electionFormId: this.electionFormId }));
  }

  public onRemoveDocument(): void {
    this.store.dispatch(actions.DeleteElectionFormDocument({ documentId: this.existingElectionForm.doc.id }));
  }

  public onDownloadDocument(): void {
    this.store.dispatch(sharedActions.documentsListActions.DownloadDocument({ id: this.existingElectionForm.doc.id }));
  }

  public onRemoveSelectedFile(): void {
    this.selectedFile = null;
  }

  public onDownloadSelectedFile(): void {
    saveAs(this.selectedFile);
  }

  public onCheckAddressChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleAddressRequired((this.form.controls.status.value?.id === ElectionFormStatus.InGoodOrder || this.form.controls.status.value?.id === ElectionFormStatus.PendingReview) && checked);
  }

  private initForm(electionForm: ClaimantElection): void {
    const formInitializer: any = {
      dateReceived: electionForm.receivedDate,
      electionFormPaymentMethodId: electionForm.efPaymentMethodId,
      paymentMethodId: electionForm.paymentMethodId,
      documentChannelId: electionForm.documentChannelId,
      docTrackingId: electionForm.docusignId,
      addressChangeNeeded: electionForm.addressChange,
      lineOne: electionForm.addressLineOne,
      lineTwo: electionForm.addressLineTwo,
      city: electionForm.addressCity,
      state: electionForm.addressState,
      zipCode: electionForm.addressZip,
      type: electionForm.addressType,
      status: electionForm.electionFormStatus,
      disbursementGroup: electionForm.disbursementGroup,
      note: electionForm.note,
      ...this.electionFormService.getAmountFieldsFromElectionForm(electionForm),
    };

    this.toggleAddressRequired((electionForm.electionFormStatus.id === ElectionFormStatus.InGoodOrder || electionForm.electionFormStatus.id === ElectionFormStatus.PendingReview) && electionForm.addressChange);

    if (electionForm.country && electionForm.countryId) {
      formInitializer.country = {
        id: electionForm.countryId,
        name: electionForm.country,
      };
    }

    this.form.patchValue(formInitializer);
    this.form.updateValueAndValidity();
  }

  private subscribeToAddressesList(): void {
    this.addresses$
      .pipe(
        filter((item: EntityAddress[]) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((addresses: any[]) => {
        this.personAddress = addresses.find((p: EntityAddress) => p.isPrimary);
      });
  }

  private subscribeToElectionForm(): void {
    this.electionForm$
      .pipe(
        filter((item: ClaimantElection) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((electionForm: ClaimantElection) => {
        this.existingElectionForm = electionForm;
        this.personAddress = Address.toModel(electionForm.client?.person?.primaryAddress);
        this.extractNetAllocation();
        this.initForm(electionForm);
      });
  }

  private subscribeToAvailableDisbursementGroupsForElectionForm(): void {
    this.availableDisbursementGroupsForElectionForm$
      .pipe(
        filter((item: DisbursementGroup[]) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((disbursementGroups: DisbursementGroup[]) => {
        this.disbursementGroups = disbursementGroups;
        this.extractNetAllocation();
      });
  }

  private extractNetAllocation(): void {
    this.netAllocation = this.disbursementGroups?.find((i: DisbursementGroup) => i.id === this.existingElectionForm?.disbursementGroupId)?.netAllocation;
  }

  private subscribeToElectionFormActions(): void {
    this.actionsSubj.pipe(
      ofType(actions.CreateOrUpdateElectionFormSuccess, actions.DeleteElectionFormSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.editElectionFormModal.hide();
    });

    this.actionsSubj.pipe(
      ofType(actions.DeleteElectionFormDocumentSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.existingElectionForm.doc = null;
      this.existingElectionForm.docId = null;
    });

    this.actionsSubj.pipe(
      ofType(actions.Error),
      filter((action: { error: ApiErrorResponse }) => !isString(action.error)),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { error: ApiErrorResponse }) => {
      const error: ApiErrorResponse = action.error;

      const formLevelErrors = this.serverErrorService.getFormErrors('LedgerSettings', error);

      if (formLevelErrors.length) {
        this.toaster.showWarning(formLevelErrors[0]);
      } else {
        this.serverErrorService.showServerErrors(this.form, action);
        this.form.markAllAsTouched();
      }
    });

    this.actionsSubj.pipe(
      ofType(actions.VerifyElectionFormAddressRequestError),
      filter((action: { error: ApiErrorResponse }) => !isString(action.error)),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { error: ApiErrorResponse }) => {
      const error: ApiErrorResponse = action.error;
      this.addressErrorsHandler(error);
    });
  }

  private addressErrorsHandler(error): void {
    const errorMessage = error?.error;
    const errors = [];
    if (error?.errorMessages) {
      Object.keys(error.errorMessages).forEach((item: string) => {
        const controlName = Object.keys(this.form.controls).find((key: string) => key.toLowerCase() === item.toLowerCase());
        this.form.controls[controlName].setErrors({ controlError: `${error?.errorMessages[item][0].Content}` });
        this.form.markAllAsTouched();

        errors.push(error?.errorMessages[item][0].Content);
      });
    }

    this.toaster.showWarning(errors.join('. '), errorMessage);
  }

  private subscribeToCurrentClient(): void {
    this.item$
      .pipe(
        filter((item: Claimant) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((client: Claimant) => {
        this.currentClientId = client.id;
        this.currentClientFullname = client.fullName;

        // this.electionFormId is populated from the outside. It will be null during create and not null during Update/View
        this.store.dispatch(actions.GetAvailableDisbursementGroupsForElectionFormRequest({ clientId: this.currentClientId, electionFormId: this.electionFormId }));
        if (client.person?.id && this.primaryEmail == null) {
          this.store.dispatch(sharedActions.emailActions.GetPrimaryEmailByEntity({ entityType: EntityTypeEnum.Persons, entityId: client.person.id }));
        }
      });
  }

  private subscribeToPrimaryEmail(): void {
    this.primaryEmail$
      .pipe(
        filter((d: Email) => !!d),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((email: Email) => {
        this.primaryEmail = email;
      });
  }

  private subscribeToFileExtensions(): void {
    this.allowedExtensions$
      .pipe(
        filter((extensions: string[]) => !!extensions),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((extensions: string[]) => {
        this.allowedExtensions = extensions;
      });
  }

  private getExistingElectionForm(): void {
    this.store.dispatch(actions.GetElectionForm({ id: this.electionFormId }));
  }

  private initFormWithDefaultValues(): void {
    this.form.patchValue({ electionFormPaymentMethodId: ElectionPaymentMethod.LumpSumPayment });
    this.form.updateValueAndValidity();
  }

  private subscribeToAddressChange(): void {
    const { addressChangeNeeded, lineOne, lineTwo, city, state, zipCode, country, type } = this.form.controls;
    const controls = [addressChangeNeeded, lineOne, lineTwo, city, state, zipCode, country, type];

    for (const c of controls) {
      c.valueChanges
        .pipe(
          filter(() => this.form.controls.status.invalid),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(() => {
          this.form.controls.status.setErrors(null);
          this.form.controls.status.markAsUntouched({ onlySelf: true });
        });
    }
  }

  public onVerifyAddress(status: AddressStatus): void {
    let address: EntityAddress;

    if (status === this.addressStatus.ExistingAddress) {
      address = {
        ...this.personAddress,
        entityType: EntityTypeEnum.Clients,
        entityId: this.currentClientId,
      } as EntityAddress;
    } else {
      address = {
        line1: this.form.get('lineOne').value,
        line2: this.form.get('lineTwo').value,
        city: this.form.get('city').value,
        state: this.form.get('state').value,
        zip: this.form.get('zipCode').value,
        country: this.form.get('country').value,
        type: this.form.get('type').value,
        entityType: EntityTypeEnum.Clients,
        entityId: this.currentClientId,
      } as EntityAddress;
    }

    this.store.dispatch(sharedActions.addAddressModalActions.SetAddress({ address, canEdit: true, canRunMoveCheck: true }));

    this.store.dispatch(
      actions.VerifyElectionFormAddressRequest({
        address,
        close: this.closeModal.bind(this),
        entityName: this.currentClientFullname,
        returnAddressOnSave: true,
      }),
    );
  }

  protected closeModal(address?: any): void {
    if (address) {
      this.form.get('country').setValue(address.country);
      this.form.get('lineOne').setValue(address.lineOne);
      this.form.get('lineTwo').setValue(address.lineTwo);
      this.form.get('city').setValue(address.city);
      this.form.get('state').setValue(address.state);
      this.form.get('zipCode').setValue(address.zipCode);
    } else if (this.editElectionFormModal) {
      this.editElectionFormModal.hide();
    }
  }

  private subscribeToLedgerSettings(): void {
    this.ledgerSettings$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((ledgerSettings: ClaimSettlementLedgerSettings) => {
        this.ledgerSettings = ledgerSettings;
      });
  }

  private subscribeToCombinationLumpSumAmountChange(): void {
    this.form.controls.combinationLumpSumAmount.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((value: number) => {
        this.checkPaymentMethods(value);
      });
  }

  private checkPaymentMethods(value: number): void {
    this.isCheckPaymentMethodDisabled = value <= 0;

    if (value > 0) {
      this.isDigitalPaymentMethodDisabled = !this.ledgerSettings.isDigitalPaymentsEnabled;
    } else {
      this.isDigitalPaymentMethodDisabled = true;
      this.form.controls.paymentMethodId.setValue(PaymentMethodEnum.Check);
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.ClearElectionForm());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
