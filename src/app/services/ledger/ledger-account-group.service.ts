import { Injectable } from '@angular/core';
import { ChartOfAccount, ChartOfAccountSettings, LedgerAccount, LedgerAccountGroup, LedgerEntry } from '@app/models/closing-statement';
import { AttyFirmFees, ClaimSettlementLedgerEntryStatus, EntityTypeEnum, LedgerAccountEnum, LedgerAccountGroup as LedgerAccountGroupEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { IdValue } from '@app/models';
import { HashTable } from '@app/models/hash-table';
import groupBy from 'lodash-es/groupBy';
import { PercentageHelper } from '@app/helpers';
import { LogService } from '../log-service';
import { ClaimantLedgerService } from './ledger.service';
import { PermissionService } from '../permissions.service';
import { LedgerEntryService } from '../ledger-entry.service';

@Injectable()
export class LedgerAccountGroupService {
  constructor(
    private readonly logger: LogService,
    private readonly ledgerService: ClaimantLedgerService,
    private readonly ledgerEntryService: LedgerEntryService,
    private permissionService: PermissionService,
  ) {
  }

  public log(msg: string): void {
    this.logger.log(msg);
  }

  public getPermission(actionType: PermissionActionTypeEnum, accountGroup: LedgerAccountGroup): string {
    let entryType: PermissionTypeEnum;

    switch (accountGroup.accountGroupNo) {
      case LedgerAccountGroupEnum.AwardFunding:
        entryType = PermissionTypeEnum.LedgerAwardFundingAccGroup;
        break;
      case LedgerAccountGroupEnum.MDL:
        entryType = PermissionTypeEnum.LedgerMDLAccGroup;
        break;
      case LedgerAccountGroupEnum.CommonBenefit:
        entryType = PermissionTypeEnum.LedgerCBFAccGroup;
        break;
      case LedgerAccountGroupEnum.AttyFees:
        entryType = PermissionTypeEnum.LedgerAttyFeesAccGroup;
        break;
      case LedgerAccountGroupEnum.AttyExpenses:
        entryType = PermissionTypeEnum.LedgerAttyExpensesAccGroup;
        break;
      case LedgerAccountGroupEnum.Liens:
        entryType = PermissionTypeEnum.LedgerLiensAccGroup;
        break;
      case LedgerAccountGroupEnum.ARCHERFees:
        entryType = PermissionTypeEnum.LedgerARCHERFeesAccGroup;
        break;
      case LedgerAccountGroupEnum.OtherFees:
        entryType = PermissionTypeEnum.LedgerOtherFeesAccGroup;
        break;
      case LedgerAccountGroupEnum.ClaimantDisbursements:
        entryType = PermissionTypeEnum.LedgerClaimantDisbursementsAccGroup;
        break;
      case LedgerAccountGroupEnum.ThirdPartyPMTS:
        entryType = PermissionTypeEnum.ThirdPartyPMTSAccGroup;
        break;
    }

    return PermissionService.create(entryType, actionType);
  }

  public canShowEntryModal(item: LedgerEntry): boolean {
    return !!item.id;
  }

  // Get Related EntityTypeId by accountGroupNo
  public getRelatedEntityTypeId(account: LedgerEntry | LedgerAccount): EntityTypeEnum {
    return this.ledgerEntryService.canEditRelatedEntity(account) ? EntityTypeEnum.LienProducts : null;
  }

  public getChartOfAccountTitle(item: ChartOfAccount): IdValue {
    return <IdValue>{ id: item.id, name: `${item.accountNo} - ${item.name}` };
  }

  // Check by status If entry can be updated
  public canUpdateEntryByStatus(entry: LedgerEntry): boolean {
    return (entry.statusId === ClaimSettlementLedgerEntryStatus.Pending
    || entry.statusId === ClaimSettlementLedgerEntryStatus.NonPayable
    || entry.statusId === ClaimSettlementLedgerEntryStatus.PaymentAuthorized
    || entry.statusId === ClaimSettlementLedgerEntryStatus.PaymentAuthorizedPartial
    || (!entry.statusId && entry.accountGroupNo === LedgerAccountGroupEnum.AttyExpenses))
    && (!this.ledgerService.isFormuslaSetV2 || entry.postedLedgerEntryId === null);
  }

  public canViewInLPM(item: LedgerEntry): boolean {
    if (item.accountNo === LedgerAccountEnum.LienCreditFromHoldback
        || item.accountNo === LedgerAccountEnum.LiensTotal
        || item.accountNo === LedgerAccountEnum.MedLienHoldback) { return false; }

    const hasPermissions = this.permissionService.has(PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.ViewInLPM));

    return item.accountGroupNo === LedgerAccountGroupEnum.Liens && !!item.relatedEntityId && hasPermissions;
  }

  // Get Total Percentages for each account grouped by postedLedgerEntryId
  public getGroupedTotalPercentage(account: LedgerAccount, attyFeesAccounts: LedgerAccount[]): HashTable<number> {
    const groupedArray: { [key: number]: LedgerEntry[]; } = groupBy(account?.entries, 'postedLedgerEntryId');
    const groupedPercentage: HashTable<number | null> = {};
    for (const key in groupedArray) {
      if (groupedArray.hasOwnProperty(key)) {
        groupedPercentage[key] = account.accountGroupNo === LedgerAccountGroupEnum.AttyFees
          ? this.getCurrentAttyFeesTotalPercentage(attyFeesAccounts)
          : PercentageHelper.truncate(groupedArray[key].map((e: LedgerEntry) => +e.percentage).reduce((a: number, b: number) => a + b, 0), this.ledgerService.percentFractionDigits);
      }
    }
    return groupedPercentage;
  }

  // Custom Calculation Atty Fees Total Percentage (Sum of PrimaryFirmFees, ReferringFirmFees, SettlementFirmFees)
  public getCurrentAttyFeesTotalPercentage(attyFeesAccounts: LedgerAccount[]): number {
    let entries: LedgerEntry[] = [];
    attyFeesAccounts.forEach((accountItem: LedgerAccount) => {
      entries.push(...accountItem.entries);
    });
    if (this.ledgerService.isFormuslaSetV2) {
      entries = entries.filter((i: LedgerEntry) => !i.postedLedgerEntryId);
    }
    const total = entries.map((e: LedgerEntry) => +e.percentage).reduce((a: number, b: number) => a + b, 0);
    return PercentageHelper.truncate(total, this.ledgerService.percentFractionDigits);
  }

  // Calc Current Total Fee Percentage
  public currentTotalPercentage(account: LedgerAccount, accountGroup: LedgerAccountGroup, currentValue?: number): number {
    // Return current value from form -  if Formula set V1
    const attyFeesAccounts = accountGroup.accounts.filter((i: LedgerAccount) => Object.values(AttyFirmFees).includes(i.accountNo));
    if (!this.ledgerService.isFormuslaSetV2) {
      const value = currentValue ?? account.totalPercentage;
      return account.accountGroupNo === LedgerAccountGroupEnum.AttyFees ? this.getCurrentAttyFeesTotalPercentage(attyFeesAccounts) : value;
    }
    // Return current grouped value by postedLedgerEntryId (V2)
    const currentAccount = accountGroup.accounts.find((i: LedgerAccount) => i.accountNo === account.accountNo);
    const groupedTotalPercentage = this.getGroupedTotalPercentage(currentAccount, attyFeesAccounts);
    return groupedTotalPercentage.null;
  }

  // Get Default Entry status by COA settings
  public getDefaultEntryStatus(accNo: string, chartOfAccSettings: ChartOfAccountSettings[]): ClaimSettlementLedgerEntryStatus {
    const accSettings = chartOfAccSettings?.find((i: ChartOfAccountSettings) => i.caseId === this.ledgerService.projectId && i.chartOfAccount?.accountNo === accNo);
    const isPaymentEnabled = accSettings?.chartOfAccount?.isPaymentEnabledRequired ?? accSettings?.paymentEnabled;

    return isPaymentEnabled
      ? ClaimSettlementLedgerEntryStatus.Pending
      : ClaimSettlementLedgerEntryStatus.NonPayable;
  }
}
