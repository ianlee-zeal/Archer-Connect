import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ChangeDetectorRef, ViewRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PercentPipe } from '@angular/common';
import { UntypedFormGroup, Validators, ValidatorFn, UntypedFormControl, FormArray, AbstractControl } from '@angular/forms';
import { ActionsSubject, Store } from '@ngrx/store';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Subject, combineLatest } from 'rxjs';

import { ModalService, PermissionService, ToastService } from '@app/services';
import { ActionItem, IdValue, ExpansionBarElement, FormulaSets, ValidationResult } from '@app/models';
import { LedgerAccountGroup, LedgerInfo, ChartOfAccount, ChartOfAccountSettings, FormulaEngineParams, LedgerEntry, LedgerAccount } from '@app/models/closing-statement';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { CommonHelper, CurrencyHelper } from '@app/helpers';
import { exportsSelectors } from '@shared/state/exports/selectors';
import { CanLeave } from '@app/modules/shared/_interfaces';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import {
  PermissionActionTypeEnum,
  PermissionTypeEnum,
  DisbursementGroupTypeEnum,
  LedgerAccountGroup as LedgerAccountGroupEnum,
  ChartOfAccountMode as ChartOfAccountModeEnum,
  ClaimSettlementLedgerStages as ClaimSettlementLedgerStagesEnum,
  ChartOfAccountType,
  AttyExpenseNonGrouping,
  LedgerAccountEnum,
  PaidStatuses,
  AttyFirmFees,
  MDLGroups,
  CBFGroups,
} from '@app/models/enums';
import { FormulaEngineService } from '@app/services/formula-engine.service';
import { Pager, RelatedPage } from '@app/modules/shared/grid-pager';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { ExtendedCurrencyPipe } from '@app/modules/shared/_pipes';
import { QSFType } from '@app/models/enums/ledger-settings/qsf-type';
import { FormulaModeEnum } from '@app/models/enums/ledger-settings/formula-mode.enum';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import * as projectActions from '@app/modules/projects/state/actions';
import { commonSelectors } from '@app/modules/shared/state/common.selectors';
import { ClaimantLedgerService } from '@app/services/ledger/ledger.service';
import { LedgerSum } from '@app/models/closing-statement/ledger-sum.type';
import { ofType } from '@ngrx/effects';
import * as fromContacts from '@app/modules/dashboard/persons/contacts/state/index';
import { AccountGroupTotalValue } from '@app/models/closing-statement/account-group-total-value';
import { LedgerEntryValidationData } from '@app/models/closing-statement/ledger-entry-validation-data';
import { LedgerValue } from '@app/models/closing-statement/ledger-value';
import { VariancesModalComponent } from '../variances-modal/variances-modal.component';
import { ClaimantDetailsState } from '../../state/reducer';
import { LedgerAccountGroupComponent } from '../ledger-group/ledger-account-group.component';
import { CustomCsFieldsComponent } from '../custom-cs-fields/custom-cs-fields.component';
import * as actions from '../../state/actions';
import * as selectors from '../../state/selectors';
import { DeleteLedgerComponent } from '../delete-ledger-modal/delete-ledger-modal.component';

@Component({
  selector: 'app-claimant-ledger',
  templateUrl: './claimant-ledger.component.html',
  styleUrls: ['./claimant-ledger.component.scss'],
  providers: [PercentPipe, ClaimantLedgerService],
})
export class ClaimantLedgerComponent extends Editable implements CanLeave, OnInit, OnDestroy {
  @ViewChildren(LedgerAccountGroupComponent) ledgerAccountComponents: QueryList<LedgerAccountGroupComponent>;
  @ViewChild(CustomCsFieldsComponent) customFields;

  public readonly item$ = this.store.select(selectors.item);
  public readonly ledgerInfo$ = this.store.select(selectors.ledgerInfo);
  public readonly error$ = this.store.select(selectors.error);
  public readonly isSummaryBarExpanded$ = this.store.select(selectors.isExpanded);
  public readonly formulaModes$ = this.store.select(selectors.formulaModes);
  public readonly formulaSet$ = this.store.select(selectors.formulaSet);
  public readonly qsfTypes$ = this.store.select(selectors.qsfTypes);
  public readonly pager$ = this.store.select(commonSelectors.pager);

  private pager: Pager;
  private readonly chartOfAccounts$ = this.store.select(selectors.chartOfAccounts);
  private readonly ledgerEntryValidationData$ = this.store.select(selectors.ledgerEntryValidationData);
  private readonly chartOfAccSettings$ = this.store.select(projectSelectors.chartOfAccountsSettings);
  private readonly headerElements$ = this.store.select(selectors.headerElements);
  readonly personContacts$ = this.store.select(fromContacts.selectors.personContactPaidOnBehalfListSelector);
  private readonly ngUnsubscribe$ = new Subject<void>();

  public ledgerAccountGroupEnum = LedgerAccountGroupEnum;
  public chartOfAccountModeEnum = ChartOfAccountModeEnum;
  public ledgerInfo: LedgerInfo;
  public percentFractionDigits: number = 8;
  public chartOfAccounts: ChartOfAccount[];
  public chartOfAccountExpenseMap = new Map<string, ChartOfAccount[]>();
  public chartOfAccountCreditMap = new Map<string, ChartOfAccount[]>();
  public chartOfAccountSpecialMap = new Map<string, ChartOfAccount[]>();
  public orgAccessOptions: IdValue[];
  public formulaSet: FormulaSets;
  public formulaModes: IdValue[];
  public isInvalid: boolean;
  public isFormulaInvalid: boolean;
  public validationMessages: string[];
  public attorneyReferenceId: number;
  public counselFirmId: number;
  public attyFeesMode: ChartOfAccountModeEnum;
  public cbfMode: ChartOfAccountModeEnum;
  public chartOfAccSettings: ChartOfAccountSettings[];
  public isQsfGrossFirm: boolean;
  public defaultPayeeId: number;
  public formulaErrorString: string = '';
  public validateLienCredits: boolean;

  public hasEditMDLFeePermission = this.permissionService.canEdit(PermissionTypeEnum.LedgerMDLAccGroup);
  public hasEditCBFFeePermission = this.permissionService.canEdit(PermissionTypeEnum.LedgerCBFAccGroup);
  public hasEditAttyFeesPermission = this.permissionService.canEdit(PermissionTypeEnum.LedgerAttyFeesAccGroup);

  public form: UntypedFormGroup = new UntypedFormGroup({
    formulaMode: new UntypedFormControl(null),
    contractFee: new UntypedFormControl(null),
    mdlFee: new UntypedFormControl(null),
    cbfFeeAmount: new UntypedFormControl(null),
    cbfFee: new UntypedFormControl(null),
    product: new UntypedFormControl(null),
  });

  public readonly groupHeaderElements: ExpansionBarElement[] = [
    { valueGetter: (): string => 'Account #', className: 'ledger-column--account-number' },
    { valueGetter: (): string => 'Name', className: 'ledger-column--name' },
    { valueGetter: (): string => 'Percent', className: 'ledger-column--percent' },
    { valueGetter: (): string => 'Amount', className: 'ledger-column--amount' },
    { valueGetter: (): string => 'Modified Date', className: 'ledger-column--modified-date' },
    { valueGetter: (): string => 'Description', className: 'ledger-column--description' },
    { valueGetter: (): string => 'Paid Amount', className: 'ledger-column--paid-amount' },
    { valueGetter: (): string => 'Payment Status', className: 'ledger-column--payment-status' },
    { valueGetter: (): string => 'Payee', className: 'ledger-column--payee' },
    { valueGetter: (): string => 'Actions', className: 'ledger-column--actions' },
  ];

  // #region Getter methods
  public get canLeave(): boolean {
    return !this.canEdit || !this.hasChanges;
  }

  public get hasAccGroups(): boolean {
    return this.ledgerService.hasAccGroups;
  }

  public get isLienHoldbackReleaseDG(): boolean {
    return this.ledgerInfo?.disbursementGroupTypeId === DisbursementGroupTypeEnum.LienHoldbackRelease;
  }

  public get isMDLRequired(): boolean {
    // parse number
    const mdlFeeValue: number = +(this.form?.value?.mdlFee || 0);
    const isMDLGroupAvailable = this.hasAccGroup(LedgerAccountGroupEnum.MDL) && this.hasEditMDLFeePermission;
    return isMDLGroupAvailable && !!mdlFeeValue && !this.isLienHoldbackReleaseDG;
  }

  public get isCBFRequired(): boolean {
    // parse number
    const cbfFeeAmountValue: number = +(this.form?.value?.cbfFeeAmount || 0);
    const cbfFeeValue: number = +(this.form?.value?.cbfFee || 0);
    const groupIsAvailable = this.hasAccGroup(LedgerAccountGroupEnum.CommonBenefit) && this.hasEditCBFFeePermission;
    const isAmountRequired = (this.cbfMode === ChartOfAccountModeEnum.CBFSplitAmount || this.cbfMode === this.chartOfAccountModeEnum.CBFOTTAmount) && !!cbfFeeAmountValue;
    const isPercentRequired = (this.cbfMode === ChartOfAccountModeEnum.CBFSplitPercent || this.cbfMode === this.chartOfAccountModeEnum.CBFOTTPercent) && !!cbfFeeValue;

    return groupIsAvailable && (isAmountRequired || isPercentRequired);
  }

  public get isAttyFeesRequired(): boolean {
    // parse number
    const contractFeeValue: number = +(this.form?.value?.contractFee || 0);
    const isAttyFeesAvailable = this.hasAccGroup(LedgerAccountGroupEnum.AttyFees) && this.hasEditAttyFeesPermission;
    const isPercentRequired = this.attyFeesMode === ChartOfAccountModeEnum.AttyFeePercent && !!contractFeeValue;

    return isAttyFeesAvailable && isPercentRequired;
  }

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get isCBFPercentageMode(): boolean {
    return this.cbfMode === ChartOfAccountModeEnum.CBFSplitPercent || this.cbfMode === this.chartOfAccountModeEnum.CBFOTTPercent;
  }

  public get lienFinalizedStatus(): string {
    if (this.ledgerInfo.lienStatusFinalized === null) {
      return 'Unknown';
    }

    return this.ledgerInfo.lienStatusFinalized ? 'Finalized' : 'Pending';
  }

  private get hasAccountGroups(): boolean {
    return !!this.ledgerInfo?.accountGroups?.length;
  }

  private get isFormulaCalcRequired(): boolean {
    if (this.initialDataIsInvalid) {
      // If data from the beginig is invalid - force recalc the form as soon as validation issues fixed
      this.initialDataIsInvalid = false;

      return true;
    }

    const { commonAmount, commonPercentage } = this.ledgerSum;

    this.ledgerSum = this.ledgerService.getLedgerSum(this.form);

    return this.ledgerInfo.formulaMode !== this.form?.value.formulaMode
      || this.ledgerSum.commonAmount !== commonAmount
      || this.ledgerSum.commonPercentage !== commonPercentage;
  }

  // #endregion Getter methods

  protected isCollectionsInitialized: boolean;
  protected hasChanges: boolean;

  private headerElements: ContextBarElement[] = [];
  private expandedGroupsSet = new Set<string>();
  private expandableGroupsSet = new Set<string>();
  private activeGroupsSet = new Set<string>();
  private claimantId: number;
  private ledgerId: number;
  private isExporting: boolean;
  private canRecalculate: boolean = true;
  private isHeaderElementsUpToDate: boolean;

  /** If data from the beginig is invalid - force recalc the form as soon as validation issues fixed */
  private initialDataIsInvalid: boolean;

  private ledgerSum: LedgerSum = {
    commonAmount: 0,
    commonPercentage: 0,
  };

  private accountGroupActionMap: Map<LedgerAccountGroupEnum, ActionItem> = new Map([
    [LedgerAccountGroupEnum.AttyExpenses, <ActionItem>{
      name: 'Add group',
      icon: 'fa-plus',
      action: () => this.addAccount(LedgerAccountGroupEnum.AttyExpenses),
      permissions: [
        PermissionService.create(PermissionTypeEnum.LedgerAttyExpensesAccGroup, PermissionActionTypeEnum.Create),
        PermissionService.create(PermissionTypeEnum.LedgerAttyExpensesAccGroup, PermissionActionTypeEnum.Edit),
      ],
      hidden: () => false,
    }],
  ]);

  /**
   * Account groups that have credit entries under the common account NOT separate Credit Account.
   */
  private creditGroupsWithoutCreditAcc = new Set<string>([
    //    LedgerAccountGroupEnum.AttyExpenses,
    LedgerAccountGroupEnum.Liens,
  ]);

  constructor(
    private store: Store<ClaimantDetailsState>,
    private currencyPipe: ExtendedCurrencyPipe,
    private permissionService: PermissionService,
    private modalService: ModalService,
    private readonly changeRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private formulaEngine: FormulaEngineService,
    private toastService: ToastService,
    private router: Router,
    private readonly ledgerService: ClaimantLedgerService,
    private readonly actionsSubj: ActionsSubject,
  ) {
    super();
  }

  // #region Public methods
  public ngOnInit(): void {
    this.ledgerId = +(this.route.snapshot?.params?.id || 0);
    this.ledgerService.initLedgerService();
    this.initActionBar();
    this.initHeader();

    this.subscribeToFormulaSet();
    this.subscribeToFormulaModes();
    this.subscribeToClaimant();
    this.subscribeToExport();
    this.subscribeToLedgerInfo();
    this.subscribeToPersonContacts();
    this.subscribeToUpdateLedgerInfoSuccess();
    this.subscribeToUpdateLedgerInfoError();

    this.store.dispatch(actions.ToggleSpecialDesignationsBar({ showSpecialDesignationsBar: false }));
    this.store.dispatch(actions.ToggleClaimantSummaryBar({ isExpanded: false }));
  }

  /** Ledger form changed trigger event */
  public async onChange(): Promise<void> {
    this.hasChanges = true;
    this.canRecalculate = this.isFormulaCalcRequired;

    await this.recalculateLedger(this.canRecalculate);

    this.canRecalculate = true;
    const validationResult = this.validateAll();
    this.isInvalid = this.isFormulaInvalid || !validationResult.isValid;
    this.validationMessages = validationResult.errors;
  }

  public allowUpdateFee(accGroupNo: string): boolean {
    const accountGroup = this.ledgerInfo.accountGroups.find((i: LedgerAccountGroup) => i.accountGroupNo === accGroupNo);
    return !accountGroup || !accountGroup.accounts.some((account: LedgerAccount) => account.entries.some(
      (entry: LedgerEntry) => PaidStatuses.includes(entry.statusId)
      && (AttyFirmFees.includes(entry.accountNo)
        || CBFGroups.includes(entry.accountNo)
        || MDLGroups.includes(entry.accountNo)),
    ));
  }

  public allowUpdateAllocations(): boolean {
    return (this.allowUpdateFee(LedgerAccountGroupEnum.AttyFees) || this.attyFeesMode !== ChartOfAccountModeEnum.AttyFeePercent)
      && this.allowUpdateFee(LedgerAccountGroupEnum.MDL)
      && (this.allowUpdateFee(LedgerAccountGroupEnum.CommonBenefit) || !this.isCBFPercentageMode);
  }

  public isDeductionAccGroup(accGroupNo: string): boolean {
    return this.ledgerService.isDeductionAccGroup(accGroupNo);
  }

  public onCancel(): void {
    if (this.canEdit) {
      // Reset edit state
      this.canEdit = false;
      this.isInvalid = false;
      this.validationMessages = [];
      const lienComponent = this.ledgerAccountComponents.find(i => i.accountGroup.accountGroupNo === LedgerAccountGroupEnum.Liens);
      if (lienComponent) {
        lienComponent.showErrorTooltip = false;
      }
      this.hasChanges = false;
      this.isFormulaInvalid = false;
      this.formulaErrorString = '';

      this.ledgerService.reloadLedgerInfo(this.claimantId);
    }
  }

  public toggleGroup(groupNo: string): void {
    if (this.expandedGroupsSet.has(groupNo)) {
      this.expandedGroupsSet.delete(groupNo);
    } else {
      this.expandedGroupsSet.add(groupNo);
    }
  }

  public getExpandedState(groupNo: string) {
    return this.expandedGroupsSet.has(groupNo);
  }

  public getGroupTitle(group: LedgerAccountGroup): string {
    return `${group.accountNo} - ${group.name}`;
  }

  public getGroupElements(group: LedgerAccountGroup): ContextBarElement[] {
    const dummyElement: ContextBarElement = { valueGetter: () => ' ' };
    if (this.ledgerAccountComponents?.find(c => (c.isInvalid || c.showErrorTooltip) && c.accountGroup.accountGroupNo === group.accountGroupNo)) {
      dummyElement.errorTooltip = 'Group has validation errors';
    }

    if (this.ledgerService.hasMissingPayeeOrgId(group, this.ledgerInfo)) {
      dummyElement.warningTooltip = 'Missing Payee Org ID assignments';
    }

    if (!this.hasActiveAccSettings(group.accountGroupNo)) {
      if (group.totalAmount !== 0) {
        dummyElement.errorTooltip = 'Disabled chart of account group does not have a zero balance';
      } else {
        dummyElement.warningTooltip = 'Chart of account group is not enabled anymore';
      }
    }

    return [dummyElement];
  }

  public getGroupActions(group: LedgerAccountGroupEnum): ActionItem[] {
    const actionItems: ActionItem[] = [];

    if (this.canEdit && this.hasActiveAccSettings(group)) {
      const action = this.accountGroupActionMap.get(group);

      if (action) {
        actionItems.push(action);
      }
    }

    return actionItems;
  }

  public canDisplayGroup(group: LedgerAccountGroup): boolean {
    const isVisible = this.hasActiveAccSettings(group.accountGroupNo) || !!group.totalAmount;

    if (!isVisible) {
      return false;
    }

    switch (group.accountGroupNo) {
      case LedgerAccountGroupEnum.AwardFunding:
        return this.permissionService.canRead(PermissionTypeEnum.LedgerAwardFundingAccGroup);
      case LedgerAccountGroupEnum.MDL:
        return this.permissionService.canRead(PermissionTypeEnum.LedgerMDLAccGroup);
      case LedgerAccountGroupEnum.CommonBenefit:
        return this.permissionService.canRead(PermissionTypeEnum.LedgerCBFAccGroup);
      case LedgerAccountGroupEnum.AttyFees:
        return this.permissionService.canRead(PermissionTypeEnum.LedgerAttyFeesAccGroup);
      case LedgerAccountGroupEnum.AttyExpenses:
        return this.permissionService.canRead(PermissionTypeEnum.LedgerAttyExpensesAccGroup);
      case LedgerAccountGroupEnum.Liens:
        return this.permissionService.canRead(PermissionTypeEnum.LedgerLiensAccGroup);
      case LedgerAccountGroupEnum.ARCHERFees:
        return this.permissionService.canRead(PermissionTypeEnum.LedgerARCHERFeesAccGroup);
      case LedgerAccountGroupEnum.OtherFees:
        return this.permissionService.canRead(PermissionTypeEnum.LedgerOtherFeesAccGroup);
      case LedgerAccountGroupEnum.ClaimantDisbursements:
        return this.permissionService.canRead(PermissionTypeEnum.LedgerClaimantDisbursementsAccGroup);
      case LedgerAccountGroupEnum.ThirdPartyPMTS:
        return this.permissionService.canRead(PermissionTypeEnum.ThirdPartyPMTSAccGroup);
      default:
        return false;
    }
  }

  public hasActiveAccSettings(accGroupNo: string): boolean {
    return this.activeGroupsSet?.has(accGroupNo);
  }

  public get attyExpenseEntryOptions() :ChartOfAccount[] {
    const result = new Array<ChartOfAccount>();
    this.chartOfAccountExpenseMap.get(this.ledgerAccountGroupEnum.AttyExpenses)
      .concat(this.chartOfAccountCreditMap.get(this.ledgerAccountGroupEnum.AttyExpenses))
      .filter(a => !this.chartOfAccountSpecialMap.get(this.ledgerAccountGroupEnum.AttyExpenses).includes(a))
      .forEach(coa => {
        if (!result.includes(coa)) result.push(coa);
      });
    return result;
  }

  public get attyExpenseCreditOptions() {
    const result = this.chartOfAccountCreditMap.get(this.ledgerAccountGroupEnum.AttyExpenses)
      ?.filter(a => this.chartOfAccountSpecialMap.get(this.ledgerAccountGroupEnum.AttyExpenses).includes(a));
    return result;
  }

  public get attyExpenseNonGroupedOptions() {
    const result = this.chartOfAccountSpecialMap.get(this.ledgerAccountGroupEnum.AttyExpenses);
    return result;
  }

  public onAccountGroupChanged(event): void {
    const { group, formEvent } = event;

    this.hasChanges = true;
    this.syncAccountGroups(group);

    if (!formEvent) {
      // If child form doesn't propagate event, trigger onChange manually
      // To prevent double OnChange event trigger
      this.onChange();
    }
  }

  public save(): void {
    const { formulaMode, contractFee, mdlFee, cbfFeeAmount, cbfFee, product } = this.form.value;
    const ledgerInfo = <LedgerInfo>{};

    Object.assign(ledgerInfo, this.ledgerInfo);
    ledgerInfo.formulaMode = formulaMode;
    ledgerInfo.contractFee = contractFee;
    ledgerInfo.mdlFee = mdlFee;
    ledgerInfo.cbfFeeAmount = cbfFeeAmount;
    ledgerInfo.cbfFee = cbfFee;
    ledgerInfo.product = product;

    const fields = this.customFields.fields;
    ledgerInfo.customCS1 = fields[0];
    ledgerInfo.customCS2 = fields[1];
    ledgerInfo.customCS3 = fields[2];
    ledgerInfo.customCS4 = fields[3];
    ledgerInfo.customCS5 = fields[4];

    this.store.dispatch(actions.UpdateLedgerInfo({
      ledgerId: this.ledgerId,
      ledgerInfo,
    }));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

    this.store.dispatch(projectActions.ResetChartOfAccountsSettingsList());

    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
    this.store.dispatch(actions.UpdateHeader({ headerElements: this.headerElements }));
    this.store.dispatch(actions.ToggleSpecialDesignationsBar({ showSpecialDesignationsBar: true }));
  }
  // #endregion Public methods

  // #region Private methods
  private async initLedger(ledgerInfo: LedgerInfo): Promise<void> {
    this.ledgerInfo = ledgerInfo;

    this.expandableGroupsSet = new Set(this.ledgerInfo.accountGroups.map(i => i.accountNo));
    this.expandableGroupsSet.add('CCS');

    this.initForm(this.ledgerInfo);

    // pass ledgerinfo, coa setting, and recalc flag
    await this.calcByFormula(this.ledgerInfo, this.chartOfAccSettings, true);

    setTimeout(() => this.validateAll());
  }

  private initSettings(settings: ChartOfAccountSettings[]): void {
    this.chartOfAccSettings = settings;
    this.attyFeesMode = settings.find(i => i.chartOfAccount.accountNo === LedgerAccountGroupEnum.AttyFees)?.defaultModeId || ChartOfAccountModeEnum.AttyFeePercent;
    this.cbfMode = settings.find(i => i.chartOfAccount.accountNo === LedgerAccountGroupEnum.CommonBenefit)?.defaultModeId || ChartOfAccountModeEnum.CBFSplitPercent || this.chartOfAccountModeEnum.CBFOTTPercent;

    this.activeGroupsSet = new Set(
      settings
        ?.filter(i => !!i.active)
        ?.map(i => i.chartOfAccount?.accountGroupNo),
    );
  }

  private initCOAs(chartOfAccounts: ChartOfAccount[]): void {
    this.chartOfAccounts = chartOfAccounts;
    this.chartOfAccountExpenseMap = this.ledgerService.getExpenseChartsOfAcc(this.chartOfAccounts);
    this.chartOfAccountCreditMap = this.ledgerService.getCreditsOfAcc(this.chartOfAccounts);
    this.chartOfAccountSpecialMap = this.ledgerService.getSpecialAccounts(this.chartOfAccounts);
  }

  private initValiadtionData(ledgerEntryValidationData: LedgerEntryValidationData): void {
    this.validateLienCredits = ledgerEntryValidationData?.validateLienCredits || false;
  }

  private async calcByFormula(ledgerInfo: LedgerInfo, chartOfAccSettings: ChartOfAccountSettings[], canRecalc: boolean): Promise<void> {
    // Formula Engine
    const generalLedger = LedgerInfo.toClaimSettlementLedgerModel(ledgerInfo);
    const ledgerAccountComponents = this.ledgerAccountComponents;
    const oldAccGroups = [];

    // Deep copy
    Object.assign(oldAccGroups, ledgerInfo.accountGroups, JSON.parse(JSON.stringify(ledgerInfo.accountGroups)));

    try {
      CommonHelper.windowLog(
        'Input Formula Engine Args',
        { generalLedger },
        { chartOfAccSettings },
        { targetScriptFilename: this.formulaSet?.targetScriptFilename },
        { recalc: canRecalc },
      );

      // Clear errors if formula is recalculating
      if (canRecalc) {
        Object.values(this.ledgerInfo.initialLedgerValues.initialAccountGroupTotals).forEach((item: AccountGroupTotalValue) => {
          // Set hasError to false for each item
          item.hasError = false;
          item.initialLedgerEntryValues.forEach((entry: LedgerValue) => {
            entry.hasError = false;
          });
        });
      }
      const formulaResultOutput = await this.formulaEngine.calc(generalLedger, chartOfAccSettings, this.formulaSet?.targetScriptFilename, canRecalc, this.ledgerInfo.initialLedgerValues);
      CommonHelper.windowLog('Output Formula Engine Args', { formulaResultOutput });

      this.applyFormulaResult(ledgerInfo, formulaResultOutput);
      this.detectChangedAccGroups(ledgerInfo, oldAccGroups);
    } catch (e) {
      const formulaEngineTitle = '[Formula Engine Service]';

      if (e instanceof Error) {
        this.toastService.showError(`${formulaEngineTitle}: ${e.message}`);
      } else {
        this.toastService.showWarning(`${formulaEngineTitle}: ${e}`);
      }
    }

    // added this because it didn't seem to matter if updating from listener, as it comes from backend directly /w no modifications
    if (canRecalc) {
      for (const group of ledgerAccountComponents) {
        const calculatedGroup = this.ledgerInfo.accountGroups.find(i => i.accountGroupNo === group.accountGroup?.accountGroupNo);

        if (calculatedGroup) {
          group.patchAccountGroup(calculatedGroup);
        }
      }
    }

    this.ledgerSum = this.ledgerService.getLedgerSum(this.form);
    this.updateHeaderElements();
  }

  private applyFormulaResult(ledgerInfo: LedgerInfo, formulaResult: FormulaEngineParams): void {
    if (!formulaResult || this.formulaHasError(formulaResult)) {
      return;
    }

    // Patch ledger
    ledgerInfo.netAllocation = CurrencyHelper.round(formulaResult.netAllocation);
    ledgerInfo.grossAllocation = CurrencyHelper.round(formulaResult.grossAllocation);
    ledgerInfo.feeExpenses = CurrencyHelper.round(formulaResult.feeExpenses);
    ledgerInfo.balance = CurrencyHelper.round(formulaResult.balance);

    if (!ledgerInfo.accountGroups) {
      return;
    }

    // Patch entries
    for (const accGr of ledgerInfo.accountGroups) {
      let accGrTotalAmount = 0;
      let accGrTotalPaidAmount = 0;

      for (const acc of accGr.accounts) {
        let accTotalAmount: number = 0;
        let accTotalPercentage: number = 0;
        let accTotalPaidAmount: number = 0;

        // Account entries will be replaced by formula output entries
        acc.entries = [];

        // Filter by AccountGroupNo
        let formulaOutputEntries = formulaResult.claimSettlementLedger.claimSettlementLedgerEntries.filter(i => i.chartOfAccount.accountGroupNo === acc.accountGroupNo);

        if (acc.accountGroupNo === LedgerAccountGroupEnum.AttyExpenses) {
          if (AttyExpenseNonGrouping.includes(acc.accountNo)) formulaOutputEntries = formulaOutputEntries.filter(i => i.accountNo === acc.accountNo);
          else formulaOutputEntries = formulaOutputEntries.filter(i => i.payeeOrgId === acc.payeeOrgId && !AttyExpenseNonGrouping.includes(acc.accountNo));
        } else if (acc.accountGroupNo === LedgerAccountGroupEnum.AttyFees && acc.accountType !== ChartOfAccountType.Credit) {
          formulaOutputEntries = formulaOutputEntries.filter(i => i.accountNo === acc.accountNo);
        }

        // Filter Credit type
        if (acc.accountGroupNo !== LedgerAccountGroupEnum.AttyExpenses) {
          if (this.ledgerService.hasCredits(acc)) {
            formulaOutputEntries = formulaOutputEntries.filter(i => i.accountType === ChartOfAccountType.Credit);
          } else if (!this.creditGroupsWithoutCreditAcc.has(acc.accountGroupNo)) {
            formulaOutputEntries = formulaOutputEntries.filter(i => i.accountType !== ChartOfAccountType.Credit);
          }
        }

        for (const formulaEntry of formulaOutputEntries) {
          // Format percentage for UI
          formulaEntry.percentage = (formulaEntry.percentage || 0) * 100;
          formulaEntry.amount = CurrencyHelper.round(formulaEntry.amount);

          // Add formula output entry to the account
          acc.entries.push(formulaEntry);

          // Calc totals
          accTotalAmount = formulaEntry.accountType !== ChartOfAccountType.Credit
            ? accTotalAmount + formulaEntry.amount
            : accTotalAmount - formulaEntry.amount;

          accTotalPercentage += formulaEntry.percentage;
          accTotalPaidAmount += formulaEntry.paidAmount;
        }

        acc.totalAmount = accTotalAmount;
        acc.totalPercentage = accTotalPercentage;
        acc.totalPaidAmount = accTotalPaidAmount;

        accGrTotalAmount += acc.totalAmount;
        accGrTotalPaidAmount += acc.totalPaidAmount;
      }

      accGr.totalAmount = accGrTotalAmount;
      accGr.totalPaidAmount = accGrTotalPaidAmount;
      this.formulaErrorString = '';
      this.isFormulaInvalid = false;
      LedgerInfo.updateFormulaTotalAmount(accGr, formulaResult);
    }
  }

  private formulaHasError(formulaResult: FormulaEngineParams): boolean {
    if (
      Object.values(formulaResult.initialLedgerValues?.initialAccountGroupTotals)
        .some((item: AccountGroupTotalValue) => item?.initialLedgerEntryValues?.some((entryValue: LedgerValue) => entryValue?.hasError === true || item.hasError))
    ) {
      this.isFormulaInvalid = true;
      this.formulaErrorString = '';
      const accountNos = [];
      const keys = Object.keys(formulaResult.initialLedgerValues?.initialAccountGroupTotals || {});
      Object.values(formulaResult.initialLedgerValues?.initialAccountGroupTotals).forEach((item: AccountGroupTotalValue, index: number) => {
        const errorEntries = item?.initialLedgerEntryValues?.filter((entryValue: LedgerValue) => entryValue?.hasError === true);
        if (errorEntries && errorEntries.length > 0) {
          errorEntries.forEach((entry: LedgerValue) => {
            accountNos.push(entry.accountNo);
          });
        }
        if (item.hasError && keys[index]) {
          accountNos.push(keys[index]);
        }
      });
      this.formulaErrorString = 'One or more changes made to ledger will change Paid entry ';
      this.formulaErrorString += accountNos.join(', ');
      return true;
    }
    return false;
  }

  private subscribeToClaimant(): void {
    this.item$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(claimant => {
        this.claimantId = claimant.id;
        this.attorneyReferenceId = claimant.attorneyReferenceId;
        this.counselFirmId = claimant.settlementFirmRefId;

        if (!this.isCollectionsInitialized) {
          const projectId = claimant.project.id;

          this.store.dispatch(actions.GetQSFTypes());
          this.store.dispatch(actions.GetLedgerFormulaModes());
          this.store.dispatch(actions.GetFormulaSetByProject({ projectId }));
          this.store.dispatch(actions.GetLedgerChartOfAccountsRequest({ projectId }));
          this.store.dispatch(fromContacts.actions.GetAllPersonContactsRequest({ claimantId: this.claimantId }));

          this.store.dispatch(actions.GetLedgerEntryValidationData({ caseId: projectId }));

          this.isCollectionsInitialized = true;
        }

        this.store.dispatch(projectActions.GetChartOfAccountsSettingsList({ projectId: claimant.project.id }));

        if (this.ledgerInfo && this.pager && this.pager.relatedPage !== RelatedPage.PaymentQueue) {
          // If Claimant has been changed by pagination we need to redirect the user to the List Of Lagers page
          this.router.navigate([`claimants/${this.claimantId}/payments`]);
        } else {
          this.ledgerService.reloadLedgerInfo(this.claimantId);
        }
      });
  }

  private subscribeToLedgerInfo(): void {
    combineLatest([
      this.ledgerInfo$,
      this.chartOfAccSettings$,
      this.formulaModes$,
      this.chartOfAccounts$,
      this.ledgerEntryValidationData$,
    ]).pipe(
      filter(([ledgerInfo, settings,, chartOfAccounts, ledgerEntryValidationData]) => !!ledgerInfo && !!settings && !!chartOfAccounts && !!ledgerEntryValidationData),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(async ([ledgerInfo, settings,, chartOfAccounts, ledgerEntryValidationData]) => {
      this.initValiadtionData(ledgerEntryValidationData);
      this.initSettings(settings);
      this.initLedger(ledgerInfo);
      this.initCOAs(chartOfAccounts);
      this.orgAccessOptions = ledgerInfo.orgAccessPairs;
    });
  }

  private subscribeToUpdateLedgerInfoSuccess() {
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.UpdateLedgerInfoSuccess,
      ),
    ).subscribe(() => {
      this.hasChanges = false;
      this.canEdit = false;
    });
  }

  private subscribeToUpdateLedgerInfoError(): void {
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.UpdateLedgerInfoError,
      ),
    ).subscribe(data => {
      this.isInvalid = true;
      const lienComponent = this.ledgerAccountComponents.find(i => i.accountGroup.accountGroupNo === LedgerAccountGroupEnum.Liens);
      if (lienComponent) {
        lienComponent.showErrorTooltip = true;
      }
      this.validationMessages = [data.error];
    });
  }

  private subscribeToPersonContacts() {
    this.personContacts$
      .pipe(
        filter(contact => !!contact),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(contacts => {
        this.defaultPayeeId = contacts.find(contact => contact.isPaidOnBehalfOfClaimant)?.id;
      });
  }

  private subscribeToExport(): void {
    this.store.select(exportsSelectors.isExporting)
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(result => { this.isExporting = result; });
  }

  private subscribeToFormulaSet(): void {
    this.formulaSet$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(item => { this.formulaSet = item; });
  }

  private subscribeToFormulaModes(): void {
    this.formulaModes$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(item => { this.formulaModes = item; });
  }

  private initForm(ledgerInfo: LedgerInfo) {
    this.isQsfGrossFirm = ledgerInfo.product?.id === QSFType.GrossToFirm;

    this.form.patchValue({
      formulaMode: ledgerInfo.formulaMode,
      contractFee: ledgerInfo.contractFee,
      mdlFee: ledgerInfo.mdlFee,
      cbfFeeAmount: ledgerInfo.cbfFeeAmount,
      cbfFee: ledgerInfo.cbfFee,
      product: ledgerInfo.product,
    });

    this.form.controls.formulaMode.setValidators(Validators.required);
    this.form.controls.product.setValidators(Validators.required);
    this.form.controls.contractFee.setValidators(this.getContractFeeValidators());
    this.form.controls.mdlFee.setValidators(this.getMDLValidators());
    this.form.controls.cbfFeeAmount.setValidators(this.getCBFValidators(false));
    this.form.controls.cbfFee.setValidators(this.getCBFValidators(true));
  }

  private initHeader(): void {
    this.headerElements$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(headerElements => {
        if (this.isHeaderElementsUpToDate) {
          return;
        }

        if (!this.headerElements) {
          this.headerElements = headerElements;
        }

        this.updateHeaderElements();
        this.isHeaderElementsUpToDate = true;
      });
  }

  private getCBFValidators(isCBFPecentageControl: boolean): ValidatorFn[] {
    if (!this.isCBFRequired) {
      return null;
    }

    if (isCBFPecentageControl) {
      return this.isCBFPercentageMode ? [Validators.required, Validators.max(100)] : null;
    }

    return this.isCBFPercentageMode ? null : [Validators.required];
  }

  private getMDLValidators(): ValidatorFn[] {
    if (!this.isMDLRequired) {
      return null;
    }

    const validators = <ValidatorFn[]>[Validators.required, Validators.max(100)];

    return validators;
  }

  private getContractFeeValidators(): ValidatorFn[] {
    if (!this.isAttyFeesRequired) {
      return null;
    }

    const validators = <ValidatorFn[]>[Validators.required, Validators.max(100)];

    return validators;
  }

  private hasAccGroup(accGroup: LedgerAccountGroupEnum): boolean {
    const hasActievAccSettings = this.hasActiveAccSettings(accGroup);
    const hasAccGroup = this.ledgerInfo.accountGroups?.findIndex(i => i.accountGroupNo === accGroup) !== -1;

    return hasActievAccSettings && hasAccGroup;
  }

  private updateHeaderElements(): void {
    if (!this.ledgerInfo) {
      return;
    }

    this.isHeaderElementsUpToDate = false;

    const {
      netAllocation,
      grossAllocation,
      feeExpenses,
      balance,
    } = this.ledgerInfo;

    const netAllocationDiff = grossAllocation ? (netAllocation * 100) / grossAllocation : 0;
    const isNetAllocationValid = netAllocationDiff >= this.ledgerInfo?.netAllocationThreshold;
    const legerElements: ContextBarElement[] = [
      {
        column: 'Balance',
        valueGetter: () => (balance != null ? this.currencyPipe.transform(balance) : '-'),
        errorTooltip: !!balance && 'Ledger balance is not 0',
      },
      { column: 'Gross Disbursement', valueGetter: () => this.currencyPipe.transform(grossAllocation) || '-' },
      { column: 'Fees and Expenses', valueGetter: () => this.currencyPipe.transform(feeExpenses) || '-' },
      {
        column: 'Net Disbursement',
        valueGetter: () => this.currencyPipe.transform(netAllocation),
        errorTooltip: !isNetAllocationValid ? `Net disbursement is ${netAllocationDiff.toFixed(2)}% of the Total Gross` : null,
      },

      { column: 'Disbursement Group Name', valueGetter: () => this.ledgerInfo?.disbursementGroupName },
      {
        link: {
          text: 'View Variances',
          action: this.openVariancesModal.bind(this),
          hidden: !this.ledgerInfo?.hasVariances,
          showInHeaderBar: true,
        },
        expandableIconAsValue: true,
      },
    ];

    this.store.dispatch(actions.UpdateHeader({ headerElements: [...legerElements] }));
  }

  private openVariancesModal(): void {
    this.modalService.show(VariancesModalComponent, {
      initialState: { claimantId: this.claimantId, disbursementGroupId: this.ledgerInfo.disbursementGroupId },
      class: 'modal-lg wide-modal',
    });
  }

  private openDeleteLedgerModal(): void {
    this.store.dispatch(actions.DeleteLedgerRequestPreview({
      clientId: this.claimantId,
      disbursementGroupId:
      this.ledgerInfo.disbursementGroupId,
      preview: true,
    }));
    this.modalService.show(DeleteLedgerComponent, {
      initialState: { claimantId: this.claimantId, disbursementGroupId: this.ledgerInfo.disbursementGroupId },
      class: 'modal-lg small-modal',
    });
  }

  private initActionBar(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({
      actionBar: <ActionHandlersMap>{
        back: () => this.onBackClicked(),
        edit: {
          callback: () => this.onEdit(),
          hidden: () => !this.hasAccGroups || this.canEdit || this.ledgerInfo?.stageId === ClaimSettlementLedgerStagesEnum.PaidInFull,
          permissions: PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.Edit),
        },
        save: {
          callback: () => this.save(),
          hidden: () => !this.canEdit,
          disabled: () => !this.hasChanges || this.isInvalid || !this.customFields.isValid,
          permissions: PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.Edit),
          awaitedActionTypes: [
            actions.UpdateLedgerInfoSuccess.type,
            actions.Error.type,
          ],
        },
        cancel: {
          callback: () => this.onCancel(),
          hidden: () => !this.canEdit,
        },
        closingStatementGeneration: {
          options: [
            {
              name: 'Download Closing Statement',
              callback: () => this.ledgerService.exportClosingStatement(),
            },
            {
              name: 'Settings',
              callback: () => this.ledgerService.openSettingsModal(),
              hidden: () => !this.hasAccountGroups,
              permissions: PermissionService.create(PermissionTypeEnum.ClaimantClosingStatementSettings, PermissionActionTypeEnum.Read),
            },
          ],
        },
        exporting: { hidden: () => !this.isExporting },
        collapseAll: {
          callback: () => this.toggleAllGroups(false),
          hidden: () => !this.hasAccountGroups || this.expandedGroupsSet?.size !== (this.expandableGroupsSet?.size),
        },
        expandAll: {
          callback: () => this.toggleAllGroups(true),
          hidden: () => !this.hasAccountGroups || this.expandedGroupsSet.size === (this.expandableGroupsSet?.size),
        },
        stageHistory: () => this.ledgerService.openStageHistoryModal(),
        deleteLedger: {
          callback: () => this.openDeleteLedgerModal(),
          permissions: PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.Delete),
        },
      },
    }));
  }

  private onEdit(): void {
    this.editAction().callback();
    const validationResult = this.validateAll();
    this.isInvalid = !validationResult.isValid;
    this.validationMessages = validationResult.errors;
    this.initialDataIsInvalid = this.isInvalid;
  }

  private onBackClicked(): void {
    this.pager$.pipe(
      first(),
    ).subscribe((pager: Pager) => {
      this.pager = pager;
      switch (pager.relatedPage) {
        case RelatedPage.PaymentQueue:
          if (this.ledgerInfo.projectId) {
            this.router.navigate([`/projects/${this.ledgerInfo.projectId}/payments/tabs/payment-queue`]);
          }
          break;
        case RelatedPage.LedgerSummary:
          if (this.ledgerInfo.clientId) {
            this.router.navigate([`/claimants/${this.ledgerInfo.clientId}/payments/tabs/ledger-summary`]);
          }
          break;
        default:
          this.store.dispatch(GotoParentView());
          break;
      }
    });
  }

  private toggleAllGroups(expand: boolean): void {
    this.expandedGroupsSet.clear();

    if (expand) {
      this.expandedGroupsSet = new Set(this.expandableGroupsSet);
    }

    this.detectChanges();
  }

  private async recalculateLedger(canRecalc: boolean): Promise<void> {
    const formValues = this.form?.value;

    if (!this.ledgerInfo) {
      this.ledgerInfo = <LedgerInfo>{};
      this.ledgerInfo.accountGroups = [];
    }

    this.isQsfGrossFirm = formValues?.product?.id === QSFType.GrossToFirm;
    if (this.isQsfGrossFirm) {
      const formulaMode = IdValue.filterFromArray(this.formulaModes, FormulaModeEnum.Fee);
      this.form.patchValue({ formulaMode });
    }

    this.ledgerInfo.id = this.ledgerId;
    this.ledgerInfo.clientId = this.claimantId;
    this.ledgerInfo.formulaMode = formValues?.formulaMode;
    this.ledgerInfo.contractFee = formValues?.contractFee;
    this.ledgerInfo.mdlFee = formValues?.mdlFee;
    this.ledgerInfo.cbfFeeAmount = formValues?.cbfFeeAmount;
    this.ledgerInfo.cbfFee = formValues?.cbfFee;
    this.ledgerInfo.product = formValues?.product;

    await this.calcByFormula(this.ledgerInfo, this.chartOfAccSettings, canRecalc);
  }

  private syncAccountGroups(changedGroup: LedgerAccountGroup): void {
    const group = this.ledgerInfo.accountGroups?.find(g => g.accountNo === changedGroup.accountNo);

    if (group) {
      Object.assign(group, changedGroup);
    }
  }

  private addAccount(accountGroup: LedgerAccountGroupEnum): void {
    const component = this.ledgerAccountComponents.find(i => i.accountGroup.accountGroupNo === accountGroup);
    component.addAccount(accountGroup);
  }

  private readonly AMOUNTS_WILL_NOT_RECALC: string = 'Amounts will not recalculate until all errors are resolved.';

  private validateAll(): ValidationResult {
    this.detectChanges();

    const errors: string[] = [];
    let isValid = super.validate();
    if (!isValid) {
      errors.push(this.AMOUNTS_WILL_NOT_RECALC);
    }

    // Validate Ledger groups
    for (const group of this.ledgerAccountComponents) {
      const localValidation = group.validateAll();
      isValid = isValid && localValidation;

      if (!localValidation) {
        if (group.accountGroup.accountGroupNo === LedgerAccountGroupEnum.Liens) {
          const errorMsg = this.getLiensErrorMessageLienResolutionON(group);
          if (errorMsg) {
            errors.push(errorMsg);
          }
        } else {
          errors.push(this.AMOUNTS_WILL_NOT_RECALC);
        }
      }

      if (group.accountGroup.accountGroupNo === LedgerAccountGroupEnum.Liens && !this.validateLienCredits) {
        const errorMsg = this.getLiensErrorMessageLienResolutionOFF(group);
        if (errorMsg) {
          isValid = false;
          group.showErrorTooltip = true;
          errors.push(errorMsg);
        } else {
          group.showErrorTooltip = false;
        }
      }
    }

    this.detectChanges();

    if (isValid) {
      const lienComponent = this.ledgerAccountComponents.find(i => i.accountGroup.accountGroupNo === LedgerAccountGroupEnum.Liens);
      if (lienComponent && lienComponent.showErrorTooltip) {
        lienComponent.showErrorTooltip = false;
      }
    }

    return new ValidationResult(isValid, errors);
  }

  private getLiensErrorMessageLienResolutionON(group: LedgerAccountGroupComponent): string {
    const entries = group.validationForm.get('accounts.0.entries') as FormArray;
    if (!entries) return null;

    let lienIdRequiredValid = true;
    entries.controls.forEach((entry: AbstractControl) => {
      lienIdRequiredValid = lienIdRequiredValid && !entry.getError('required', 'relatedEntityId');
    });

    if (!lienIdRequiredValid) return 'All Liens entries must contains Lien Id.';

    return this.AMOUNTS_WILL_NOT_RECALC;
  }

  private getLiensErrorMessageLienResolutionOFF(group: LedgerAccountGroupComponent): string {
    const entries = group.validationForm.get('accounts.0.entries') as FormArray;
    if (entries) {
      let countNoLienId = 0;
      for (let index = 0; index < entries.controls.length; index++) {
        const elem = entries.controls[index];
        if (elem && (elem.value?.accountNo == LedgerAccountEnum.LienCredit) && !elem.value?.relatedEntityId) {
          countNoLienId++;
        }
      }
      if (countNoLienId > 1) {
        return 'Only one Lien Credit entry with no Lien Id is allowed.';
      }
    }
    return null;
  }

  private detectChanges(): void {
    for (const group of this.ledgerAccountComponents) {
      group.detectChanges();
    }

    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      this.changeRef.detectChanges();
    }
  }

  private detectChangedAccGroups(ledgerInfo: LedgerInfo, oldAccGroups: LedgerAccountGroup[]): void {
    for (const oldAccGroup of oldAccGroups) {
      const newAccGroup = ledgerInfo.accountGroups.find(i => i.accountGroupNo === oldAccGroup.accountGroupNo);
      const newGroupEntries = [].concat(...newAccGroup.accounts.map(i => i.entries));
      const oldGroupEntries = [].concat(...oldAccGroup.accounts.map(i => i.entries));

      if (newGroupEntries.length !== oldGroupEntries.length || !this.ledgerService.areEntriesEqual(oldGroupEntries, newGroupEntries)) {
        this.hasChanges = true;
      }
    }
  }

  // #endregion Private methods
}
