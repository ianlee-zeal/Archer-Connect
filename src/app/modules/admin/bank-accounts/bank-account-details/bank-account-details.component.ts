import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { ValidationService } from '@app/services/validation.service';
import { BankAccount, Address, Country, AddressState, Org } from '@app/models';
import { ServerErrorService, PermissionService } from '@app/services';
import { BankAccountStatus } from '@app/models/enums/bank-account-status.enum';
import { TypeAheadHelper } from '@app/helpers/type-ahead.helper';
import { bankAccountTypesDropdownValues, AppState } from '@app/state/index';
import { statesDropdownValues, countriesDropdownValues } from '@app/state';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { BankAccountFormatEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { Hidable } from '@app/modules/shared/_functions/hidable';
import * as commonActions from '@app/modules/shared/state/common.actions';
import * as fromOrgs from '@app/modules/admin/user-access-policies/orgs/state';
import * as organizationActions from '@app/modules/admin/user-access-policies/orgs/state/actions';
import * as services from '@app/services';
import { StringHelper } from '@app/helpers/string.helper';
import { ofType } from '@ngrx/effects';
import { PrimaryOrgTypeEnum } from '@app/models/enums/primary-org-type.enum';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import { UrlHelper } from '@app/helpers/url-helper';
import { item } from '../state/selectors';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { TooltipPositionEnum } from '@app/models/enums/tooltip-position.enum'
import { BankAccountSettings } from '@app/models/bank-account-settings';
import { DragAndDropComponent } from '../../../shared/drag-and-drop/drag-and-drop.component';
import { FileHelper } from '@app/helpers/file.helper';
import { authSelectors } from '@app/modules/auth/state';

@Component({
  selector: 'app-bank-account-details',
  templateUrl: './bank-account-details.component.html',
  styleUrls: ['./bank-account-details.component.scss'],
})
export class BankAccountDetailsComponent extends Editable implements OnInit, OnDestroy {
  @ViewChild(DragAndDropComponent) public readonly dragAndDropComponent: DragAndDropComponent;

  public isAccountNumberLoaded$ = this.store.select(selectors.isAccountNumberLoaded);
  public isFfcAccountLoaded$ = this.store.select(selectors.isFfcAccountLoaded);
  public selectedOrg$ = this.store.select(fromOrgs.item);
  private readonly isLoggingOut$ = this.store.select(authSelectors.isLoggingOut);
  public bankAccountFormatEnum = BankAccountFormatEnum;
  public errorMessage: string = null;
  public todaysDate: Date = new Date();
  bankAccountSettings$ = this.store.select(selectors.bankAccountSettings);
  bankAccountSettings: BankAccountSettings;

  stateSearch = (search$: Observable<string>) => TypeAheadHelper.search(this.states, search$);
  countrySearch = (search$: Observable<string>) => TypeAheadHelper.search(this.countries, search$);
  countryValidator = (control: AbstractControl) => TypeAheadHelper.getValidationError(control, this.countries);
  stateValidator = (control: AbstractControl) => TypeAheadHelper.getValidationError(control, this.states);

  private wireABARoutingNumberValidators = [Validators.required, Validators.minLength(9), Validators.maxLength(9), ValidationService.onlyNumbersValidator];
  private clearingAccountValidators = [Validators.minLength(4), Validators.maxLength(255)];
  private swiftValidators = [Validators.required, Validators.minLength(8), ValidationService.swiftCodeValidator];
  public clearingAccountsRequired: boolean;

  public accountNumberReadPermissions = PermissionService.create(
    PermissionTypeEnum.BankAccountNumber,
    PermissionActionTypeEnum.Read,
  );
  public accountNumberEditPermissions = [
    this.accountNumberReadPermissions,
    PermissionService.create(PermissionTypeEnum.BankAccountNumber, PermissionActionTypeEnum.Edit),
  ];

  public ffcAccountReadPermissions = PermissionService.create(
    PermissionTypeEnum.BankAccountFfcAccount,
    PermissionActionTypeEnum.Read,
  );
  public ffcAccountEditPermissions = [
    this.ffcAccountReadPermissions,
    PermissionService.create(PermissionTypeEnum.BankAccountFfcAccount, PermissionActionTypeEnum.Edit),
  ];

  public form: UntypedFormGroup = new UntypedFormGroup({
    bankAccountFormat: new UntypedFormControl(BankAccountFormatEnum.US, [Validators.required]),
    bankAccountName: new UntypedFormControl('', [Validators.required, ValidationService.noWhitespaceBeforeTextValidator, Validators.maxLength(255)]),
    name: new UntypedFormControl('', [Validators.required, ValidationService.noWhitespaceBeforeTextValidator, Validators.maxLength(255)]),
    accountNumber: new UntypedFormControl('', [Validators.required, ValidationService.bankAccountValidator]),
    wireABARoutingNumber: new UntypedFormControl('', this.wireABARoutingNumberValidators),
    achabaRoutingNumber: new UntypedFormControl('', [ValidationService.onlyNumbersValidator, Validators.minLength(9), Validators.maxLength(9)]),
    ffcAccount: new UntypedFormControl(''),
    accountType: new UntypedFormControl(null, Validators.required),
    status: new UntypedFormControl(true),
    nextCheckNumber: new UntypedFormControl('', [Validators.minLength(6), ValidationService.onlyNumbersValidator, ValidationService.maxIntValidator]),
    nextWireNumber: new UntypedFormControl('', [Validators.minLength(7), ValidationService.onlyNumbersValidator, ValidationService.maxIntValidator]),
    dateVerifiedWithFirm: new UntypedFormControl(null, [this.dateValidator.valid,this.dateValidator.notFutureDate]),
    firmContactProvidingVerification: new UntypedFormControl('', Validators.maxLength(255)),
    swift: new UntypedFormControl('', ValidationService.swiftCodeValidator),
    clearingBankName: new UntypedFormControl('', Validators.maxLength(255)),
    clearingAccount: new UntypedFormControl('', this.clearingAccountValidators),
    bankName: new UntypedFormControl('', [Validators.required, Validators.maxLength(50), ValidationService.noWhitespaceBeforeTextValidator]),
    bankPhone: new UntypedFormControl('', Validators.required),
    bankLineOne: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
    bankLineTwo: new UntypedFormControl('', Validators.maxLength(255)),
    bankCity: new UntypedFormControl('', [Validators.required, Validators.maxLength(60), ValidationService.onlyAlphabetics]),
    bankState: new UntypedFormControl('', [Validators.required, Validators.maxLength(10), ValidationService.onlyAlphabetics]),
    bankZip: new UntypedFormControl('', [Validators.required, Validators.maxLength(20), ValidationService.zipCodeValidator]),
    bankCountryName: new UntypedFormControl('', this.countryValidator),
    bankCountry: new UntypedFormControl(''),
    bankContactName: new UntypedFormControl('', Validators.maxLength(255)),
  });

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  get hasChanges(): boolean {
    return this.form.dirty;
  }

  public get isQSF(): boolean {
    return this.organization?.primaryOrgTypeId === PrimaryOrgTypeEnum.QSF;
  }

  public get bankAccountFormatName(): string {
    switch (this.bankAccount.bankAccountFormat) {
      case BankAccountFormatEnum.US:
        return 'United States';
      case BankAccountFormatEnum.International:
        return 'International';
      default:
        return '';
    }
  }

  public get isBankAccountFormatUS(): boolean {
    return this.form.controls.bankAccountFormat.value == BankAccountFormatEnum.US;
  }

  public bankAccount: BankAccount = new BankAccount({ bankAddress: new Address() });

  public bankAccountId = null;

  private ngUnsubscribe$ = new Subject<void>();

  public bankAccountTypes = [];

  public states: AddressState[] = [];

  public countries: Country[] = [];

  public allowBankAccountNumberEditing = false;

  public allowFfcAccountEditing = false;

  public isCreatingNewBankAccount = false;

  isUpdateACHABARoutingNumber = false;

  private organization: Org;

  public banksAccNameTooltip: string = 'Beneficiary/Recipient account name, should match the account name on file with the bank, used in payment request';
  public connectAccNameTooltip: string = 'User friendly account name for use when selecting bank accounts within Connect';
  public accNameTooltip: string = 'Beneficiary/Recipient account name';
  public accNumberTooltip: string = 'Beneficiary/Recipient account number';
  public wireRoutingNumberTooltip: string = 'US accounts only - Beneficiary/Recipient routing number';
  public swiftCodeTooltip: string = 'International accounts only - Beneficiary/Recipient SWIFT number';
  public clearingBankNameTooltip: string = 'International accounts only - Intermediary bank handling the transaction';
  public clearingAccountTooltip: string = 'International accounts only - Intermediary bank handling the transaction, can be US bank account or SWIFT Code';
  public tooltipPosition: TooltipPositionEnum = TooltipPositionEnum.Right;

  constructor(
    private readonly store: Store<AppState>,
    private readonly route: ActivatedRoute,
    private readonly serverErrorService: ServerErrorService,
    private readonly toaster: services.ToastService,
    private readonly dateValidator: DateValidator,
    private readonly actionsSubj: ActionsSubject,
    private router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    this.updateBankAccountActionBarInStore();
    this.subscribeAccountNumberLoaded();
    this.subscribeFfcAccountLoaded();
    this.subscribeToDropdownValues();
    this.subscribeToBankAccount();
    this.subscribeToSettings();

    const orgId = UrlHelper.getId(this.router.url, 4);
    this.store.dispatch(actions.GetBankAccountSettings({ orgId: orgId }));

    this.isCreatingNewBankAccount = StringHelper.equal(this.route.routeConfig.path, 'new');
    this.canEdit = this.isCreatingNewBankAccount || window.history.state.canEdit;

    if (this.isCreatingNewBankAccount) {
      this.allowBankAccountNumberEditing = true;
      this.allowFfcAccountEditing = true;
      this.isUpdateACHABARoutingNumber = true;
      this.setNewBankAccountInStore();
    } else {
      this.route.parent.parent.params
        .pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe(params => {
          this.isUpdateACHABARoutingNumber = true;
          this.bankAccountId = params.id;
          this.seedExistingBankAccountIntoForm();
        });
    }

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.SaveBankAccountError,
        actions.CreateBankAccountError,
      ),
    ).subscribe(data => {
      this.serverErrorService.showServerErrors(this.form, data);

      const formErrors = this.serverErrorService.getFormErrors('BankAccount', data.error);
      if (formErrors.length) {
        this.errorMessage = formErrors[0];
      }

      this.store.dispatch(commonActions.FormInvalid());
      this.canEdit = true;
      this.form.markAllAsTouched();
      this.isSavePerformed = false;
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.SaveBankAccountSuccess,
        actions.CreateBankAccountComplete,
      ),
    ).subscribe(() => {
      this.canEdit = false;
      this.allowBankAccountNumberEditing = false;
      this.allowFfcAccountEditing = false;
      this.isUpdateACHABARoutingNumber = false;
      this.isSavePerformed = true;
    });

    combineLatest([this.isLoggingOut$, this.selectedOrg$])
    .pipe(takeUntil(this.ngUnsubscribe$))
    .subscribe(([isLoggingOut, org]) => {
      if (isLoggingOut) {
        return;
      }

      if (!org) {
        const orgId = UrlHelper.getId(this.router.url, 4);
        this.store.dispatch(organizationActions.GetOrg({ id: orgId }));
      } else {
        this.organization = org;
        if (this.isQSF) {
          const validators = [Validators.required, Validators.minLength(7), ValidationService.onlyNumbersValidator, ValidationService.maxIntValidator];
          this.form.get('nextWireNumber').setValidators(validators);
        }
      }
    });
  }

  public setBankAccountFormatValidations(value: BankAccountFormatEnum): void {
    const { wireABARoutingNumber, swift } = this.form.controls;
    switch (value) {
      case BankAccountFormatEnum.US:
        wireABARoutingNumber.setValidators(this.wireABARoutingNumberValidators);
        wireABARoutingNumber.enable();

        swift.setValidators([ValidationService.swiftCodeValidator]);
        break;
      case BankAccountFormatEnum.International:
        wireABARoutingNumber.setValidators(null);
        wireABARoutingNumber.patchValue(null);
        wireABARoutingNumber.disable();

        swift.setValidators(this.swiftValidators);
        break;
      default:
        return;
    }
    swift.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  public setClearingAccountValidations(clearingAccountValue: string, clearingBankNameValue: string): void {
    const { clearingAccount, clearingBankName } = this.form.controls;
    if (StringHelper.isEmpty(clearingAccountValue)
      && StringHelper.isEmpty(clearingBankNameValue)) {
      clearingAccount.setValidators(this.clearingAccountValidators);
      clearingBankName.setValidators([]);
      this.clearingAccountsRequired = false;
    } else {
      clearingAccount.setValidators([Validators.required, ...this.clearingAccountValidators]);
      clearingBankName.setValidators([Validators.required]);
      this.clearingAccountsRequired = true;
    }
    this.form.updateValueAndValidity();
  }

  public seedExistingBankAccountIntoForm(): void {
    this.store.dispatch(actions.GetBankAccountDetails({ accountId: this.bankAccountId }));
    this.store.select(item).pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(bankAccount => {
      this.form.patchValue({
        ...bankAccount,
        name: bankAccount.name,
        status: bankAccount.statusActive,
        accountType: bankAccount.accountTypeId,
      });

      if (bankAccount.bankAddress) {
        this.form.patchValue({
          bankLineOne: bankAccount.bankAddress.line1,
          bankLineTwo: bankAccount.bankAddress.line2,
          bankCity: bankAccount.bankAddress.city,
          bankZip: bankAccount.bankAddress.zip,
          bankState: bankAccount.bankAddress.state,
        });

        if (bankAccount.bankAddress.country) {
          this.form.patchValue({
            bankCountryName: bankAccount.bankAddress.country.name,
            bankCountry: bankAccount.bankAddress.country,
          });
        }
      }
      if (!this.canEdit) {
        this.form.markAsPristine({ onlySelf: true });
      }
    });
  }

  public onChange(): void {
    const lastBankAccount: BankAccount = {
      ...this.bankAccount,
      id: this.bankAccount.id ? this.bankAccount.id : null,
      orgId: this.bankAccount.orgId ? this.bankAccount.orgId : null,
      bankAccountName: this.form.controls.bankAccountName.value ? this.form.controls.bankAccountName.value : null,
      name: this.form.controls.name.value ? this.form.controls.name.value : null,
      bankName: this.form.controls.bankName.value ? this.form.controls.bankName.value : null,
      accountNumber: this.form.controls.accountNumber.value ? this.form.controls.accountNumber.value : null,
      statusActive: this.form.controls.status.value ? this.form.controls.status.value : null,
      accountTypeId: this.form.controls.accountType.value ? this.form.controls.accountType.value : null,
      wireABARoutingNumber: this.form.controls.wireABARoutingNumber.value ? this.form.controls.wireABARoutingNumber.value : null,
      ffcAccount: this.form.controls.ffcAccount.value ? this.form.controls.ffcAccount.value : null,
      nextCheckNumber: this.form.controls.nextCheckNumber.value ? this.form.controls.nextCheckNumber.value : null,
      nextWireNumber: this.form.controls.nextWireNumber.value ? this.form.controls.nextWireNumber.value : null,
      bankPhone: this.form.controls.bankPhone.value ? this.form.controls.bankPhone.value : null,
      swift: this.form.controls.swift.value ? this.form.controls.swift.value : null,
      dateVerifiedWithFirm: this.form.controls.dateVerifiedWithFirm.value ? this.form.controls.dateVerifiedWithFirm.value : null,
      bankContactName: this.form.controls.bankContactName.value ? this.form.controls.bankContactName.value : null,
      firmContactProvidingVerification: this.form.controls.firmContactProvidingVerification.value ? this.form.controls.firmContactProvidingVerification.value : null,
      clearingAccount: this.form.controls.clearingAccount.value ? this.form.controls.clearingAccount.value : null,
      clearingBankName: this.form.controls.clearingBankName.value ? this.form.controls.clearingBankName.value : null,
      achabaRoutingNumber: this.form.controls.achabaRoutingNumber.value ? this.form.controls.achabaRoutingNumber.value : null,
      bankAccountFormat: this.form.controls.bankAccountFormat.value ? this.form.controls.bankAccountFormat.value : null,
      bankAddress: {
        id: this.bankAccount.bankAddress?.id,
        line1: this.form.controls.bankLineOne.value ? this.form.controls.bankLineOne.value : null,
        line2: this.form.controls.bankLineTwo.value ? this.form.controls.bankLineTwo.value : null,
        city: this.form.controls.bankCity.value ? this.form.controls.bankCity.value : null,
        state: this.form.controls.bankState.value ? this.form.controls.bankState.value : null,
        country: this.form.controls.bankCountry.value,
        zip: this.form.controls.bankZip.value ? this.form.controls.bankZip.value : null,
        lastVerifiedDateTime: null,
        dataSourceId: this.bankAccount.bankAddress?.dataSourceId,
        dataSourceName: this.bankAccount.bankAddress?.dataSourceName,
        createdBy: this.bankAccount.bankAddress?.createdBy,
        createdDate: this.bankAccount.createdDate,
      },
    };
    let updateAccNum = false;
    if (lastBankAccount.bankAccountFormat != this.bankAccount.bankAccountFormat) {
      if (lastBankAccount.bankAccountFormat == this.bankAccountFormatEnum.International) {
        lastBankAccount.wireABARoutingNumber = '';
      } else {
        this.form.controls.wireABARoutingNumber.markAsDirty();
      }
      if (!this.allowBankAccountNumberEditing && this.form.dirty) {
        updateAccNum = true;
      }
    }

    this.store.dispatch(actions.UpdateBankAccount({ bankAccount: lastBankAccount }));
    if (updateAccNum) {
      this.store.dispatch(actions.GetAccountNumber({ accountId: this.bankAccountId }));
    }
  }

  public onCountryChange(event): void {
    const search = event.srcElement.value;
    const country = TypeAheadHelper.get(this.countries, search.toLowerCase());

    this.form.patchValue({
      bankCountryName: country ? country.name : search,
      bankCountry: country,
    });
  }

  public save(): void {
    this.errorMessage = null;
    if (super.validate()) {
      this.store.dispatch(actions.SaveBankAccount({
        bankAccount: this.bankAccount,
        isUpdateAccountNumber: this.allowBankAccountNumberEditing,
        isUpdateFfcAccount: this.allowFfcAccountEditing,
        isUpdateACHABARoutingNumber: this.isUpdateACHABARoutingNumber,
        w9File: this.dragAndDropComponent?.selectedFile
      }));
    } else {
      this.store.dispatch(commonActions.FormInvalid());
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  public approve(): void {
    this.store.dispatch(actions.ApproveBankAccount());
  }

  public reject(): void {
    this.store.dispatch(actions.RejectBankAccount());
  }

  public cancel(): void {
    if (this.canEdit && this.bankAccountId) {
      this.errorMessage = null;
      this.canEdit = false;
      this.allowBankAccountNumberEditing = false;
      this.allowFfcAccountEditing = false;
      this.isUpdateACHABARoutingNumber = false;
      this.store.dispatch(actions.GetBankAccountDetails({ accountId: this.bankAccountId }));
    }
  }

  protected edit(): void {
    super.edit();

    this.allowBankAccountNumberEditing = false;
    this.allowFfcAccountEditing = false;
    this.isUpdateACHABARoutingNumber = true;
    this.isSavePerformed = false;
  }

  public viewFullBankAccountNumber(): void {
    this.store.dispatch(actions.GetAccountNumber({ accountId: this.bankAccountId }));
  }

  public viewFullFfcAccount(): void {
    this.store.dispatch(actions.GetFfcAccount({ accountId: this.bankAccountId }));
  }

  public formatToHidableNumber(value: string, showFullValue: boolean): string {
    return showFullValue ? value : Hidable.hideNumber(value?.toString(), 9);
  }

  public setNoWhitespaceValidator(field: string, minLength = 9): void {
    this.form.controls[field].setValidators([ValidationService.noWhitespaceValidator, Validators.minLength(minLength)]);
  }

  private setNewBankAccountInStore(): void {
    this.store.dispatch(actions.UpdateBankAccount({ bankAccount: new BankAccount({ bankAddress: new Address() }) }));
  }

  private subscribeToBankAccount(): void {
    this.store.select(item).pipe(
      filter((x: BankAccount) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((bankAccount: BankAccount) => {
      this.bankAccount = bankAccount;
      this.setBankAccountFormatValidations(bankAccount.bankAccountFormat);
      this.setClearingAccountValidations(bankAccount.clearingAccount, bankAccount.clearingBankName);
    });
  }

  subscribeToSettings(): void {
    this.bankAccountSettings$
      .pipe(
        filter(settings => !!settings),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(settings => {
        this.bankAccountSettings = { ...settings };
      });
  }

  public setBankAccountBankAccountName(): void {
    if (this.isCreatingNewBankAccount) {
      const connectAccountName = this.form.get('name');
      if (!connectAccountName.value) {
        connectAccountName.setValue(this.form.get('bankAccountName').value);
      }
    }
  }

  private subscribeAccountNumberLoaded(): void {
    this.isAccountNumberLoaded$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((isAccountNumberLoaded: boolean) => {
        this.allowBankAccountNumberEditing = isAccountNumberLoaded;
        if (this.isCreatingNewBankAccount) {
          this.allowBankAccountNumberEditing = true;
        }
        if (isAccountNumberLoaded && !this.isCreatingNewBankAccount) {
          this.form.controls.accountNumber.markAsDirty();
        }
      });
  }

  private subscribeFfcAccountLoaded(): void {
    this.isFfcAccountLoaded$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(value => {
        this.allowFfcAccountEditing = value;
      });
  }

  private updateBankAccountActionBarInStore(): void {
    this.store.dispatch(actions.UpdateBankAccountsActionBar({
      actionBar: {
        save: {
          callback: () => this.save(),
          disabled: () => this.canLeave,
          hidden: () => !this.canEdit,
          permissions: PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.Edit),
          awaitedActionTypes: [
            actions.SaveBankAccountSuccess.type,
            actions.Error.type,
            commonActions.FormInvalid.type,
          ],
        },
        edit: {
          ...this.editAction(),
          permissions: PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.Edit),
        },
        approve: {
          callback: () => this.approve(),
          disabled: () => (this.bankAccount ? this.bankAccount.statusId === BankAccountStatus.setupComplete : true),
          permissions: PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.Approve),
          awaitedActionTypes: [
            actions.GetBankAccountDetailsComplete.type,
            actions.Error.type,
          ],
        },
        reject: {
          callback: () => this.reject(),
          disabled: () => (this.bankAccount ? this.bankAccount.statusId === BankAccountStatus.rejected || this.bankAccount.statusId === BankAccountStatus.pending : true),
          permissions: PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.Reject),
          awaitedActionTypes: [
            actions.GetBankAccountDetailsComplete.type,
            actions.Error.type,
          ],
        },
        back: {
          callback: () => this.goToBankAccounts(),
          disabled: () => !this.canLeave,
        },
        cancel: {
          callback: () => this.cancel(),
          hidden: () => !this.canEdit,
          disabled: () => !this.hasChanges,
        },
      },
    }));
  }

  public saveField = (name: string, value: any) => {
    this.store.dispatch(actions.SaveBankAccountField({
      accountId: this.bankAccount.id,
      fieldName: name,
      value: value,
    }));
  }

  public validateNumber(minLength: number) {
    return (name: string, value: string) => {
      if (!value.match(/^\d+$/)) return ValidationService.getValidatorErrorMessage('onlyNumbers', {});
      if (value.length < minLength) return ValidationService.getValidatorErrorMessage('minlength', { requiredLength: minLength });
      if (+value > 2147483647) return ValidationService.getValidatorErrorMessage('maxInt', {});
      return null;
    };
  }

  private goToBankAccounts(): void {
    this.store.dispatch(organizationActions.GoToOrganizationBankAccounts({ organizationId: this.organization.id }));
  }

  private subscribeToDropdownValues(): void {
    this.store.select(bankAccountTypesDropdownValues).pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(results => {
      this.bankAccountTypes = results;
    });

    this.store.select(statesDropdownValues).pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(results => {
      this.states = <AddressState[]>results;
    });

    this.store.select(countriesDropdownValues).pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(results => {
      this.countries = <Country[]>results;
    });
  }

  selectFile(files: File[]): void {
    for (const file of files) {
      if (file.size > this.bankAccountSettings.maxW9FileSizeInBytes) {
        this.toaster.showError(`File: ${file.name} exceeds the size limit of ${FileHelper.bytesToMegabytes(this.bankAccountSettings.maxW9FileSizeInBytes)} MB`);
        this.dragAndDropComponent.selectedFile = null;
        continue;
      }
      this.form.markAsDirty();
    };
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.store.dispatch(actions.ResetIsAccountNumberLoaded());
  }
}
