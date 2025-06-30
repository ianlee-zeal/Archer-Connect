/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-underscore-dangle */
// #region Imports
import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, ChangeDetectorRef, ViewRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { CommonHelper } from '@app/helpers/common.helper';
import { LedgerEntry, LedgerAccountGroup, LedgerAccount, ChartOfAccount, ChartOfAccountSettings } from '@app/models/closing-statement';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { ModalService, PermissionService, MessageService } from '@app/services';
import { IdValue, Org } from '@app/models';
import { LPMHelper } from '@app/helpers/lpm.helper';
import {
  PermissionActionTypeEnum,
  LedgerAccountGroup as LedgerAccountGroupEnum,
  ChartOfAccountType as ChartOfAccountTypeEnum,
  ClaimSettlementLedgerEntryStatus,
  ChartOfAccountType,
  PaymentTypeEnum,
  EntityTypeEnum,
  LedgerAccountEnum,
  AttyExpenseNonGrouping,
} from '@app/models/enums';
import { LedgerEntryService } from '@app/services/ledger-entry.service';
import { LedgerEntryStatusReadablePipe } from '@app/modules/shared/_pipes';
import { FormulaSetsEnum } from '@app/models/enums/ledger-settings/formula-sets.enum';
import moment from 'moment-timezone';
import { LedgerAccountGroupService } from '@app/services/ledger/ledger-account-group.service';
import { PercentageHelper } from '@app/helpers';
import { LedgerEntryInfoModalComponent } from '../additional-info-modal/ledger-entry-info-modal.component';
// #endregion Imports
@Component({
  selector: 'app-ledger-account-group',
  templateUrl: './ledger-account-group.component.html',
  styleUrls: ['./ledger-account-group.component.scss'],
  providers: [LedgerAccountGroupService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LedgerAccountGroupComponent extends ValidationForm implements OnInit, OnDestroy {
  // #region Input/Output params
  @Output() accountGroupChanged = new EventEmitter<{ group: LedgerAccountGroup, formEvent: boolean }>();

  /** Account Group with entries */
  @Input() accountGroup: LedgerAccountGroup;

  /** Ledger Id */
  @Input() ledgerId: number;

  /** Project Id */
  @Input() projectId: number;

  /** List of all posible chart of accounts or payee organizations for this AccGroup */
  @Input() entryOptions: ChartOfAccount[] | IdValue[];

  /** List of all posible payee organizations for this AccGroup */
  @Input() orgOptions: Org[];

  /** List of all posible credits for this AccGroup */
  @Input() creditOptions: ChartOfAccount[];

  /** List of all posible holdbacks for this AccGroup */
  @Input() nonGroupedOptions: ChartOfAccount[];

  /** Chart Of Account Settings */
  @Input() chartOfAccSettings: ChartOfAccountSettings[];

  /** If true, validation will ask for 100% percentage and doesn't allow to have empty accounts */
  @Input() isRequired: boolean = true;

  @Input() validateLienCredits: boolean = false;

  /** Formula set id */
  @Input() formulaSetId: number;

  @Input() public defaultPayeeId: number;

  // #endregion Input/Output params

  // #region Setters and Getters

  /** Account group is editable if True. Read Ony and Edit mode. Also, permissions */
  @Input()
  public set readOnly(value: boolean) {
    this._readOnly = value;
    setTimeout(() => this.validateAll());
  }

  public get readOnly(): boolean {
    return this._readOnly || !this.isAccGroupSettingEnabled;
  }

  /** Flag to be able to edit entries.
   * If Edit mode On and the user has permissions this flag not allow to edit for example Claimant Disbursements or other not editable groups */
  @Input()
  public set canEditEntry(value: any) {
    this._canEditEntry = CommonHelper.setShortBooleanProperty(value);
  }

  public get canEditEntry(): boolean {
    return !this.readOnly && this._canEditEntry;
  }

  /** Flag to manage accounts */
  @Input()
  public set canEditAccount(value: any) {
    this._canEditAccount = CommonHelper.setShortBooleanProperty(value);
  }

  public get canEditAccount(): boolean {
    return !this.readOnly && this._canEditAccount;
  }

  public canEditAccountName(entry: LedgerEntry): boolean {
    return this.canEditAccount
      && (this.hasEditPermissions || this.hasCreatePermissions)
      && (!AttyExpenseNonGrouping.includes(entry.accountNo));
  }

  /** Flag to be able to edit amount */
  @Input()
  public set canEditAmount(value: any) {
    this._canEditAmount = CommonHelper.setShortBooleanProperty(value);
  }

  public get canEditAmount(): boolean {
    return !this.readOnly && this._canEditAmount;
  }

  /** Flag to be able to edit percentage */
  @Input()
  public set canEditPercentage(value: any) {
    this._canEditPercentage = CommonHelper.setShortBooleanProperty(value);
  }

  public get canEditPercentage(): boolean {
    return !this.readOnly && this._canEditPercentage;
  }

  /** Show percentage input */
  @Input()
  public set canShowPercentage(value: any) {
    this._canShowPercentage = CommonHelper.setShortBooleanProperty(value);
  }

  public get canShowPercentage(): boolean {
    return this._canShowPercentage;
  }

  /** Show accountNo before entry name if True */
  @Input()
  public set canShowAccNoForEntry(value: any) {
    this._canShowAccNoForEntry = CommonHelper.setShortBooleanProperty(value);
  }

  public get canShowAccNoForEntry(): boolean {
    return this._canShowAccNoForEntry;
  }

  /** Hide account level record. Will display only entry items if True */
  @Input()
  public set isAccountless(value: any) {
    this._isAccountless = CommonHelper.setShortBooleanProperty(value);
  }

  public get isAccountless(): boolean {
    return this._isAccountless;
  }

  /** Allow account group to add duplicated entries if True */
  @Input()
  public set canAddDuplicateEntries(value: any) {
    this._canAddDuplicateEntries = CommonHelper.setShortBooleanProperty(value);
  }

  public get canAddDuplicateEntries(): boolean {
    return this._canAddDuplicateEntries;
  }

  /** Allow to check enabled sub-accounts  */
  @Input()
  public set checkEnabledSubAccounts(value: any) {
    this._checkEnabledSubAccounts = CommonHelper.setShortBooleanProperty(value);
  }

  public get checkEnabledSubAccounts(): boolean {
    return this._checkEnabledSubAccounts;
  }

  public get isInvalid(): boolean {
    return this.form.invalid;
  }

  public get canRemoveEntry(): boolean {
    return !this._readOnly && this._canEditEntry && this.permissionService.has(this.ledgerGroupService.getPermission(PermissionActionTypeEnum.Delete, this.accountGroup));
  }

  public get hasEditPermissions(): boolean {
    return this.permissionService.has(this.ledgerGroupService.getPermission(PermissionActionTypeEnum.Edit, this.accountGroup));
  }

  public get hasCreatePermissions(): boolean {
    return this.permissionService.has(this.ledgerGroupService.getPermission(PermissionActionTypeEnum.Create, this.accountGroup));
  }

  public get isAttyExpenses(): boolean {
    return this.accountGroup?.accountGroupNo === LedgerAccountGroupEnum.AttyExpenses;
  }

  public get isChartOfAccountEntryType(): boolean {
    return this.isAttyExpenses || this.isAccountless;
  }

  public groupByPayees(entry: LedgerEntry): boolean {
    if (AttyExpenseNonGrouping.includes(entry.accountNo)) return false;
    return !this.isChartOfAccountEntryType && !this.ledgerEntryService.isPaid(entry);
  }

  public get isRelatedEntityType(): boolean {
    return this.accountGroup?.accountGroupNo === this.ledgerAccountGroupEnum.Liens;
  }

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get canEdit(): boolean {
    return !!this.accountGroupChanged.observers.length;
  }

  public get isAttyFees(): boolean {
    return this.accountGroup?.accountGroupNo === LedgerAccountGroupEnum.AttyFees;
  }

  public get isMDL(): boolean {
    return this.accountGroup?.accountGroupNo === LedgerAccountGroupEnum.MDL;
  }

  public get isCBF(): boolean {
    return this.accountGroup?.accountGroupNo === LedgerAccountGroupEnum.CommonBenefit;
  }

  public get isFormuslaSetV1(): boolean {
    return this.formulaSetId === FormulaSetsEnum.FormulaSetV1;
  }

  public get isFormuslaSetV2(): boolean {
    return this.formulaSetId === FormulaSetsEnum.FormulaSetV2;
  }

  public get accounts(): UntypedFormArray {
    return this.form.get('accounts') as UntypedFormArray;
  }

  // #endregion Setters and Getters

  public ledgerAccountGroupEnum = LedgerAccountGroupEnum;
  public ledgerAccountEnum = LedgerAccountEnum;
  public paymentTypeEnum = PaymentTypeEnum;
  public entryFilteredOptions: IdValue[] = [];
  public orgFilteredOptions: IdValue[] = [];
  public creditFilteredOptions: IdValue[] = [];
  public percentFractionDigits: number = 8;
  public form: UntypedFormGroup;
  public showErrorTooltip: boolean = false;

  private ngUnsubscribe$ = new Subject<void>();

  private isAccGroupSettingEnabled: boolean;

  private _canEditEntry: boolean;
  private _canEditAccount: boolean;
  private _canEditAmount: boolean;
  private _canEditPercentage: boolean;
  private _canShowPercentage: boolean;
  private _canShowAccNoForEntry: boolean;
  private _isAccountless: boolean;
  private _canAddDuplicateEntries: boolean;
  private _readOnly: boolean;
  private _checkEnabledSubAccounts: boolean;

  constructor(
    private fb: UntypedFormBuilder,
    private permissionService: PermissionService,
    private modalService: ModalService,
    private readonly changeRef: ChangeDetectorRef,
    private messageService: MessageService,
    public readonly ledgerEntryService: LedgerEntryService,
    private ledgerEntryStatusReadablePipe: LedgerEntryStatusReadablePipe,
    private readonly ledgerGroupService: LedgerAccountGroupService,
  ) {
    super();
  }

  // #region Public methods
  public ngOnInit(): void {
    this.isAccGroupSettingEnabled = !!this.chartOfAccSettings?.find((i: ChartOfAccountSettings) => i.chartOfAccount.accountGroupNo === this.accountGroup?.accountGroupNo)?.active;
    this.patchAccountGroup(this.accountGroup);

    this.orgFilteredOptions = this.orgOptions;
    this.creditFilteredOptions = this.creditOptions?.map((i: ChartOfAccount) => this.ledgerGroupService.getChartOfAccountTitle(i));

    if (this.isChartOfAccountEntryType) {
      this.entryFilteredOptions = (this.entryOptions as ChartOfAccount[])?.map((i: ChartOfAccount) => this.ledgerGroupService.getChartOfAccountTitle(i));
    } else {
      this.entryFilteredOptions = this.entryOptions;
    }
  }

  public canCreateEntry(account: LedgerAccount): boolean {
    const canEdit = this.canEditEntry
    && this.hasCreatePermissions
    && this.canAddSubAccount(account);

    if (this.isAttyFees) {
      // Hides "Add" when 50010 entry exists AND when 50011 entry does too
      const singleEntryAccount = [LedgerAccountEnum.PrimaryFirmFees.toString(), LedgerAccountEnum.ReferringFirmFees.toString()];

      if (singleEntryAccount.includes(account.accountNo) && canEdit && account.entries?.length > 0) {
        return false;
      }

      return account.canEditAttyFirmFeesEntry && canEdit;
    }

    if (AttyExpenseNonGrouping.includes(account.accountNo)) {
      return canEdit && !account.entries?.length && this.isAccountEnabled(account);
    }

    return canEdit;
  }

  public canEditPercentageField(entry: LedgerEntry, account: LedgerAccount): boolean {
    const canEdit = (this.ledgerGroupService.canUpdateEntryByStatus(entry) || entry.canEditAuthorizedAttyFeesPercentage)
    && this.canEditPercentage
    && this.hasEditPermissions
    && !this.ledgerEntryService.isPaid(entry);

    if (this.isAttyFees) {
      return account.canEditAttyFirmFeesEntry && canEdit;
    }

    return canEdit;
  }

  public canEditAmountField(entry: LedgerEntry, account: LedgerAccount): boolean {
    const canEdit = this.ledgerGroupService.canUpdateEntryByStatus(entry)
    && this.canEditEntryAmount(account)
    && this.hasEditPermissions
    && !this.ledgerEntryService.isPaid(entry);

    if (this.isAttyFees) {
      return account.canEditAttyFirmFeesEntry && canEdit;
    }

    return canEdit;
  }

  public canEditDescriptionField(entry: LedgerEntry): boolean {
    return (this.ledgerGroupService.canUpdateEntryByStatus(entry) || (this.isFormuslaSetV1 && this.ledgerEntryService.isEntryPaymentAuthorized(entry)))
    && !this.readOnly
    && this.hasEditPermissions;
  }

  public canRemoveLedgerEntry(entry: LedgerEntry): boolean {
    return this.ledgerGroupService.canUpdateEntryByStatus(entry)
    && this.canRemoveEntry
    && !this.ledgerEntryService.isPaid(entry);
  }

  public canEditEntryName(entry: LedgerEntry): boolean {
    const result = (this.ledgerGroupService.canUpdateEntryByStatus(entry) || entry.canEditAttyFields)
    && this.canEditEntry
    && (this.hasEditPermissions || this.hasCreatePermissions)
      && !this.ledgerEntryService.isPaid(entry)
      && !AttyExpenseNonGrouping.includes(entry.accountNo);
    return result;
  }

  public canShowEditRelatedEntry(entry: LedgerEntry, account: LedgerAccount): boolean {
    return this.ledgerGroupService.canUpdateEntryByStatus(entry)
    && this.canEditEntryAmount(account)
    && (this.hasEditPermissions || this.hasCreatePermissions)
    && !this.ledgerEntryService.isPaid(entry)
    && this.ledgerEntryService.canEditRelatedEntity(entry)
    && this.isRelatedEntityType;
  }

  public canShowEntryPercentage(account: LedgerAccount): boolean {
    return this.canShowPercentage && account.accountNo !== LedgerAccountGroupEnum.AttyFeesHoldback;
  }

  public canEditEntryAmount(account: LedgerAccount): boolean {
    return this.canEditAmount || (!this.readOnly && account.accountNo === LedgerAccountGroupEnum.AttyFeesHoldback);
  }

  public canEditCreditEntryName(entry: LedgerEntry): boolean {
    return this.ledgerGroupService.canUpdateEntryByStatus(entry)
      && this.canEditEntry
      && (this.hasEditPermissions || this.hasCreatePermissions)
      && !AttyExpenseNonGrouping.includes(entry.accountNo);
  }

  public canEditCreditEntryAmount(entry: LedgerEntry): boolean {
    return this.ledgerGroupService.canUpdateEntryByStatus(entry) && !this.readOnly && (this.hasEditPermissions || this.hasCreatePermissions);
  }

  public canEditCreditEntryDescription(entry: LedgerEntry): boolean {
    return this.ledgerGroupService.canUpdateEntryByStatus(entry) && !this.readOnly && (this.hasEditPermissions || this.hasCreatePermissions);
  }

  public canRemoveCreditEntry(entry: LedgerEntry): boolean {
    return this.ledgerGroupService.canUpdateEntryByStatus(entry) && this.canRemoveEntry;
  }

  public canRemoveAccount(entry: LedgerEntry): boolean {
    return this.ledgerGroupService.canUpdateEntryByStatus(entry) && this.canRemoveEntry && this._canEditAccount;
  }

  public payeeOptions(entry: LedgerEntry): IdValue[] {
    const options = (entry.accountNo == null) ? this.orgFilteredOptions : this.entryFilteredOptions;
    return options;
  }

  public currentTotalPercentage(account: LedgerAccount, currentValue?: number): number {
    return this.ledgerGroupService.currentTotalPercentage(account, this.accountGroup, currentValue);
  }

  public detectChanges(): void {
    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      this.changeRef.detectChanges();
    }
  }

  // It should be transformed to Pipe
  public getEntryTitle(entry: LedgerEntry): string {
    if (this.isCreditAccount(entry.accountType)) {
      return `${entry.accountNo} - ${entry.name}`;
    }

    if (this.accountGroup?.accountGroupNo === LedgerAccountGroupEnum.AttyFees) {
      return entry.name;
    }

    return this.canShowAccNoForEntry && entry.accountNo
      ? `${entry.accountNo} - ${entry.name}`
      : entry.name;
  }

  public isCreditAccount(accountType: ChartOfAccountTypeEnum | string): boolean {
    return accountType === ChartOfAccountTypeEnum.Credit;
  }

  public useFullAccountName(account: LedgerAccount): boolean {
    return !this.isCreditAccount(account.accountType) || account.accountNo === LedgerAccountEnum.AttyExpenseHoldbackCredit;
  }

  public canShowWarningSign(entry: LedgerEntry): boolean {
    if (this.isAttyFees && !this.isCreditAccount(entry.accountType)) {
      return false;
    }

    return !entry.active;
  }

  public isMustBe100PercentAcc(account: LedgerAccount): boolean {
    const entries = this.getEntries(account.accountNo, account.payeeOrgId, account.accountType);
    if (!entries) {
      return false;
    }
    return this.canShowPercentage
      && ((this.isAttyFees || this.isMDL || this.isCBF) && this.isRequired)
      && !this.isCreditAccount(account.accountType)
      && this.isAccGroupSettingEnabled
      && !!entries.length
      && account.accountNo !== LedgerAccountGroupEnum.AttyFeesHoldback;
  }

  public isCannotExceed100PercentAcc(account: LedgerAccount): boolean {
    const entries = this.getEntries(account.accountNo, account.payeeOrgId, account.accountType);
    if (!entries) {
      return false;
    }
    return this.canShowPercentage
      && !this.isCreditAccount(account.accountType)
      && this.isAccGroupSettingEnabled
      && this.isRequired
      && !!entries.length
      && account.accountNo !== LedgerAccountGroupEnum.AttyFeesHoldback;
  }

  public entryIsRequired(account: LedgerAccount): boolean {
    return this.isAttyExpenses && !account?.entries?.length && account?.accountNo !== LedgerAccountEnum.AttyExpenseHoldback;
  }

  public addAccount(accountGroup: LedgerAccountGroupEnum): void {
    const newAccount = <LedgerAccount>{
      accountGroupNo: accountGroup,
      accountNo: null,
      name: null,
      id: 0,
    };

    const index = this.accounts.value.filter((a: LedgerAccount) => a.accountNo == null).length;
    this.accounts.insert(index, this.createAccountFormGroup(newAccount));
    this.raiseLedgersChangedEvent(false);
  }

  public onChange(): void {
    this.raiseLedgersChangedEvent();
  }

  public onAddEntry(account: LedgerAccount): void {
    const entries = this.getEntries(account.accountNo, account.payeeOrgId, account.accountType);
    const chartOfAccount = this.getChartOfAccount(account);
    const isNonGrouping = AttyExpenseNonGrouping.includes(account.accountNo);
    const nonAttyFeeChartOfAccountId = isNonGrouping ? chartOfAccount.id : null;

    const ledgerEntry = <LedgerEntry>{
      id: 0,
      accountNo: account.accountNo,
      accountGroupNo: account.accountGroupNo,
      accountType: chartOfAccount?.accountType,
      chartOfAccountId: this.isAttyFees ? account.id : nonAttyFeeChartOfAccountId,
      claimSettlementLedgerId: this.ledgerId,
      payeeOrgId: account.payeeOrgId,
      active: true,
      amount: null,
      paidAmount: 0,
      name: isNonGrouping ? chartOfAccount.name : null,
      percentage: null,
      relatedEntityTypeId: this.ledgerGroupService.getRelatedEntityTypeId(account),
      createdDate: moment.utc(Date.now()).toDate(),
      includeInGLBalance: chartOfAccount?.includeInGLBalance,
    };
    const newEntry = this.createEntryFormGroup(
      ledgerEntry,
      account,
    );

    entries.push(newEntry);
    this.detectChanges();
    this.raiseLedgersChangedEvent(false);
  }

  public onAddCredit(accountCtrl: AbstractControl): void {
    const account: LedgerAccount = accountCtrl.value;
    const chartOfAccount = this.getChartOfAccount(account);
    const isNonGrouping = AttyExpenseNonGrouping.includes(account.accountNo);

    const entries = accountCtrl.get('entries') as UntypedFormArray;
    const newEntry = this.createEntryFormGroup(
      <LedgerEntry>{
        id: 0,
        amount: 0,
        percentage: 0,
        paidAmount: 0,
        accountNo: account.accountNo,
        accountGroupNo: account.accountGroupNo,
        claimSettlementLedgerId: this.ledgerId,
        accountType: ChartOfAccountTypeEnum.Credit,
        chartOfAccountId: isNonGrouping ? chartOfAccount.id : null,
        name: isNonGrouping ? chartOfAccount.name : null,
        active: true,
        createdDate: moment.utc(Date.now()).toDate(),
        includeInGLBalance: this.isAttyFees ? false : chartOfAccount?.includeInGLBalance,
      },
      account,
    );

    entries.push(newEntry);
    this.raiseLedgersChangedEvent(false);
  }

  public onSelectEntryOpen(selectedEntries: LedgerEntry[]): void {
    if (this.canAddDuplicateEntries) {
      return;
    }

    this.entryFilteredOptions = this.isChartOfAccountEntryType
      ? this.entryOptions
        ?.filter((i: IdValue) => selectedEntries?.findIndex((e: LedgerEntry) => e.chartOfAccountId === i.id) === -1)
        ?.map((i: IdValue) => this.ledgerGroupService.getChartOfAccountTitle(<ChartOfAccount>i))
      : this.entryOptions
        ?.filter((i: ChartOfAccount) => selectedEntries?.findIndex((e: LedgerEntry) => e.payeeOrgId === i.id && !e.postedLedgerEntryId) === -1);
  }

  public onSelectedEntryChanged(id: number, entryGroup: UntypedFormGroup):void {
    if (this.isChartOfAccountEntryType) {
      const chartOfAccount: ChartOfAccount = (this.entryOptions as ChartOfAccount[]).find((i: ChartOfAccount) => i.id === id);

      entryGroup.patchValue({
        name: null,
        chartOfAccountId: id,
        accountNo: chartOfAccount?.accountNo,
        accountGroupNo: chartOfAccount?.accountGroupNo,
        accountType: chartOfAccount?.accountType,
        active: true,
        relatedEntityId: null,
        relatedEntityTypeId: null,
        includeInGLBalance: chartOfAccount?.includeInGLBalance,
      });
      const ledgerEntry = entryGroup.value as LedgerEntry;
      if (this.ledgerEntryService.isRequiredRelatedEntity(ledgerEntry, this.validateLienCredits)) {
        entryGroup.controls.relatedEntityId.setValidators(Validators.required);
        entryGroup.controls.relatedEntityId.updateValueAndValidity();
      } else {
        entryGroup.controls.relatedEntityId.setValidators(null);
        entryGroup.controls.relatedEntityId.updateValueAndValidity();
      }

      // Patch relatedEntityTypeId for current selected ledger entry
      entryGroup.patchValue({ relatedEntityTypeId: this.ledgerGroupService.getRelatedEntityTypeId(ledgerEntry) });
    } else {
      const name = this.entryOptions.find((i: ChartOfAccount) => i.id === id)?.name;

      entryGroup.patchValue({ name, accountType: ChartOfAccountTypeEnum.Expense });

      if (this.isAttyFees) {
        entryGroup.patchValue({ description: name });
      }
    }

    this.patchDefaultEntryStatus(entryGroup);
  }

  public onSelectCreditEntryOpen(selectedEntries: LedgerEntry[]): void {
    this.creditFilteredOptions = this.creditOptions
      ?.filter((i: ChartOfAccount) => selectedEntries?.findIndex((e: LedgerEntry) => e.chartOfAccountId === i.id && !e.postedLedgerEntryId) === -1)
      ?.map((i: ChartOfAccount) => this.ledgerGroupService.getChartOfAccountTitle(<ChartOfAccount>i));
  }

  public onSelectedCreditChanged(id: number, entryGroup: UntypedFormGroup): void {
    const credit: ChartOfAccount = (this.creditOptions as ChartOfAccount[]).find((i: ChartOfAccount) => i.id === id);

    entryGroup.patchValue({
      name: null,
      chartOfAccountId: id,
      accountNo: credit?.accountNo,
      accountGroupNo: credit?.accountGroupNo,
      accountType: ChartOfAccountType.Credit,
      active: true,
    });

    this.patchDefaultEntryStatus(entryGroup);
  }

  public onSelectAccountOpen(selectedAccounts: LedgerAccount[]): void {
    this.orgFilteredOptions = this.orgOptions?.filter((i: Org) => selectedAccounts?.findIndex((e: LedgerAccount) => e.payeeOrgId === i.id) === -1);
  }

  public onSelectedAccountChanged(id: number, accountForm: UntypedFormGroup): void {
    if (this.isAttyExpenses) {
      const entries = accountForm.get('entries') as UntypedFormArray;
      const orgName = this.orgOptions.find((i: Org) => i.id === id)?.name;

      for (const entryCtr of entries.controls) {
        entryCtr.patchValue({ payeeOrgId: id });
      }

      accountForm.patchValue({ name: orgName });
    }
  }

  public canViewInLPM(item: LedgerEntry): boolean {
    return this.ledgerGroupService.canViewInLPM(item);
  }

  public onViewInLPM(item: LedgerEntry): void {
    LPMHelper.viewInLPM('/#product-details', { lienId: item.relatedEntityId });
  }

  public onRemoveEntry(index: number, item: LedgerEntry): void {
    this.messageService.showConfirmationDialog('Confirm delete operation', 'Are you sure you want to remove entry?')
      .subscribe((answer: boolean) => {
        if (answer) {
          const entries = this.getEntries(item.accountNo, item.payeeOrgId, item.accountType);

          entries.removeAt(index);
          this.raiseLedgersChangedEvent(false);
        }
      });
  }

  public onRemoveCredit(index: number): void {
    this.messageService.showConfirmationDialog('Confirm delete operation', 'Are you sure you want to remove credit?')
      .subscribe((answer: boolean) => {
        if (answer) {
          const accountCtrl = this.accounts.at(this.accounts.length - 1);
          const entries = accountCtrl.get('entries') as UntypedFormArray;

          entries.removeAt(index);
          this.raiseLedgersChangedEvent(false);
        }
      });
  }

  public onRemoveAccount(index): void {
    this.messageService.showConfirmationDialog('Confirm delete operation', 'Are you sure you want to remove account?')
      .subscribe((answer: boolean) => {
        if (answer) {
          this.accounts.removeAt(index);
          this.raiseLedgersChangedEvent(false);
        }
      });
  }

  public canShowEntryModal(item: LedgerEntry): boolean {
    return this.ledgerGroupService.canShowEntryModal(item);
  }

  public onShowEntryModal(item: LedgerEntry, isBtnAction: boolean = false): void {
    if ((!isBtnAction && !this.readOnly) || !this.ledgerGroupService.canShowEntryModal(item)) {
      return;
    }

    const initialState = {
      title: 'Claim Settlement Ledger Entry',
      ledgerEntryId: item.id,
      ledgerId: this.ledgerId,
      defaultPayeeId: this.defaultPayeeId,
    };

    this.modalService.show(LedgerEntryInfoModalComponent, {
      initialState,
      class: 'additional-info-modal claim-settlement-ledger-entry-modal',
    });
  }

  public validateAll(): boolean {
    if (!this.validationForm) {
      return false;
    }

    this.detectChanges();

    const isValid = this.validate();

    return isValid;
  }

  public patchAccountGroup(group: LedgerAccountGroup): void {
    if (!this.form) {
      // Init form
      this.form = this.fb.group({ accounts: this.fb.array([]) });

      group?.accounts.forEach((account: LedgerAccount) => {
        this.accounts.push(this.createAccountFormGroup(account));
      });
    } else {
      // Patch from
      if (!this.accounts?.controls) {
        return;
      }
      for (const accountCtrl of this.accounts.controls) {
        const account = group.accounts.find((i: LedgerAccount) => i.accountNo === accountCtrl.value.accountNo && i.payeeOrgId === accountCtrl.value.payeeOrgId && i.accountType === accountCtrl.value.accountType);
        const entryCtrls = this.getEntries(account.accountNo, account.payeeOrgId, account.accountType);

        for (const entry of account.entries) {
          const entryCtrl = entryCtrls.controls.find((i: AbstractControl) => i.value.id === entry.id
            && i.value.uuid === entry.uuid
            && i.value.chartOfAccountId === entry.chartOfAccountId
            && i.value.accountGroupNo === entry.accountGroupNo
            && i.value.accountNo === entry.accountNo
            && i.value.chartOfAccountId === entry.chartOfAccountId
            && i.value.payeeOrgId === entry.payeeOrgId);

          if (entryCtrl) {
            entryCtrl.patchValue({ amount: entry.amount, percentage: entry.percentage });
          } else {
            const newEntry = this.createEntryFormGroup(entry, account);
            entryCtrls.push(newEntry);
          }
        }

        accountCtrl.patchValue({
          totalPercentage: this.currentTotalPercentage(account),
          totalAmount: account.totalAmount,
          totalPaidAmount: account.totalPaidAmount,
        });
      }
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  // #endregion Public methods

  // #region Private Methods

  // Get Account Percentage Validator
  private getAccPercentageValidator(account: LedgerAccount): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = this.currentTotalPercentage(account, +control.value);

      // this.ledgerGroupService.log(`[Account Percentage Validation] AccountNo: ${account.accountNo}, CurrentValue: ${value}`);

      if (!this.isRequired || CommonHelper.isNullOrUndefined(value)) {
        return null;
      }

      if (this.isCannotExceed100PercentAcc(account) && value > 100) {
        return { 'Account total percent cannot exceed 100%': true, 'Total percent': value };
      }

      if (this.isMustBe100PercentAcc(account) && value !== 100) {
        return { 'Account total percent must be equal 100%': true, 'Total percent': value };
      }

      return null;
    };
  }

  private getEntryPercentageValidators(account: LedgerAccount): ValidatorFn[] {
    const validator: ValidatorFn[] = [];

    if (!this.isRequired) {
      return validator;
    }

    if (this.isCannotExceed100PercentAcc(account)) {
      validator.push(Validators.max(100));
    }

    return validator;
  }

  private getAccEntriesValidators(account: LedgerAccount): ValidatorFn[] {
    if (this.isAttyExpenses && !AttyExpenseNonGrouping.includes(account.accountNo) && !account.entries?.length) {
      return [Validators.required];
    }

    return null;
  }

  private raiseLedgersChangedEvent(formEvent: boolean = true): void {
    const changedGroup = this.accountGroup;

    // Need it to allow validate total pct
    for (const account of this.accounts?.controls) {
      const currentValue = PercentageHelper.truncate(account.value.entries?.map((e: LedgerEntry) => +e.percentage).reduce((a: number, b: number) => a + b, 0), this.percentFractionDigits);
      const totalPercentage = this.currentTotalPercentage(account.value, currentValue);
      account.patchValue({ totalPercentage });
    }

    changedGroup.accounts = this.accounts.value;

    setTimeout(() => this.validateAll());
    this.accountGroupChanged.emit({ group: LedgerAccountGroup.toModel(changedGroup), formEvent });
  }

  private patchDefaultEntryStatus(entryGroup: UntypedFormGroup): void {
    const entry = entryGroup.value as LedgerEntry;
    const entryStatus = this.ledgerGroupService.getDefaultEntryStatus(entry.accountNo, this.chartOfAccSettings);

    if (
      entry.statusId === ClaimSettlementLedgerEntryStatus.Pending
      || entry.statusId === ClaimSettlementLedgerEntryStatus.NonPayable
    ) {
      entryGroup.patchValue({
        statusId: entryStatus,
        statusName: this.ledgerEntryStatusReadablePipe.transform(entryStatus),
      });
    }
  }

  public canEnterNegativeValues(form: UntypedFormGroup): boolean
  {
    var chartOfAccountSetting = this.chartOfAccSettings.find(p => p.chartOfAccount.accountNo == form.value.accountNo);
    return chartOfAccountSetting?.chartOfAccount.refundsAllowed ?? false;
  }

  private canAddSubAccount(account: LedgerAccount): boolean {
    return !this.checkEnabledSubAccounts || this.isAccountEnabled(account);
  }

  // Check by accountNo If in COA settings account enabled
  private isAccountEnabled(account: LedgerAccount): boolean {
    return !!this.chartOfAccSettings?.find((i: ChartOfAccountSettings) => i.chartOfAccount.accountNo === account.accountNo)?.active;
  }

  private getChartOfAccount(account: LedgerAccount): ChartOfAccount {
    if (AttyExpenseNonGrouping.includes(account.accountNo)) {
      return (this.nonGroupedOptions as ChartOfAccount[]).find((i: ChartOfAccount) => i.accountNo === account.accountNo);
    } if (this.isChartOfAccountEntryType) {
      return (this.entryOptions as ChartOfAccount[]).find((i: ChartOfAccount) => i.accountGroupNo === account.accountGroupNo);
    }
    return this.chartOfAccSettings?.find((i: ChartOfAccountSettings) => i.caseId === this.projectId && i.chartOfAccount?.accountNo === account.accountNo)?.chartOfAccount;
  }

  private getEntries(accountNo: string, payeeOrgId: number, accountType: string): UntypedFormArray {
    let accountCtrl: AbstractControl;
    if (this.isAttyExpenses) {
      if (AttyExpenseNonGrouping.includes(accountNo)) {
        accountCtrl = this.accounts.controls.find((i: AbstractControl) => i.value.accountNo === accountNo);
      } else {
        accountCtrl = this.accounts?.controls.find((i: AbstractControl) => i.value.payeeOrgId === payeeOrgId);
      }
    } else if (this.isAccountless) {
      accountCtrl = this.accounts?.controls.find((i: AbstractControl) => i.value.accountType === accountType);
      if (!accountCtrl) {
        accountCtrl = this.accounts?.controls[0];
      }
    } else {
      accountCtrl = this.accounts?.controls.find((i: AbstractControl) => i.value.accountNo === accountNo);
    }

    const entries = accountCtrl?.get('entries') as UntypedFormArray;

    return entries;
  }

  private createAccountFormGroup(account: LedgerAccount): UntypedFormGroup {
    const ledgerAccountsForm = this.fb.group({
      id: account.id,
      name: account.name,
      accountNo: account.accountNo,
      accountGroupNo: account.accountGroupNo,
      payeeOrgId: account.payeeOrgId,
      accountType: account.accountType,
      totalAmount: account.totalAmount,
      totalPaidAmount: account.totalPaidAmount,
      totalPercentage: [account.totalPercentage, this.getAccPercentageValidator(account)],
      canEditAttyFirmFeesEntry: account.canEditAttyFirmFeesEntry,
      entries: this.fb.array([], this.getAccEntriesValidators(account)),
    });

    const formArray = ledgerAccountsForm.get('entries') as UntypedFormArray;

    if (account.entries) {
      const entries = this.createEntryFormGroups(account.entries, account);
      entries?.forEach((ctrl: UntypedFormGroup) => formArray.push(ctrl));
    }

    return ledgerAccountsForm;
  }

  private createEntryFormGroups(entries: LedgerEntry[], account: LedgerAccount): UntypedFormGroup[] {
    return entries.map((entry: LedgerEntry) => this.createEntryFormGroup(entry, account));
  }

  private createEntryFormGroup(entry: LedgerEntry, account: LedgerAccount): UntypedFormGroup {
    const status = this.ledgerGroupService.getDefaultEntryStatus(entry.accountNo, this.chartOfAccSettings);

    let payeeName: string;
    if (account.accountGroupNo === LedgerAccountGroupEnum.AttyExpenses && !AttyExpenseNonGrouping.includes(account.accountNo)) {
      payeeName = entry.payeeName || account.name;
    } else {
      payeeName = entry.payeeName;
    }

    return this.fb.group({
      id: entry.id,
      uuid: entry.uuid || uuid(), // To support duplicate entries
      name: entry.name,
      description: entry.description,
      payeeOrgId: entry.payeeOrgId,
      payeeName,
      accountNo: entry.accountNo,
      accountGroupNo: entry.accountGroupNo,
      accountType: entry.accountType,
      chartOfAccountId: entry.chartOfAccountId,
      claimSettlementLedgerId: entry.claimSettlementLedgerId,
      splitTypeId: entry.splitTypeId,
      statusId: entry.status?.id || status,
      statusName: entry.status?.id ? entry.status?.name : this.ledgerEntryStatusReadablePipe.transform(status),
      percentage: [entry.percentage, this.getEntryPercentageValidators(account)],
      amount: entry.amount,
      paidAmount: entry.paidAmount,
      active: entry.active,
      externalSourceEntityId: entry.externalSourceEntityId,
      relatedEntityId: entry.relatedEntityId,
      relatedEntityTypeId: this.isRelatedEntityType && this.ledgerEntryService.canEditRelatedEntity(entry) ? EntityTypeEnum.LienProducts : entry.relatedEntityTypeId,
      postedLedgerEntryId: entry.postedLedgerEntryId,
      postedDate: entry.postedDate,
      lastModifiedDate: entry.lastModifiedDate,
      createdDate: entry.createdDate,
      includeInGLBalance: entry.includeInGLBalance,
      payeeNotExist: entry.payeeNotExist,
      canEditAuthorizedAttyFeesPercentage: entry.canEditAuthorizedAttyFeesPercentage,
      canEditAttyFields: entry.canEditAttyFields
    });
  }

  // #endregion Private region
}
