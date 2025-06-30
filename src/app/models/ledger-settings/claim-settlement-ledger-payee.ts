import { Address } from '../address';
import { BankAccount } from '../bank-account';
import { Email } from '../email';
import { EntityTypeEnum, PaymentMethodEnum } from '../enums';

export class ClaimSettlementLedgerPayee {
  id: number;
  displayName: string;
  nameOnCheck: string;
  suffix?: string;
  role: string;
  entityType: EntityTypeEnum;
  defaultPaymentMethodId: PaymentMethodEnum;
  primaryBankAccountId: number;
  primaryAddressId: number;
  primaryEmailId: number;
  addresses: Address[];
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankAccounts: BankAccount[];
  emails: Email[];
  memoText: string;
  deleted: boolean;
  active: boolean;
  percentage?: number;
  amount?: number;
  statusId?: number;
  statusName?: string;
  furtherCreditAccount?: string;
  qsfOrgId?: number;
  qsfBankAccountId?: number;
  transferFFC?: string;
  transferToSubAccount?: boolean;
  transferQSFBankAccountName?: string;
  transferQSFBankAccountNumber?: string;


  static toModel(item: any): ClaimSettlementLedgerPayee {
    return {
      id: item.id,
      displayName: item.displayName,
      nameOnCheck: item.nameOnCheck,
      suffix: item.suffix,
      role: item.role,
      entityType: item.entityType,
      defaultPaymentMethodId: item.defaultPaymentMethodId,
      primaryBankAccountId: item.primaryBankAccountId,
      primaryAddressId: item.primaryAddressId,
      primaryEmailId: item.primaryEmailId,
      addresses: item.addresses ? item.addresses.map(Address.toModel) : [],
      bankAccounts: item.bankAccounts ? item.bankAccounts.map(BankAccount.toModel) : [],
      emails: item.emails || [],
      memoText: item.memoText,
      deleted: item.deleted,
      active: item.active,
      percentage: item.percentage,
      amount: item.amount,
      statusId: item.statusId,
      statusName: item.statusName,
      furtherCreditAccount: item.furtherCreditAccount,
      qsfOrgId: item.qsfOrgId,
      qsfBankAccountId: item.qsfBankAccountId,
      transferFFC: item.transferFFC,
      transferToSubAccount: item.transferToSubAccount ?? item.transferQSFOrg != null,
      transferQSFBankAccountName: item.transferQSFBankAccountName,
      transferQSFBankAccountNumber: item.transferQSFBankAccountNumber,
      bankAccountName: item.bankAccountName,
      bankAccountNumber: item.bankAccountNumber
    };
  }
}
