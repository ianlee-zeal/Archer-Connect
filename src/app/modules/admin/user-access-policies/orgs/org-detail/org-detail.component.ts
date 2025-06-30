/* eslint-disable no-restricted-globals */
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Validators, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';

import * as fromRoot from '@app/state';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { Entity } from '@app/modules/shared/_interfaces/entity';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { Email, IdValue, Org, Phone, User } from '@app/models';
import { EmailsListComponent } from '@app/modules/shared/emails-list/emails-list.component';
import { PhonesListComponent } from '@app/modules/shared/phones-list/phones-list.component';
import * as services from '@app/services';
import { MessageService, ValidationService, PermissionService, ModalService } from '@app/services';

import * as commonActions from '@app/modules/shared/state/common.actions';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import { SatisfactionRatingHelper } from '@app/helpers/satisfaction-rating-helper.helper';
import { UserSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/user-selection-modal.component';
import { GetArcherOrgId } from '@app/modules/claimants/claimant-details/state/actions';
import { archerId } from '@app/modules/claimants/claimant-details/state/selectors';
import * as userRoleActions from '../state/actions';
import * as fromAccessPolicies from '../../access-policies/state/selectors';
import * as fromOrgs from '../state';
import { OrganizationTabHelper } from '../organization-tab.helper';
import * as accessPoliciesActions from '../../access-policies/state/actions';

@Component({
  selector: 'app-org-detail',
  templateUrl: './org-detail.component.html',
})
export class OrgDetailComponent extends Editable implements OnInit, OnDestroy {
  @ViewChild(EmailsListComponent) emailsComponent: EmailsListComponent;
  @ViewChild(PhonesListComponent) phonesComponent: PhonesListComponent;

  public item$ = this.store.select(fromOrgs.item);
  public item: Org;
  public error$ = this.store.select(fromOrgs.error);
  public orgTypesValues$ = this.store.select(fromRoot.organizationTypeDropdownValues);
  public orgAccessPolicies$ = this.store.select(fromAccessPolicies.accessPoliciesIndex);
  public archerId$ = this.store.select(archerId);

  private ngUnsubscribe$ = new Subject<void>();

  private archerId: number;
  public entityParams: Entity;
  public todaysDate: Date = new Date();

  public get canCreateSatisfactionRating(): boolean {
    return this.permissionService.canCreate(PermissionTypeEnum.OrganizationRating) && !this.fg.get('satisfactionRating').value;
  }

  public get canEditSatisfactionRating(): boolean {
    return this.permissionService.canEdit(PermissionTypeEnum.OrganizationRating) && this.fg.get('satisfactionRating').value;
  }
  public canReadSatisfactionRating = this.permissionService.canRead(PermissionTypeEnum.OrganizationRating);

  protected readonly canReadAccessPolicy = this.permissionService.canRead(PermissionTypeEnum.AccessPolicies);

  readonly canEditAccountManager = this.permissionService.canEdit(PermissionTypeEnum.OrganizationAccountManager);
  readonly canEditClientRelationshipSpecialist = this.permissionService.canEdit(PermissionTypeEnum.OrganizationClientRelationshipSpecialist);

  public fg = this.fb.group({
    name: ['', [Validators.required, ValidationService.noWhitespaceBeforeTextValidator, Validators.minLength(4), Validators.maxLength(255)]],
    legalName: ['', [ValidationService.noWhitespaceBeforeTextValidator, Validators.minLength(4), Validators.maxLength(255)]],
    satisfactionRating: null,
    altName: ['', [ValidationService.noWhitespaceBeforeTextValidator, Validators.minLength(4), Validators.maxLength(255)]],
    website: ['', [ValidationService.noWhitespaceValidator, Validators.minLength(4), Validators.maxLength(255)]],
    nameOnCheck: ['', [Validators.minLength(4), Validators.maxLength(100)]],
    erpVendorName: ['', [Validators.maxLength(100)]],
    code: ['', [ValidationService.noWhitespaceValidator, Validators.minLength(4), Validators.maxLength(25)]],
    taxId: ['', [ValidationService.noWhitespaceValidator, Validators.maxLength(10)]],
    primaryOrgTypeId: null,
    w9Date: [null, [this.dateValidator.valid, this.dateValidator.notFutureDate]],
    w9OnFile: false,
    accessPolicyId: null,
    active: false,
    emails: [],
    phones: [],
    accountManager: null,
    accountManagerId: null,
    accountManagerDto: null,
    clientRelationshipSpecialist: null,
    clientRelationshipSpecialistId: null,
    clientRelationshipSpecialistDto: null,
    aslpCashAcctNumber: ['', [ValidationService.noWhitespaceValidator, Validators.maxLength(20)]]
  });

  public get hasEditNameOnCheckPermission(): boolean {
    return this.permissionService.canEdit(PermissionTypeEnum.NameOnCheck);
  }

  public get hasEditERPVendorNamePermission(): boolean {
    return this.permissionService.canEdit(PermissionTypeEnum.ERPVendorName);
  }

  protected get hasChanges(): boolean {
    if (!this.canEdit) {
      return false;
    }

    return this.validationForm.dirty
      || this.emailsComponent?.validationForm.dirty
      || this.phonesComponent?.validationForm.dirty
      || !this.validationForm.pristine;
  }

  get org(): Org {
    return this.fg.value;
  }

  protected get validationForm(): UntypedFormGroup {
    return this.fg;
  }

  public satisfactionRatingList = SatisfactionRatingHelper.getSatisfactionRatingList();

  constructor(
    private store: Store<fromOrgs.AppState>,
    private fb: UntypedFormBuilder,
    private dateValidator: DateValidator,
    private toaster: services.ToastService,
    private messageService: MessageService,
    private permissionService: PermissionService,
    private readonly modalService: ModalService,
    private readonly actionsSubject: ActionsSubject,
  ) {
    super();
  }

  ngOnInit(): void {
    this.store.dispatch(GetArcherOrgId());
    this.archerId$.pipe(
      filter((id: number) => !!id),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((id: number) => {
      this.archerId = id;
    });
    this.handleOrganizationDetails(true);

    this.store.dispatch(userRoleActions.UpdatePreviousOrgUrl({ orgPreviousUrl: history.state.orgPreviousUrl }));

    this.canEdit = window.history.state.edit;
  }

  onEmailsChanged(emails: Email[]): void {
    this.fg.patchValue({ emails });
    this.updateOrgState(this.org);
  }

  onPhonesChanged(phones: Phone[]): void {
    this.fg.patchValue({ phones });
    this.updateOrgState(this.org);
  }

  onChange(): void {
    this.updateOrgState(this.org);
  }

  onSave(): void {
    if (this.validate()) {
      this.store.dispatch(userRoleActions.SaveOrg({ callback: () => { this.canEdit = false; } }));
    } else {
      this.store.dispatch(commonActions.FormInvalid());
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  validate(): boolean {
    return super.validate()
      && this.emailsComponent.validate()
      && this.phonesComponent.validate();
  }

  private onDelete(): void {
    this.messageService.showDeleteConfirmationDialog(
      'Confirm delete',
      'Are you sure you want to delete selected organizations?',
    )
      .subscribe((answer: boolean) => {
        if (answer) {
          this.delete();
        }
      });
  }

  private delete(): void {
    this.canEdit = false;
    this.store.dispatch(userRoleActions.DeleteOrgs({
      ids: [this.item.id],
      callback: () => this.onCancel(),
    }));
  }

  private onCancel(): void {
    if (this.canEdit) {
      this.canEdit = false;
      this.store.dispatch(userRoleActions.RefreshOrg());
      this.actionsSubject.pipe(
        ofType(userRoleActions.RefreshOrgComplete.type),
        first(),
      ).subscribe(() => this.handleOrganizationDetails());
    } else {
      OrganizationTabHelper.handleBackClick(this.store);
    }
  }

  private updateOrgState = (org: Org): void => {
    this.store.dispatch(userRoleActions.UpdateOrg({ item: { ...org } }));
    this.fg.markAsDirty();
  };

  private handleOrganizationDetails(updateActionBar = false): void {
    this.item$
      .pipe(
        first((item: Org) => !!item),
      )
      .subscribe((org: Org) => {
        this.item = org;
        this.entityParams = {
          entityId: org.id,
          entityType: EntityTypeEnum.Organizations,
        };

        this.fg.patchValue({
          ...org,
          accountManager: org.accountManager?.displayName,
          accountManagerDto: org.accountManager,
          clientRelationshipSpecialist: org.clientRelationshipSpecialist?.displayName,
          clientRelationshipSpecialistDto: org.clientRelationshipSpecialist,
        });
        this.fg.markAsPristine();

        if (org.w9OnFile) {
          this.fg.controls.w9Date.setValidators([Validators.required, this.dateValidator.valid, this.dateValidator.notFutureDate]);
          if (this.fg.controls.w9Date.invalid) {
            this.fg.controls.w9Date.setErrors({ customMessage: 'Organization has W-9 on File, W-9 Date is required.' });
          }
        }

        if(this.canReadAccessPolicy) {
          this.store.dispatch(accessPoliciesActions.GetAccessPolicies({ orgId: this.item.id }));
          this.store.dispatch(accessPoliciesActions.UpdateAccessPolicyOrgId({ orgId: this.item.id }));
        }
        if (updateActionBar) {
          this.updateActionBar();
        }
      });
  }

  private updateActionBar(): void {
    this.store.dispatch(userRoleActions.UpdateOrgsActionBar({
      actionBar: {
        edit: {
          ...this.editAction(),
          permissions: this.item?.parentOrgId
            ? services.PermissionService.create(PermissionTypeEnum.SubOrganizations, PermissionActionTypeEnum.Edit)
            : services.PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Edit),
        },
        save: {
          callback: () => this.onSave(),
          hidden: () => !this.canEdit,
          disabled: () => this.canLeave,
          awaitedActionTypes: [
            userRoleActions.SaveOrgComplete.type,
            userRoleActions.Error.type,
            commonActions.FormInvalid.type,
          ],
        },
        delete: {
          callback: () => this.onDelete(),
          permissions: this.item?.parentOrgId
            ? services.PermissionService.create(PermissionTypeEnum.SubOrganizations, PermissionActionTypeEnum.Delete)
            : services.PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Delete),
          disabled: () => this.item && this.item.isMaster,
        },
        back: {
          callback: () => this.onCancel(),
          disabled: () => !this.canLeave,
        },
        cancel: {
          callback: () => this.onCancel(),
          hidden: () => !this.canEdit,
        },
      },
    }));
  }

  protected isRequired(controlName: string): boolean {
    const control = this.fg.get(controlName);
    return control?.hasValidator(Validators.required) ?? false;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public getDefaultValue(id: number, values: IdValue[]): string {
    if (!id) {
      return null;
    }

    return values.find((item: IdValue) => item.id === id)?.name;
  }

  public onOpenModal(controlName: string): void {
    this.modalService.show(UserSelectionModalComponent, {
      initialState: {
        onEntitySelected: (user: User) => this.onUserSelect(user, controlName),
        orgId: this.archerId,
      },
      class: 'user-selection-modal',
    });
  }

  private onUserSelect(user: User, controlName: string): void {
    this.fg.patchValue({
      [controlName]: user.displayName,
      [`${controlName}Id`]: user.id,
      [`${controlName}Dto`]: user,
    });

    this.updateOrgState(this.org);
    this.fg.updateValueAndValidity();
    this.fg.markAsDirty();
  }

  public onClear(controlName: string): void {
    const idColumn = `${controlName}Id`;
    this.fg.patchValue({ [controlName]: null, [idColumn]: null });
    this.fg.updateValueAndValidity();
    this.fg.markAsDirty();
    this.org[controlName] = null;
    this.org[idColumn] = null;
    this.updateOrgState(this.org);
  }
}
