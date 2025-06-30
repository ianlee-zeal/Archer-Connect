import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';

import { UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

import * as fromRoot from '@app/state';
import { PermissionTypeEnum, PermissionActionTypeEnum, PaymentMethodEnum, EntityTypeEnum } from '@app/models/enums';
import { ModalService, PermissionService, ToastService } from '@app/services';
import { PersonContact } from '@app/models/person-contact';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { IdValue } from '@app/models';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { StringHelper } from '@app/helpers';
import { ContactsPersonTemplateComponent } from '../contacts-person-template/contacts-person-template.component';

import * as fromContacts from '../state';
import { ContactsLinkExistingComponent } from '../contacts-link-existing/contacts-link-existing.component';

@Component({
  selector: 'app-contacts-edit',
  templateUrl: './contacts-edit.component.html',
  styleUrls: ['./contacts-edit.component.scss'],
})
export class ContactsEditComponent extends ValidationForm implements OnInit, OnDestroy {
  @ViewChild(ContactsPersonTemplateComponent) personTemplate: ContactsPersonTemplateComponent;

  public title: string;
  public parentPersonId: number;
  public claimantId: number;
  public entityType: EntityTypeEnum;
  public relationship: PersonContact;
  public canEdit: boolean = false;
  public isSsnLoaded: boolean = false;
  public canTogglePersonTemplateMode: boolean = false;
  private skipDuplicateChecking: boolean;
  public relationshipTypes: IdValue[];
  public representativeTypes: IdValue[];
  public availableRelationshipTypes: IdValue[];
  public availableRepresentativeTypes: IdValue[];
  public percentFractionDigits: number = 10;

  public relationship$ = this.store.select(fromContacts.selectors.personContactSelector);
  public relationshipTypes$ = this.store.select(fromRoot.personRelationshipTypeValues);
  public representativeTypes$ = this.store.select(fromRoot.personRepresentativeTypesValues);
  public error$ = this.store.select(fromContacts.selectors.error);
  public ngDestroyed$ = new Subject<void>();

  public personRelationshipDeletePermission = [PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Delete)]
  public editAssociationPermission = [PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Edit)]
  public canEditLegalContactsPermission = this.permissionService.canEdit(PermissionTypeEnum.LegalContacts);
  public createAssociationPermission = PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Create);
  protected readonly canViewAuditInfoPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.AuditInfo, PermissionActionTypeEnum.ClaimantContacts));

  public readonly yesNoOptions = [{ id: true, name: 'Yes' }, { id: false, name: 'No' }];
  public readonly paymentMethods = [new IdValue(PaymentMethodEnum.Check, 'Check'), new IdValue(PaymentMethodEnum.DigitalPayment, 'Digital payment')];
  public readonly paymentMethodEnum = PaymentMethodEnum;

  public saveStarted: Function;

  readonly awaitedSaveActionTypes = [
    fromContacts.actions.ShowDuplicateWarningModal.type,
    fromContacts.actions.Error.type,
    FormInvalid.type,
  ];

  readonly awaitedDeleteActionTypes = [
    fromContacts.actions.Error.type,
    fromContacts.actions.DeleteContactsCancelled.type,
  ];

  form: UntypedFormGroup = new UntypedFormGroup({
    isLegalContact: new UntypedFormControl(false),
    isReleaseSignatureRequired: new UntypedFormControl(false),
    relationshipType: new UntypedFormControl(null),
    representativeType: new UntypedFormControl(null),
    description: new UntypedFormControl({ value: null, disabled: true }, Validators.maxLength(500)),
    specialInstructions: new UntypedFormControl({ value: null, disabled: true }, Validators.maxLength(500)),
    isPaidOnBehalfOfClaimant: new UntypedFormControl(),
    percentageAllocation: new UntypedFormControl({ value: null, disabled: true }),
    amountAllocation: new UntypedFormControl({ value: null, disabled: true }),
    paymentMethod: new UntypedFormControl({ value: this.paymentMethods[0].id, disabled: true }),
    checkMemo: new UntypedFormControl({ value: null, disabled: true }),
    additionalInfo: new UntypedFormControl({ value: null, disabled: false }, Validators.maxLength(500)),
    isCsSignatureRequired: new UntypedFormControl(false),
    nameOnCheck: new UntypedFormControl({ value: null, disabled: false }, Validators.maxLength(255)),
  });

  public get legalContactControl() {
    return this.form.get('isLegalContact');
  }

  readonly probateLocalCounselRelationship = 'Probate Local Counsel';

  private readonly legalContactsRelationships = [
    'Attorney',
    'Power Of Attorney',
    'Probate Attorney',
    this.probateLocalCounselRelationship,
    'Registry of the Court',
    'Representative',
  ];

  private readonly legalContactsRoles = [
    'Bankruptcy Attorney',
    'Bankruptcy Trustee',
    'Conservator',
    'Estate Representative',
    'Guardian',
    'Guardian Ad Litem',
    'Estate Attorney',
  ];

  private readonly probateLocalCounselOnlyRoles = new Set([
    'Probate Attorney',
  ]);

  get isProbateContact(): boolean {
    return this.entityType === EntityTypeEnum.Probates;
  }

  constructor(
    public modal: BsModalRef,
    private store: Store<fromContacts.ContactState>,
    private actions$: Actions,
    private toaster: ToastService,
    private permissionService: PermissionService,
    private modalService: ModalService,
  ) {
    super();
  }

  ngOnInit() {
    this.subscribeToPaidOnBehalfOfClaimant();
    this.subscribeToLegalContact();
    this.resetError();
    this.updateContactModel();

    this.actions$
      .pipe(
        ofType(fromContacts.actions.DeleteContactsSuccess),
        takeUntil(this.ngDestroyed$),
      )
      .subscribe(() => {
        this.modal.hide();
      });

    this.relationshipTypes$
      .pipe(filter(x => !!x))
      .subscribe(types => {
        this.relationshipTypes = types;
        this.availableRelationshipTypes = this.filterByLegalContactCondition(this.legalContactControl.value, this.relationshipTypes, this.legalContactsRelationships);
      });

    this.representativeTypes$
      .pipe(filter(x => !!x))
      .subscribe(types => {
        this.representativeTypes = types;
        this.availableRepresentativeTypes = this.filterRepresentativeTypesByConditions(this.legalContactControl.value, this.representativeTypes, this.legalContactsRoles);
      });

    this.relationship$
      .pipe(
        filter(relationship => !!relationship),
        takeUntil(this.ngDestroyed$),
      )
      .subscribe(relationship => {
        this.relationship = relationship;

        this.form.patchValue({
          isLegalContact: relationship.isLegalContact,
          relationshipType: relationship.relationshipType,
          representativeType: relationship.representativeType,
          description: relationship.description,
          specialInstructions: relationship.specialInstructions,
          isPaidOnBehalfOfClaimant: relationship.isPaidOnBehalfOfClaimant,
          percentageAllocation: relationship.percentageAllocation,
          amountAllocation: relationship.amountAllocation,
          paymentMethod: relationship.paymentMethodId,
          checkMemo: relationship.memoText,
          isReleaseSignatureRequired: relationship.isReleaseSignatureRequired,
          additionalInfo: relationship.additionalInfo,
          nameOnCheck: relationship.nameOnCheck,
          isCsSignatureRequired: relationship.isCsSignatureRequired,
        });

        if (relationship.isPrimaryContact) {
          this.personTemplate.form.patchValue({ isPrimaryContact: relationship.isPrimaryContact });
        }
        this.updatePermissionsForLegalContact();
      });
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  private subscribeToPaidOnBehalfOfClaimant() {
    this.form.get('isPaidOnBehalfOfClaimant').valueChanges.subscribe(value => {
      const paymentInstructionsFields = [
        this.form.controls.percentageAllocation,
        this.form.controls.amountAllocation,
        this.form.controls.paymentMethod,
        this.form.controls.checkMemo,
        this.form.controls.description,
        this.form.controls.specialInstructions,
        this.form.controls.nameOnCheck,
      ];
      if (value) {
        paymentInstructionsFields.forEach(field => field.enable());
        this.form.controls.nameOnCheck.setValue(`${this.relationship?.person.firstName} ${this.relationship?.person.lastName}`);
      } else {
        paymentInstructionsFields.forEach(field => field.disable());
      }
    });
  }

  private subscribeToLegalContact() {
    this.legalContactControl.valueChanges
      .subscribe(value => {
        this.availableRelationshipTypes = this.filterByLegalContactCondition(value, this.relationshipTypes, this.legalContactsRelationships);
        this.availableRepresentativeTypes = this.filterRepresentativeTypesByConditions(value, this.representativeTypes, this.legalContactsRoles);

        const relationshipType = this.form.get('relationshipType').value?.name;
        const representativeType = this.form.get('representativeType').value?.name;

        if (value !== this.legalContactsRelationships.includes(relationshipType)) {
          this.form.get('relationshipType').setValue(null);
        }
        if (value !== this.legalContactsRoles.includes(representativeType)) {
          this.form.get('representativeType').setValue(null);
        }
      });
  }

  private filterByLegalContactCondition(isLegalContact: boolean, initialList: IdValue[], legalContactsValueList: string[]): IdValue[] {
    return initialList.filter(type => isLegalContact === legalContactsValueList.includes(type.name));
  }

  private filterRepresentativeTypesByConditions(
    isLegalContact: boolean,
    initialList: IdValue[],
    legalContactsValueList: string[],
  ): IdValue[] {
    const insertProbateLocalCounselOnlyRoles = [];
    const relationship: IdValue = this.form.get('relationshipType').value;
    const result = initialList.filter(type => {
      if (this.probateLocalCounselOnlyRoles.has(type.name)) {
        if (StringHelper.equal(relationship?.name, 'Probate Local Counsel')) {
          insertProbateLocalCounselOnlyRoles.push(type);
        }
        return false;
      }
      return isLegalContact === legalContactsValueList.includes(type.name);
    });
    if (insertProbateLocalCounselOnlyRoles.length) {
      result.unshift(...insertProbateLocalCounselOnlyRoles);
    }
    return result;
  }

  private updatePermissionsForLegalContact() {
    if (this.relationship?.isLegalContact) {
      const editLegalContactsPermission = PermissionService.create(PermissionTypeEnum.LegalContacts, PermissionActionTypeEnum.Edit);

      this.editAssociationPermission.push(editLegalContactsPermission);
      this.personRelationshipDeletePermission.push(editLegalContactsPermission);
    }
  }

  private resetError() {
    this.store.dispatch(fromContacts.actions.ResetStateError());
  }

  onSave() {
    if (!this.personTemplate.validate() || this.form.invalid) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      super.validate();
      this.store.dispatch(FormInvalid());
      return;
    }
    if (this.saveStarted) {
      this.saveStarted();
    }
    const newRelationship: PersonContact = <PersonContact>{
      person: { ...this.personTemplate.person },
      isLegalContact: this.form.value.isLegalContact,
      relationshipType: this.form.value.relationshipType?.id,
      representativeType: this.form.value.representativeType?.id,
      description: this.form.value.description,
      specialInstructions: this.form.value.specialInstructions,
      isPaidOnBehalfOfClaimant: this.form.value.isPaidOnBehalfOfClaimant,
      percentageAllocation: this.form.value.percentageAllocation,
      amountAllocation: this.form.value.amountAllocation,
      paymentMethodId: this.form.value.paymentMethod,
      memoText: this.form.value.checkMemo,
      clientId: this.claimantId,
      isPrimaryContact: this.personTemplate.form.get('isPrimaryContact').value,
      isReleaseSignatureRequired: this.form.value.isReleaseSignatureRequired,
      additionalInfo: this.form.value.additionalInfo,
      isCsSignatureRequired: this.form.value.isCsSignatureRequired,
      nameOnCheck: this.form.value.nameOnCheck,
    };

    if (this.relationship?.id) {
      newRelationship.id = this.relationship.id;
      newRelationship.parentPersonId = this.relationship.parentPersonId;
      this.store.dispatch(fromContacts.actions.UpdateContact({ relationship: newRelationship, modal: this.modal }));
    } else {
      newRelationship.isSkipDuplicateChecking = this.skipDuplicateChecking;
      this.store.dispatch(fromContacts.actions.CreateContact({ relationship: newRelationship, modal: this.modal }));
    }
  }

  setSkipDuplicateChecking() {
    this.skipDuplicateChecking = true;
  }

  public onLink() {
    const initialState = {
      title: 'Link Existing',
      parentPersonId: this.parentPersonId,
      claimantId: this.claimantId,
      modal: this.modal,
    };

    this.modalService.show(ContactsLinkExistingComponent, {
      initialState,
      class: 'link-modal',
    });
  }

  onDelete(): void {
    this.store.dispatch(fromContacts.actions.DeleteContactsRequest({ clientContactId: this.relationship.id }));
  }

  onEdit(): void {
    this.canEdit = true;
  }

  onRelationshipTypeChanged() {
    const role = this.form.get('representativeType');
    role.setValue(null);
    role.updateValueAndValidity();
  }

  updateContactModel(): void {
    const { value } = this.form;
    const newContact = <PersonContact> {
      isLegalContact: value.isLegalContact,
      relationshipType: value.relationshipType,
      representativeType: value.representativeType,
      description: value.description,
      specialInstructions: value.specialInstructions,
      isPaidOnBehalfOfClaimant: value.isPaidOnBehalfOfClaimant,
      percentageAllocation: value.percentageAllocation,
      amountAllocation: value.amountAllocation,
      paymentMethodId: value.paymentMethod,
      memoText: value.checkMemo,
      isReleaseSignatureRequired: value.isReleaseSignatureRequired,
      additionalInfo: value.additionalInfo,
      isCsSignatureRequired: value.isCsSignatureRequired,
      nameOnCheck: value.nameOnCheck,
    };

    this.store.dispatch(
      fromContacts.actions.UpdateContactModel({ contact: newContact }),
    );
  }

  loadFullSsn(): void {
    if (this.personTemplate.isSsnLoaded) {
      this.store.dispatch(fromContacts.actions.GetPersonFullSSN({ personId: this.relationship?.person.id }));
    }
  }

  filterFromSelectOptions(options: SelectOption[], id: number): SelectOption {
    if (!!options && options.length > 0) {
      const selectedOptions = options?.filter(i => i.id === id);
      const option: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
      return option;
    }
    return null;
  }

  ngOnDestroy() {
    this.resetError();
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
    this.store.dispatch(fromContacts.actions.ResetPersonFullSSN());
    this.store.dispatch(fromContacts.actions.ResetPersonContact());
  }
}
