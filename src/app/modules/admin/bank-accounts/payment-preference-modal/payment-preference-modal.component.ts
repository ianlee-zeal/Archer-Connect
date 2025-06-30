import { IdValue, Org, PaymentPreferencesItem, Project } from '@app/models';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormControl, AbstractControl } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalService, ServerErrorService, PermissionService } from '@app/services';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { AppliedPaymentTypeEnum } from '@app/models/enums/applied-payment-type.enum';
import { PaymentLevelEnum } from '@app/models/enums/payment-level.enum';
import { ActionsSubject, Store } from '@ngrx/store';
import { AppState } from '@app/state/index';
import { orgTypesSelectors } from '@app/modules/admin/user-access-policies/orgs/state/selectors';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ofType } from '@ngrx/effects';
import { PaymentItemType, PaymentMethodEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ProjectSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/project-selection-modal.component';
import { ClaimantSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/claimant-selection-modal.component';
import { Claimant } from '@app/models/claimant';
import { TooltipPositionEnum } from '@app/models/enums/tooltip-position.enum';
import * as actions from '../state/actions';
import { QsfOrgSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/qsf-org-selection-modal.component'
import { OrgType } from '@app/models/enums/org-type.enum'
import { OrgIdNameAlt } from '@app/models/orgIdNameAlt'
import * as orgActions from '@app/modules/admin/user-access-policies/orgs/state/actions';

@Component({
  selector: 'app-payment-preference-modal',
  templateUrl: './payment-preference-modal.component.html',
  styleUrls: ['./payment-preference-modal.component.scss'],
})
export class PaymentPreferenceModalComponent extends ValidationForm implements OnInit, OnDestroy {
  public orgId: number;
  public paymentPreferencesItem: PaymentPreferencesItem;
  public title: string;
  public hasTransferToSubAccountPermission: boolean = false;

  public subQsfBankAccounts: IdValue[] = [];

  public projectsList$ = this.store.select(orgTypesSelectors.projectsList);
  public bankAccountsList$ = this.store.select(orgTypesSelectors.bankAccountsList);
  public defaultPaymentAddress$ = this.store.select(orgTypesSelectors.defaultPaymentAddress);
  private ngUnsubscribe$ = new Subject<void>();
  public tooltipText: string = 'If this option is chosen, then ledgers created under this project will have the Primary Firm as the default payee for the Claimant Net';
  public tooltipPosition: TooltipPositionEnum = TooltipPositionEnum.Right;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get getStatus(): boolean {
    return this.form.get('active').value === true;
  }

  public get isProject(): boolean {
    return this.form.get('levelId').value === PaymentLevelEnum.Project;
  }

  public get isClaimant(): boolean {
    return this.form.get('levelId').value === PaymentLevelEnum.Claimant;
  }

  public get isWire(): boolean {
    return this.form.get('paymentMethodId').value === PaymentMethodEnum.Wire;
  }

  public get isCheck(): boolean {
    return this.form.get('paymentMethodId').value === PaymentMethodEnum.Check;
  }

  public get isClaimantNet(): boolean {
    return this.form.get('paymentItemTypeId').value === PaymentItemType.Claimant;
  }

  public get isDisabled(): boolean {
    return !this.form.valid || !this.form.dirty;
  }

  public get showEnableNetToFirmByDefault(): boolean {
    return this.isProject && this.isClaimantNet;
  }

  public get isTransferToSubAccChecked(): boolean {
    return this.form.get('transferToSubAccount').value === true;
  }

  public get qsfOrgControl(): AbstractControl {
    return this.form.get('qsfOrg');
  }

  public get qsfOrgIdControl(): AbstractControl {
    return this.form.get('qsfOrgId');
  }

  public get paymentMethodIdControl(): AbstractControl {
    return this.form.get('paymentMethodId');
  }

  public get qsfBankAccountIdControl(): AbstractControl {
    return this.form.get('qsfBankAccountId');
  }

  public get isHideTransferSubAccField(): boolean {
    return !this.hasTransferToSubAccountPermission || !this.isTransferToSubAccChecked;
  }

  public levelsList: IdValue[] = [
    { id: PaymentLevelEnum.GlobalDefault, name: 'Global Default' },
    { id: PaymentLevelEnum.Project, name: 'Project' },
    { id: PaymentLevelEnum.Claimant, name: 'Claimant' },
  ];

  public paymentTypes: IdValue[] = [
    { id: AppliedPaymentTypeEnum.Default, name: 'Default' },
    { id: AppliedPaymentTypeEnum.Lien, name: 'Lien Payment' },
    { id: AppliedPaymentTypeEnum.CBF, name: 'CBF' },
    { id: AppliedPaymentTypeEnum.Claimant, name: 'Claimant Net' },
    { id: AppliedPaymentTypeEnum.MDL, name: 'MDL' },
    { id: AppliedPaymentTypeEnum.PrimaryFirmExpenses, name: 'Primary Firm Expenses' },
    { id: AppliedPaymentTypeEnum.PrimaryFirmFees, name: 'Primary Firm Fees' },
    { id: AppliedPaymentTypeEnum.ReferringFirmExpenses, name: 'Referring Firm Expenses' },
    { id: AppliedPaymentTypeEnum.ReferringFirmFees, name: 'Referring Firm Fees' },
    { id: AppliedPaymentTypeEnum.SettlementCounselExpenses, name: 'Settlement Firm Expenses' },
    { id: AppliedPaymentTypeEnum.SettlementCounselFees, name: 'Settlement Firm Fees' },
    { id: AppliedPaymentTypeEnum.Vendor, name: 'Vendor' },
  ];

  public methodsList: IdValue[] = [
    { id: PaymentMethodEnum.Wire, name: 'Wire' },
    { id: PaymentMethodEnum.Check, name: 'Check' },
  ];

  readonly awaitedSubmitActionTypes = [
    actions.CreatePaymentPreferenceComplete.type,
    actions.UpdatePaymentPreferenceComplete.type,
    actions.Error.type,
    FormInvalid.type,
  ];

  public form: UntypedFormGroup = new UntypedFormGroup({
    levelId: new UntypedFormControl(null, Validators.required),
    case: new UntypedFormControl(null),
    caseId: new UntypedFormControl(null),
    client: new UntypedFormControl(null),
    clientId: new UntypedFormControl(null),
    paymentItemTypeId: new UntypedFormControl(null, Validators.required),
    paymentMethodId: new UntypedFormControl(null, Validators.required),
    bankAccountId: new UntypedFormControl(null),
    addressId: new UntypedFormControl(null),
    active: new UntypedFormControl(true),
    furtherCreditAccount: new UntypedFormControl(null),
    enableNetToFirmByDefault: new UntypedFormControl(false),
    transferToSubAccount: new UntypedFormControl(false),
    qsfOrg: new UntypedFormControl(null),
    qsfOrgId: new UntypedFormControl(null),
    qsfBankAccountId: new UntypedFormControl(null),
    transferFFC: new UntypedFormControl(null),
  });

  public removableInputWidth = '420';

  constructor(
    private store: Store<AppState>,
    public modal: BsModalRef,
    public serverErrorService: ServerErrorService,
    private actionsSubj: ActionsSubject,
    private modalService: ModalService,
    private permissionService: PermissionService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.hasTransferToSubAccountPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferToSubAccount));
    if (this.paymentPreferencesItem) {
      this.form.patchValue({
        levelId: this.patchLevel(this.paymentPreferencesItem),
        caseId: this.paymentPreferencesItem?.caseId,
        clientId: this.paymentPreferencesItem?.clientId,
        paymentItemTypeId: this.paymentPreferencesItem?.paymentItemTypeId || AppliedPaymentTypeEnum.Default,
        paymentMethodId: this.paymentPreferencesItem?.paymentMethodId,
        bankAccountId: this.paymentPreferencesItem?.bankAccountId,
        addressId: this.paymentPreferencesItem?.address?.id,
        active: this.paymentPreferencesItem.active,
        furtherCreditAccount: this.paymentPreferencesItem.furtherCreditAccount,
        enableNetToFirmByDefault: this.paymentPreferencesItem.enableNetToFirmByDefault,
        transferToSubAccount: this.paymentPreferencesItem.transferToSubAccount,
        qsfOrgId: this.paymentPreferencesItem.qsfOrgId,
        qsfOrg: this.paymentPreferencesItem.qsfOrg,
        qsfBankAccountId: this.paymentPreferencesItem.qsfBankAccountId,
        qsfBankAccount: this.paymentPreferencesItem.qsfBankAccount,
        transferFFC: this.paymentPreferencesItem.transferFFC,
      });
      if (this.paymentPreferencesItem.qsfBankAccountId) {
        this.loadSubQsfBankAccounts(this.paymentPreferencesItem.qsfOrgId)
      }
      if (this.paymentPreferencesItem.transferToSubAccount) {
        this.paymentMethodIdControl.setValidators(null);
        this.qsfOrgControl.setValidators(Validators.required);
        this.qsfOrgIdControl.setValidators(Validators.required);
        this.form.updateValueAndValidity();
      }
      if (this.paymentPreferencesItem.caseId) {
        const project = new Project();
        project.id = this.paymentPreferencesItem.caseId;
        project.name = this.paymentPreferencesItem.case.name;
        this.form.get('caseId').setValidators(Validators.required);
        if (this.paymentPreferencesItem.clientId) {
          const client = new Claimant();
          client.id = this.paymentPreferencesItem.clientId;
          client.fullName = this.paymentPreferencesItem.client.fullName;
          client.project = project;
          this.form.get('clientId').setValidators(Validators.required);
          this.onClaimantSelected(client, 'client', 'clientId');
        } else this.onProjectSelected(project, 'case', 'caseId');
        this.form.markAsPristine();
      }
    }


    this.subscribeToTransferSubAccountChanges();
    this.subscribeToSubQsfOrgChanges();
    this.subscribeToSubQsfBankAccountsList();

    this.form.get('levelId').valueChanges.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((level: PaymentLevelEnum) => {
      const control = this.form.get('caseId');
      const checkboxControl = this.form.get('enableNetToFirmByDefault');
      const claimantControl = this.form.get('clientId');
      if (level === PaymentLevelEnum.Project) {
        control.setValidators(Validators.required);
        claimantControl.setValidators(null);
        claimantControl.setValue(null);
      } else if (level === PaymentLevelEnum.Claimant) {
        control.setValidators(Validators.required);
        claimantControl.setValidators(Validators.required);
      } else {
        control.setValidators(null);
        control.setValue(null);
        checkboxControl.setValue(false);
        claimantControl.setValidators(null);
        claimantControl.setValue(null);
      }
      claimantControl.updateValueAndValidity();
      control.updateValueAndValidity();
      checkboxControl.updateValueAndValidity();
    });

    this.form.get('paymentItemTypeId').valueChanges.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter((paymentItemTypeId: PaymentItemType) => paymentItemTypeId !== PaymentItemType.Claimant),
    ).subscribe(() => {
      const checkboxControl = this.form.get('enableNetToFirmByDefault');
      checkboxControl.setValue(false);
      checkboxControl.updateValueAndValidity();
    });

    this.paymentMethodIdControl.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((method: PaymentMethodEnum) => {
      const bankAccountControl = this.form.get('bankAccountId');
      const paymentAddressControl = this.form.get('addressId');

      if (this.isTransferToSubAccChecked) {
        bankAccountControl.setValidators(null);
        bankAccountControl.setValue(null);
        paymentAddressControl.setValidators(null);
        paymentAddressControl.setValue(null);
      } else {
        if (method === PaymentMethodEnum.Wire) {
          bankAccountControl.setValidators(Validators.required);
          paymentAddressControl.setValidators(null);
          paymentAddressControl.setValue(null);
        } else {
          paymentAddressControl.setValidators(Validators.required);
          bankAccountControl.setValidators(null);
          bankAccountControl.setValue(null);
        }
      }

      bankAccountControl.updateValueAndValidity();
      paymentAddressControl.updateValueAndValidity();
    });

    this.actionsSubj.pipe(
      ofType(
        actions.CreatePaymentPreferenceComplete,
        actions.UpdatePaymentPreferenceComplete,
      ),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.onCancel();
    });
  }

  public onCancel(): void {
    this.modal.hide();
  }

  public onSubmit(): void {
    if (super.validate()) {
      const paymentPreference: PaymentPreferencesItem = new PaymentPreferencesItem({
        ...this.form.getRawValue(),
        orgId: this.orgId,
      });
      /* eslint-disable @typescript-eslint/dot-notation */
      delete paymentPreference['case'];
      delete paymentPreference['client'];

      if (this.paymentPreferencesItem?.id) {
        paymentPreference.id = this.paymentPreferencesItem.id;
      }

      if (paymentPreference.paymentItemTypeId === AppliedPaymentTypeEnum.Default) {
        paymentPreference.paymentItemTypeId = null;
      }

      const action = this.paymentPreferencesItem ? actions.UpdatePaymentPreference : actions.CreatePaymentPreference;
      this.store.dispatch(action({ paymentPreference }));
    }
  }

  public onOpenProjectModal(): void {
    if (this.isClaimant) return;
    this.modalService.show(ProjectSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Project) => this.onProjectSelected(entity, 'case', 'caseId'),
      },
      class: 'entity-selection-modal',
    });
  }

  private onOrgSelect(org: Org, name: string, id: string, showAltName: boolean = false) {
    let orgName = showAltName ? OrgIdNameAlt.getQsfOrgName(org.name, org.altName) : org.name;

    this.form.patchValue({ [name]: orgName, [id]: org.id });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  public onOpenQSFModal(): void {
    this.modalService.show(QsfOrgSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Org) => this.onOrgSelect(entity, 'qsfOrg', 'qsfOrgId', true),
        orgTypeIds: [OrgType.QualifiedSettlementFund],
        title: 'Qualified Settlement Fund Selection',
      },
      class: 'qsf-org-selection-modal',
    });
  }

  private onProjectSelected(project: Project, name: string, id: string): void {
    this.form.patchValue({ [name]: project.name, [id]: project.id });
    this.form.patchValue({ 'client': null, [`clientId`]: null });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  public onOpenClaimantModal(): void {
    this.modalService.show(ClaimantSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Claimant) => this.onClaimantSelected(entity, 'client', 'clientId'),
      },
      class: 'entity-selection-modal',
    });
  }

  private onClaimantSelected(claimant: Claimant, name: string, id: string): void {
    const client = !claimant.project ? Claimant.toModel(claimant) : claimant;
    this.form.patchValue({ [name]: client.fullName, [id]: client.id });
    this.form.patchValue({ 'case': client.project.name, 'caseId': client.project.id });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  private patchLevel(paymentPreferences: PaymentPreferencesItem): PaymentLevelEnum {
    if (paymentPreferences.isGlobal === !!PaymentLevelEnum.GlobalDefault) {
      return PaymentLevelEnum.GlobalDefault;
    }
    if (paymentPreferences.clientId) {
      return PaymentLevelEnum.Claimant;
    }
    return PaymentLevelEnum.Project;
  }

  private subscribeToTransferSubAccountChanges(): void {
    this.form.get('transferToSubAccount').valueChanges.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((newValue: boolean) => {
      if (newValue) {
        this.paymentMethodIdControl.setValidators(null);
        this.paymentMethodIdControl.setValue(null);
        this.qsfOrgControl.setValidators(Validators.required);
        this.qsfOrgIdControl.setValidators(Validators.required);
      } else {
        this.paymentMethodIdControl.setValidators(Validators.required);
        this.qsfOrgControl.setValidators(null);
        this.qsfOrgControl.setValue(null);
        this.qsfOrgIdControl.setValidators(null);
        this.qsfOrgIdControl.setValue(null);
      }
      this.paymentMethodIdControl.updateValueAndValidity();
      this.qsfOrgControl.updateValueAndValidity();
      this.qsfOrgIdControl.updateValueAndValidity();
    });
  }

  private subscribeToSubQsfOrgChanges(): void {
    this.qsfOrgIdControl.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((newValue: number | null) => {
      if (newValue != null) {
        this.loadSubQsfBankAccounts(newValue);
      } else {
        this.qsfBankAccountIdControl.setValue(null);
        this.store.dispatch(orgActions.ClearSubQsfBankAccountsList());
        this.subQsfBankAccounts = [];
      }
    });
  }

  private loadSubQsfBankAccounts(qsfOrgId: number): void {
    this.store.dispatch(orgActions.GetSubQsfBankAccountsList({ qsfOrgId: qsfOrgId }));
  }

  private subscribeToSubQsfBankAccountsList(): void {
    this.actionsSubj.pipe(
      ofType(
        orgActions.GetSubQsfBankAccountsListComplete,
      ),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(res => {
      this.subQsfBankAccounts = res.bankAccountsList;
    });
  }

  public onClear(controlName: string): void {
    this.form.patchValue({ [controlName]: null, [`${controlName}Id`]: null });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
