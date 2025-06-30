import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { Observable, Subject } from 'rxjs';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { ActionsSubject, Store } from '@ngrx/store';
import * as fromShared from '@app/state';
import { Address, IdValue, Country, EntityAddress, ResendReasonSpecification } from '@app/models';
import { AddressPipe } from '@app/modules/shared/_pipes';
import { filter, takeUntil } from 'rxjs/operators';
import { sharedSelectors, sharedActions } from 'src/app/modules/shared/state/index';
import { ToggleState } from '@app/models/enums/toggle-state.enum';
import { Payment } from '@app/models/payment';
import { StopPaymentRequestStatusEnum } from '@app/models/enums/payment-status.enum';
import { ofType } from '@ngrx/effects';
import { Attachment } from '@app/models/attachment';
import { FileHelper } from '@app/helpers/file.helper';
import { ResendReasonEnum, ResendReasonSpecEnum } from '@app/models/enums/payment-resend-reason.enum';
import { FileService, MessageService, PermissionService, ToastService, ValidationService } from '@app/services';
import { TypeAheadHelper } from '@app/helpers/type-ahead.helper';
import { DropdownHelper } from '@app/helpers/dropdown.helper';
import { autoFocusFieldAsyncValidator } from '@app/validators/auto-focus-field.validator';
import { EntityTypeEnum, PaymentMethodEnum, PaymentProviderEnum, PermissionActionTypeEnum, PermissionTypeEnum, WebAppLocation } from '@app/models/enums';
import { Note } from '@app/models/note';
import moment from 'moment-timezone';
import { AttachmentForm } from '@app/modules/shared/_abstractions/attachment-form';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { CommonHelper } from '@app/helpers';

@Component({
  selector: 'app-stop-payment-modal',
  templateUrl: './stop-payment-modal.component.html',
  styleUrls: ['./stop-payment-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StopPaymentModalComponent extends AttachmentForm implements OnInit, OnDestroy {
  public paymentId: number;
  public optionsReasonSpec = [];
  public relatedOptionsReasonSpec = [];
  public canEditAddress = false;
  public countries: Country[] = [];
  public payment: Payment;
  public warningMsg: string;
  public canEdit: boolean;
  public editMode: boolean;
  public loadPayment: boolean;
  private verifiedAddress: boolean;
  protected get validationForm(): UntypedFormGroup {
    throw new Error('Method not implemented.');
  }
  public address: Partial<EntityAddress>;
  public qsfAcctAttachments: Attachment[] = [];

  public isCommentFieldRequired = false;
  public isAttachmentsFieldsRequired = false;
  public isReasonSpecRequired = false;
  public isAddressChangeDisabled = false;
  private isAddressCorrect: ToggleState = ToggleState.Yes;

  private ngUnsubscribe$ = new Subject<void>();
  public readonly countrySearch = (search$: Observable<string>) => TypeAheadHelper.search(this.countries, search$);
  public readonly countryValidator = (control: AbstractControl) => TypeAheadHelper.getValidationError(control, this.countries);
  public dropdownComparator = DropdownHelper.compareOptions;
  public addressTypesDropdownValues$ = this.store.select(fromShared.addressTypesDropdownValues);

  public readonly payment$ = this.store.select(selectors.item);
  public readonly stopPayment$ = this.store.select(selectors.stopPaymentRequest);
  public readonly dropDownValues$ = this.store.select(selectors.stopPaymentRequestDropdownValues);
  public readonly countriesDropdownValues$ = this.store.select(fromShared.countriesDropdownValues);
  public allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);

  public readonly canToggleMode = this.permissionService.has(PermissionService.create(PermissionTypeEnum.StopPaymentRequest, PermissionActionTypeEnum.UpdateRequestInformation));
  public readonly DeleteQSFAcctAttachmentsPermission = PermissionService.create(PermissionTypeEnum.StopPaymentRequest, PermissionActionTypeEnum.DeleteQSFAcctAttachments);

  public readonly toggleStateEnum = ToggleState;

  public readonly awaitedActionTypes = [
    actions.SubmitStopPaymentRequestComplete.type,
    actions.CancelSubmitStopPayment.type,
    actions.Error.type,
    FormInvalid.type,
  ];

  get isValidAttachment() {
    return (this.isAttachmentsFieldsRequired && this.attachments.length > 0) || !this.isAttachmentsFieldsRequired;
  }

  get isValidAddress() {
    return this.form.controls.addressFields.valid;
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    resendReason: new UntypedFormControl(null, [Validators.required]),
    resendReasonSpecification: new UntypedFormControl(null),
    comments: new UntypedFormControl(null, Validators.maxLength(200)),
    isAddressCorrect: new UntypedFormControl(ToggleState.Yes, [control => (control && control.value && control.value === ToggleState.Yes ? null : { required: true })]),

    addressFields: new UntypedFormGroup({
      line1: new UntypedFormControl(null),
      line2: new UntypedFormControl(null),
      city: new UntypedFormControl(null),
      state: new UntypedFormControl(null),
      zip: new UntypedFormControl(null, ValidationService.zipCodeValidator),
      country: new UntypedFormControl(null),
      countryName: new UntypedFormControl(null, this.countryValidator),
      type: new UntypedFormControl(null),
    }),
  });

  constructor(
    public modal: BsModalRef,
    private readonly store: Store<fromShared.AppState>,
    private readonly addressPipe: AddressPipe,
    private readonly actionsSubj: ActionsSubject,
    private readonly messageService: MessageService,
    private readonly toaster: ToastService,
    private readonly permissionService: PermissionService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.verifiedAddress = false;
    this.dispatchActions();
    this.subscribeToDropDownValues();
    this.subscribeToPayment();
    this.subscribeToCountryDropdown();
    this.actionsSubj.pipe(
      ofType(actions.SubmitStopPaymentRequestComplete),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.modal.hide();
      this.store.dispatch(actions.GetPaymentDetails({ paymentId: this.paymentId }));
    });
    this.actionsSubj.pipe(
      ofType(actions.SaveAddressSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      this.canEditAddress = false;
      this.warningMsg = null;
      this.form.patchValue({ isAddressCorrect: this.toggleStateEnum.Yes });
      this.isAddressCorrect = ToggleState.No;

      this.address = { ...data.address };
      this.fillAddress();
    });
  }

  public toggleViewMode(): void {
    this.onResendReasonSelected(this.payment.stopPaymentRequest?.resendReason);
    this.fillForm();
    if (!this.payment.stopPaymentRequest?.isAddressCorrect) {
      this.onChangeAddress();
    }
    this.attachments = this.payment.stopPaymentRequest?.sprAttachments;
    this.qsfAcctAttachments = this.payment.stopPaymentRequest?.qsfAcctAttachments;
    this.canEdit = true;
    this.editMode = true;
  }

  private fillAddress() {
    this.form.controls.addressFields.patchValue({
      line1: this.address.line1,
      line2: this.address.line2,
      city: this.address.city,
      state: this.address.state,
      zip: this.address.zip,
      countryName: this.address.countryName,
      type: this.address.type,
    });
  }

  private fillForm() {
    this.form.patchValue({
      resendReason: this.payment.stopPaymentRequest?.resendReason,
      resendReasonSpecification: this.payment.stopPaymentRequest?.resendReasonSpecification,
      comments: this.payment.stopPaymentRequest?.note?.html,
      isAddressCorrect: this.payment.stopPaymentRequest?.isAddressCorrect ? ToggleState.Yes : ToggleState.No,
    });
  }

  public canShowEditMadeDate(date: Date) {
    const entityDate = moment(date);
    const requestInformationUpdatedDate = moment(this.payment.stopPaymentRequest?.requestInformationUpdatedDate);
    return requestInformationUpdatedDate.diff(entityDate) > 0;
  }

  public canShowEditMadeDateOnAttachments() {
    const requestInformationUpdatedDate = moment(this.payment.stopPaymentRequest?.requestInformationUpdatedDate);
    return this.payment.stopPaymentRequest.sprAttachments.some(item => requestInformationUpdatedDate.diff(moment(item.createdDate)) > 0);
  }

  public canShowEditMadeDateOnQSFAttachments() {
    const requestInformationUpdatedDate = moment(this.payment.stopPaymentRequest?.requestInformationUpdatedDate);
    return this.payment.stopPaymentRequest.qsfAcctAttachments.some(item => requestInformationUpdatedDate.diff(moment(item.createdDate)) > 0);
  }

  public canEditResendReason() {
    return !this.editMode || this.payment.stopPaymentRequest?.resendReason?.id === ResendReasonEnum.HOLDReissue;
  }

  private dispatchActions() {
    if (this.loadPayment) {
      this.store.dispatch(actions.GetPaymentDetails({ paymentId: this.paymentId }));
    }
    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());
    this.store.dispatch(actions.GetStopPaymentDropdownValues());
  }

  private subscribeToDropDownValues() {
    this.dropDownValues$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(data => !!data),
    ).subscribe(data => {
      this.optionsReasonSpec = data.resendReasonSpecifications;
    });
  }

  private subscribeToPayment() {
    this.payment$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(data => !!data),
    ).subscribe(data => {
      this.payment = data;
      this.address = this.extractAddressFromPayment();
      this.fillAddress();
      this.form.controls.addressFields.reset();
    });
  }

  private subscribeToCountryDropdown() {
    this.countriesDropdownValues$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(results => {
      this.countries = <Country[]>results;
    });
  }

  onSubmit() {
    if (!this.isPaymentMethodCheck() && !(this.isPaymentMethodDigital() && this.isWesternAllianceProvider())) {
      this.toaster.showError('Invalid Payment method', 'Cannot save');
      return;
    }

    this.messageService
      .showConfirmationDialog('Stop Payment Request', `You will send a Request to Stop Payments on ${this.payment?.payeeName} <br> Are you sure you want to proceed?`, 'Submit')
      .subscribe(answer => {
        if (!answer) {
          this.store.dispatch(actions.CancelSubmitStopPayment());
        } else {
          this.submitRequest();
        }
      });
  }

  private isPaymentMethodCheck(): boolean {
    return this.payment?.paymentMethod?.id === PaymentMethodEnum.Check;
  }

  private isPaymentMethodDigital(): boolean {
    return this.payment?.paymentMethod?.id === PaymentMethodEnum.DigitalPayment;
  }

  private isWesternAllianceProvider(): boolean{
    return this.payment?.acPaymentProviderId == PaymentProviderEnum.WesternAlliance;
  }

  private submitRequest() {
    const value = this.form.value;

    const address = {
      type: this.form.controls.addressFields.get('type').value,
      line1: this.form.controls.addressFields.get('line1').value,
      line2: this.form.controls.addressFields.get('line2').value,
      state: this.form.controls.addressFields.get('state').value,
      city: this.form.controls.addressFields.get('city').value,
      country: this.form.controls.addressFields.get('country').value,
      countryName: this.form.controls.addressFields.get('countryName').value,
      zip: this.form.controls.addressFields.get('zip').value,
    } as EntityAddress;

    const request = {
      id: this.payment.stopPaymentRequest?.id && this.payment.stopPaymentRequest?.status?.id !== StopPaymentRequestStatusEnum.RejectedWrongCheck ? this.payment.stopPaymentRequest?.id : 0,
      statusId: StopPaymentRequestStatusEnum.Review,
      paymentId: this.paymentId,
      resendReasonId: value.resendReason?.id,
      resendReasonSpecificationId: value.resendReasonSpecification?.id,
      isAddressCorrect: this.isAddressCorrect === ToggleState.Yes,
      sprAttachments: this.attachments,
      qsfAcctAttachments: this.qsfAcctAttachments,
      addressLink: this.verifiedAddress ? EntityAddress.toDto(address) : null,
      note: Note.toDto({ html: value.comments, entityTypeId: EntityTypeEnum.StopPaymentRequest, entityId: 0 } as Note),
    };

    this.store.dispatch(actions.SubmitStopPaymentRequest({ stopPaymentRequest: request }));
  }

  onCancel() {
    this.modal.hide();
  }

  onResendReasonSelected(selectedReason: IdValue) {
    this.form.controls.resendReasonSpecification.setValue(null);
    this.relatedOptionsReasonSpec = this.optionsReasonSpec?.filter(item => item.resendReasonId === selectedReason?.id);

    const resendReasonSpec: ResendReasonSpecification = {
      id: 0,
      name: '',
      resendReasonId: selectedReason.id,
      resendReason: selectedReason.name,
    };

    this.toggleRequiredFields(resendReasonSpec);
  }

  onResendReasonSpecSelected(selectedReasonSpec: ResendReasonSpecification) {
    this.toggleRequiredFields(selectedReasonSpec, true);
  }

  private toggleRequiredFields(selectedReason: ResendReasonSpecification, isSpec = false) {
    let isCommentFieldRequiredBySpec = false;
    let isAttachmentsFieldsRequiredBySpec = false;
    const resendReasonSpecificationsRequiringComment = [
      ResendReasonSpecEnum.ReissueWithTotalNetNotPartial,
      ResendReasonSpecEnum.CheckIssuedInError,
      ResendReasonSpecEnum.Other,
    ];
    const resendReasonSpecificationsRequiringAttachment = [
      ResendReasonSpecEnum.AttorneyFeeReduction,
      ResendReasonSpecEnum.OtherFeeReduction,
    ];
    const resendReasonDisabledAddress = [
      ResendReasonEnum.IssuedInError,
      ResendReasonEnum.DoNotReissue,
    ];
    const resendReasonRequiringComment = [
      ResendReasonEnum.OrganizationAmountDiscrepancy,
      ResendReasonEnum.HOLDReissue,
      ResendReasonEnum.DoNotReissue,
      ResendReasonEnum.ReissueWithTotalNet,
      ResendReasonEnum.Other,
    ];
    const resendReasonRequiringAttachments = [
      ResendReasonEnum.UpdatedClaimantName,
      ResendReasonEnum.IncorrectPayeeInformation,
    ];

    if (isSpec) {
      isCommentFieldRequiredBySpec = selectedReason && resendReasonSpecificationsRequiringComment.includes(selectedReason.id);
      isAttachmentsFieldsRequiredBySpec = selectedReason && resendReasonSpecificationsRequiringAttachment.includes(selectedReason.id);
    } else {
      if (selectedReason && (selectedReason.resendReasonId === ResendReasonEnum.MovedNewAddress)) {
        this.form.patchValue({ isAddressCorrect: this.toggleStateEnum.No });
        this.canEditAddress = true;
      }
      this.isAddressChangeDisabled = selectedReason && resendReasonDisabledAddress.includes(selectedReason.resendReasonId);
    }

    this.isCommentFieldRequired = selectedReason
    && (resendReasonRequiringComment.includes(selectedReason.resendReasonId) || isCommentFieldRequiredBySpec);

    this.isAttachmentsFieldsRequired = selectedReason
      && (resendReasonRequiringAttachments.includes(selectedReason.resendReasonId) || isAttachmentsFieldsRequiredBySpec);

    this.isReasonSpecRequired = selectedReason && this.relatedOptionsReasonSpec && this.relatedOptionsReasonSpec.length > 0;

    this.toggleRequiredValidator('resendReasonSpecification', this.isReasonSpecRequired);
    this.toggleRequiredValidator('comments', this.isCommentFieldRequired);
  }

  private toggleRequiredValidator(controlName: string, condition: boolean): void {
    const control = this.form.controls[controlName];
    if (condition) {
      control.setValidators(Validators.required);
      control.updateValueAndValidity();
    } else {
      control.setValidators(null);
      control.updateValueAndValidity();
    }
  }

  protected convertToAttachment(file: File): Attachment {
    const fileName = file.name;
    const extension = FileHelper.getExtension(fileName);
    const attachment = new Attachment();
    attachment.name = FileHelper.extractFileName(fileName, extension);
    attachment.fileName = fileName;
    attachment.fileExtension = extension;
    FileService.fileToByteArray2(file).then(content => { attachment.fileContent = content; });
    return attachment;
  }

  getFullPayeeAddress(): string {
    const data = this.extractAddressFromPayment();

    if (!data) {
      return '-';
    }
    const address = new Address(data);
    return this.addressPipe.transform(address) || '-';
  }

  onChangeAddress() {
    const address = this.payment.stopPaymentRequest?.addressLink;
    if (address) {
      this.form.controls.addressFields.patchValue({
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        zip: address.zip,
        countryName: address.countryName,
        type: address.type,
      });
    } else {
      this.form.controls.addressFields.patchValue({
        line1: this.address.line1,
        line2: this.address.line2,
        city: this.address.city,
        state: this.address.state,
        zip: this.address.zip,
        countryName: this.address.countryName,
      });
    }
    const type = this.form.controls.addressFields.get('type');
    const line1 = this.form.controls.addressFields.get('line1');
    const state = this.form.controls.addressFields.get('state');
    const city = this.form.controls.addressFields.get('city');
    const controls = [type, line1, state, city];

    type.setValidators(Validators.required);
    line1.setValidators([Validators.required, Validators.maxLength(255), ValidationService.noWhitespaceBeforeTextValidator]);
    line1.setAsyncValidators(autoFocusFieldAsyncValidator);
    state.setValidators([Validators.required, Validators.maxLength(100), ValidationService.noWhitespaceBeforeTextValidator]);
    city.setValidators([Validators.required, Validators.maxLength(60), ValidationService.noWhitespaceBeforeTextValidator]);

    controls.forEach(control => {
      control.updateValueAndValidity();
    });

    this.canEditAddress = true;

    // if the address has been set in the past because it's an existing SPR with an already bad payment address
    if (this.payment.stopPaymentRequest?.id > 0 && !this.payment.stopPaymentRequest?.isAddressCorrect) {
      this.verifiedAddress = true;
      this.warningMsg = null;
      this.form.patchValue({ isAddressCorrect: this.toggleStateEnum.Yes });
      this.isAddressCorrect = ToggleState.No;
    } else {
      this.warningMsg = 'You have to verify the updated address in order to submit this request';
    }
  }

  public onCountryChange(event) {
    const search = event.srcElement.value;
    const country = TypeAheadHelper.get(this.countries, search.toLowerCase());
    this.form.controls.addressFields.patchValue({
      countryName: country ? country.name : search,
      country,
    });
  }

  public onDownloadDocument(id: number) {
    this.store.dispatch(sharedActions.documentsListActions.DownloadByDocumentLinkId({ id }));
  }

  public onRemoveQSFAcctAttachments(attachment: Attachment): void {
    const index = this.qsfAcctAttachments.findIndex(item => item.name === attachment.name);
    if (index > -1) {
      this.qsfAcctAttachments.splice(index, 1);
    }
  }

  onVerifyAddress(): void {
    if (this.canEditAddress && !this.form.controls.addressFields.valid) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }

    let entityId: number;
    let entityTypeId: EntityTypeEnum;
    if (this.payment.entityId && this.payment.entityTypeId) {
      entityId = this.payment.entityId;
      entityTypeId = this.payment.entityTypeId;
    } else {
      entityId = CommonHelper.isValidInt32(this.payment.payeeExternalId) ? +this.payment.payeeExternalId : 0;
      entityTypeId = this.payment.entityTypeId ?? EntityTypeEnum.Clients;
    }

    const addressFields = this.form.controls.addressFields;
    const address = {
      line1: addressFields.get('line1').value,
      line2: addressFields.get('line2').value,
      city: addressFields.get('city').value,
      state: addressFields.get('state').value,
      zip: addressFields.get('zip').value,
      country: addressFields.get('country').value,
      countryName: addressFields.get('countryName').value,
      type: addressFields.get('type').value,
      entityType: entityTypeId,
      entityId,
      id: 0,
    } as EntityAddress;
    this.store.dispatch(sharedActions.addAddressModalActions.SetAddress({ address, canEdit: true, canRunMoveCheck: true }));

    this.store.dispatch(
      actions.VerifyRequest({ address, close: this.closeModal.bind(this), entityName: this.payment.payeeName, webAppLocation: WebAppLocation.SPR }),
    );
    this.verifiedAddress = true;
  }

  private extractAddressFromPayment() {
    const address = this.payment?.stopPaymentRequest?.addressLink;
    if (address) {
      return ({
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        zip: address.zip,
        countryName: address.countryName,
        type: address.type,
      });
    }
    return ({
      line1: this.payment.payeeAddress1,
      line2: this.payment.payeeAddress2,
      city: this.payment.payeeAddressCity,
      state: this.payment.payeeAddressState,
      zip: this.payment.payeeAddressZip,
      countryName: this.payment.payeeAddressCountry,
      type: this.payment.payeeAddressType,
    });
  }

  protected closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
