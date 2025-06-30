/* eslint-disable import/no-cycle */
import { v4 as uuid } from 'uuid';
import { IdValue } from '../idValue';
import { EntityTypeEnum } from '../enums';
import { LedgerAccountGroup } from './ledger-account-group';
import { ClaimSettlementLedgerEntry } from './claim-settlement-ledger-entry';
import { ChartOfAccount } from './chart-of-account';

export class LedgerEntry implements IdValue {
  id: number;
  uuid: string; // To support duplicate entries
  name: string;
  description: string;
  amount: number;
  paidAmount: number;
  transactionDate: Date;
  lastModifiedDate: Date;
  createdDate: Date;
  percentage: number;
  accountNo: string;
  accountGroupNo: string;
  chartOfAccountId: number;
  claimSettlementLedgerId: number;
  statusId: number;
  status: IdValue;
  payeeOrgId: number;
  payeeName: string;
  splitTypeId: number;
  accountType: string;
  active: boolean;
  externalSourceEntityTypeId: EntityTypeEnum;
  externalSourceEntityId: number;
  relatedEntityTypeId: EntityTypeEnum;
  relatedEntityId: number;
  postedLedgerEntryId: number;
  postedDate: Date;
  includeInGLBalance?: boolean;
  payeeNotExist: boolean;
  canEditAuthorizedAttyFeesPercentage?: boolean;
  canEditAttyFields?: boolean;

  public static toModel(item: any): LedgerEntry {
    if (item) {
      return {
        id: item.id,
        uuid: item.uuid || uuid(), // To support duplicate entries
        name: item.name,
        description: item.description,
        amount: +item.amount,
        paidAmount: +item.paidAmount,
        transactionDate: item.transactionDate,
        lastModifiedDate: item.lastModifiedDate,
        createdDate: item.createdDate,
        percentage: +item.percentage,
        accountNo: item.accountNo,
        accountGroupNo: item.accountGroupNo,
        chartOfAccountId: item.chartOfAccountId,
        claimSettlementLedgerId: item.claimSettlementLedgerId,
        statusId: item.statusId,
        status: item.status,
        payeeOrgId: item.payeeOrgId,
        payeeName: item.payeeName,
        splitTypeId: item.splitTypeId,
        accountType: item.accountType,
        active: item.active,
        externalSourceEntityTypeId: item.externalSourceEntityTypeId,
        externalSourceEntityId: item.externalSourceEntityId,
        relatedEntityId: item.relatedEntityId,
        relatedEntityTypeId: item.relatedEntityId ? item.relatedEntityTypeId : null,
        postedLedgerEntryId: item.postedLedgerEntryId,
        postedDate: item.postedDate,
        includeInGLBalance: item.includeInGLBalance,
        payeeNotExist: item.payeeNotExist,
        canEditAuthorizedAttyFeesPercentage: item.canEditAuthorizedAttyFeesPercentage,
        canEditAttyFields: item.canEditAttyFields,
      };
    }

    return null;
  }

  public static toFlatList(accountGroups: LedgerAccountGroup[]): ClaimSettlementLedgerEntry[] {
    if (accountGroups) {
      const claimSettlementLedgerEntry: ClaimSettlementLedgerEntry[] = [];

      for (const accGr of accountGroups) {
        for (const acc of accGr.accounts) {
          const mappedEntries = acc.entries.map(LedgerEntry.toClaimSettlementLedgerEntryModel);
          claimSettlementLedgerEntry.push(...mappedEntries);
        }
      }

      return claimSettlementLedgerEntry;
    }

    return null;
  }

  static toClaimSettlementLedgerEntryModel(item: LedgerEntry): ClaimSettlementLedgerEntry {
    if (item) {
      return {
        id: item.id,
        uuid: item.uuid,
        name: item.name,
        description: item.description,
        amount: item.amount,
        percentage: item.percentage / 100,
        paidAmount: item.paidAmount,
        transactionDate: item.transactionDate,
        lastModifiedDate: item.lastModifiedDate,
        createdDate: item.createdDate,
        accountNo: item.accountNo,
        accountGroupNo: item.accountGroupNo,
        chartOfAccountId: item.chartOfAccountId,
        claimSettlementLedgerId: item.claimSettlementLedgerId,
        statusId: item.statusId,
        status: item.status,
        payeeOrgId: item.payeeOrgId,
        payeeName: item.payeeName,
        accountType: item.accountType,
        includeInGLBalance: item.includeInGLBalance,
        active: item.active,
        splitTypeId: item.splitTypeId,
        externalSourceEntityTypeId: item.externalSourceEntityTypeId,
        externalSourceEntityId: item.externalSourceEntityId,
        relatedEntityId: item.relatedEntityId,
        relatedEntityTypeId: item.relatedEntityTypeId,
        postedLedgerEntryId: item.postedLedgerEntryId,
        postedDate: item.postedDate,
        chartOfAccount: LedgerEntry.toChatOfAccount(item),
        payeeNotExist: item.payeeNotExist,
        canEditAuthorizedAttyFeesPercentage: item.canEditAuthorizedAttyFeesPercentage,
        canEditAttyFields: item.canEditAttyFields,
      };
    }

    return null;
  }

  static toChatOfAccount(item: LedgerEntry): ChartOfAccount {
    if (item) {
      const coa = ChartOfAccount.toModel(item);
      coa.id = item.chartOfAccountId;

      return coa;
    }

    return null;
  }
}
