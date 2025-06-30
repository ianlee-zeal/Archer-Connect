import { IdValue } from '../idValue';
import { EntityTypeEnum } from '../enums';
import { ChartOfAccount } from './chart-of-account';

export class ClaimSettlementLedgerEntry implements IdValue {
  id: number;
  uuid: string; // To support duplicate entries
  name: string;
  description: string;
  amount: number;
  percentage: number;
  paidAmount: number;
  transactionDate: Date;
  lastModifiedDate: Date;
  createdDate: Date;
  accountNo: string;
  accountGroupNo: string;
  chartOfAccountId: number;
  claimSettlementLedgerId: number;
  statusId: number;
  status: IdValue;
  payeeOrgId: number;
  payeeName: string;
  accountType: string;
  includeInGLBalance: boolean;
  active: boolean;
  externalSourceEntityTypeId: EntityTypeEnum;
  externalSourceEntityId: number;
  relatedEntityTypeId: EntityTypeEnum;
  relatedEntityId: number;
  postedLedgerEntryId: number;
  postedDate: Date;
  chartOfAccount: ChartOfAccount;
  splitTypeId: number;
  payeeNotExist: boolean;
  canEditAuthorizedAttyFeesPercentage?: boolean;
  canEditAttyFields?: boolean;

  public static toModel(item: any): ClaimSettlementLedgerEntry {
    if (item) {
      return {
        id: item.id,
        uuid: item.uuid,
        name: item.name,
        description: item.description,
        amount: +item.amount,
        percentage: +item.percentage,
        paidAmount: +item.paidAmount,
        transactionDate: item.transactionDate,
        createdDate: item.createdDate,
        lastModifiedDate: item.lastModifiedDate,
        accountNo: item.accountNo,
        accountGroupNo: item.accountGroupNo,
        chartOfAccountId: item.chartOfAccountId,
        claimSettlementLedgerId: item.claimSettlementLedgerId,
        status: item.status,
        statusId: item.statusId,
        payeeOrgId: item.payeeOrgId,
        payeeName: item.payeeName,
        accountType: item.accountType,
        includeInGLBalance: item.includeInGLBalance,
        active: item.active,
        splitTypeId: item.splitTypeId,
        externalSourceEntityTypeId: item.externalSourceEntityTypeId,
        externalSourceEntityId: item.externalSourceEntityId,
        relatedEntityTypeId: item.relatedEntityTypeId,
        relatedEntityId: item.relatedEntityId,
        postedLedgerEntryId: item.postedLedgerEntryId,
        postedDate: item.postedDate,
        chartOfAccount: ChartOfAccount.toModel(item.chartOfAccount),
        payeeNotExist: item.payeeNotExist,
        canEditAuthorizedAttyFeesPercentage: item.canEditAuthorizedAttyFeesPercentage,
        canEditAttyFields: item.canEditAttyFields,
      };
    }

    return null;
  }
}
